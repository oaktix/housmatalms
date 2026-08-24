import * as seeds from "./mockData";
import { phase1Curriculum, hcpaCurriculum } from "./curriculum";
import { generatedQuizzesHCPA, generatedQuizQuestionsHCPA } from "./generatedQuizzesHCPA";

export interface SurveyResponse {
  id: string;
  user_id: string;
  type: "pre" | "post";
  answers: Record<string, number>;
  submitted_at: string;
}

// The browser never talks to Supabase directly anymore. All reads/writes go
// through /api/db/[table], a server route authenticated with the service-role
// key (see src/app/api/db/[table]/route.ts). Only the URL is needed here to
// decide whether server persistence is available.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-project-id.supabase.co";

// Helper to check if running in browser
const isBrowser = typeof window !== "undefined";

// Normalization Helpers to bridge UI (module-X) and DB (p1-mX) module IDs
function normalizeToDbModuleId(moduleId?: string): string | undefined {
  if (!moduleId) return undefined;
  // UI: "module-hcpa-1" → DB: "hcpa-m1"
  const hcpaMatch = moduleId.match(/^module-hcpa-(\d+)$/);
  if (hcpaMatch) {
    return `hcpa-m${hcpaMatch[1]}`;
  }
  // UI: "module-1" → DB: "p1-m1"
  const p1Match = moduleId.match(/^module-(\d+)$/);
  if (p1Match) {
    return `p1-m${p1Match[1]}`;
  }
  return moduleId;
}

function normalizeToUiModuleId(moduleId?: string): string | undefined {
  if (!moduleId) return undefined;
  // DB: "hcpa-m1" → UI: "module-hcpa-1"
  const hcpaMatch = moduleId.match(/^hcpa-m(\d+)$/);
  if (hcpaMatch) {
    return `module-hcpa-${hcpaMatch[1]}`;
  }
  // DB: "p1-m1" → UI: "module-1"
  const p1Match = moduleId.match(/^p1-m(\d+)$/);
  if (p1Match) {
    return `module-${p1Match[1]}`;
  }
  return moduleId;
}

// RFC 4122 v4 compliant UUID generator
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Server DB proxy helpers
//
// These replace the old direct supabase-js client calls. Unlike before,
// failures THROW so callers can surface them (the silent-failure workaround is
// what hid the outage that made instructor dashboards go empty).
// ---------------------------------------------------------------------------

type DbSelectOptions = {
  columns?: string;
  filters?: Record<string, string>;
  order?: string;
  limit?: number;
};

async function apiSelect<T>(table: string, opts: DbSelectOptions = {}): Promise<T[]> {
  const params = new URLSearchParams();
  if (opts.columns) params.set("columns", opts.columns);
  if (opts.filters) {
    for (const [key, value] of Object.entries(opts.filters)) params.set(key, value);
  }
  if (opts.order) params.set("order", opts.order);
  if (opts.limit) params.set("limit", String(opts.limit));

  const res = await fetch(`/api/db/${encodeURIComponent(table)}?${params.toString()}`, {
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Failed to read '${table}' (HTTP ${res.status})`);
  }
  return ((json.data as T[]) || []);
}

/** Select a single row by filters. Returns null when no row matches. */
async function apiSelectOne<T>(
  table: string,
  opts: DbSelectOptions = {}
): Promise<T | null> {
  const params = new URLSearchParams({ single: "1" });
  if (opts.columns) params.set("columns", opts.columns);
  if (opts.filters) {
    for (const [key, value] of Object.entries(opts.filters)) params.set(key, value);
  }

  const res = await fetch(`/api/db/${encodeURIComponent(table)}?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  if (!json?.success) return null;
  return (json.data as T) ?? null;
}

async function apiWrite(
  table: string,
  records: unknown[],
  mode: "insert" | "upsert",
  onConflict?: string
): Promise<void> {
  const res = await fetch(`/api/db/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ records, mode, onConflict }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Failed to write '${table}' (HTTP ${res.status})`);
  }
}

async function apiDeleteEq(table: string, filters: Record<string, string>): Promise<void> {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/db/${encodeURIComponent(table)}?${params.toString()}`, {
    method: "DELETE",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || `Failed to delete from '${table}' (HTTP ${res.status})`);
  }
}

// LocalStorage Mock DB implementation with Supabase Synchronization
class LocalStorageDB {
  private isSupabase = false;
  private listeners = new Set<() => void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private memoryCache: Record<string, any> = {};
  // Guards against overlapping / storm-triggered syncs
  private isSyncing = false;
  public hasSynced = false;

  constructor() {
    // Only pull data in the browser. During SSR/prerendering there is no
    // session or localStorage, and the relative /api/db URLs cannot be
    // fetched from the server side.
    if (isBrowser && isSupabaseConfigured) {
      this.isSupabase = true;
      this.syncFromSupabase();
    }
  }

  generateUUID(): string {
    return generateUUID();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error invoking DB subscriber:", err);
      }
    });
  }

  async sync() {
    if (this.isSupabase) {
      await this.syncFromSupabase();
    }
  }

  private async syncFromSupabase() {
    if (!this.isSupabase) return;
    // In-flight guard: skip if a sync is already running to prevent storms
    if (this.isSyncing) {
      console.log("Sync already in progress — skipping duplicate trigger.");
      return;
    }
    this.isSyncing = true;
    try {
      console.log("Synchronizing data from Supabase...");

      // 1. Fetch profiles from Supabase
      const profiles = await apiSelect<seeds.Profile>("profiles");
      this.set("lms_profiles", profiles);

      // If Supabase has no profiles, seed it with default profiles
      if (profiles.length === 0) {
        await this.seedSupabase();
        // Re-fetch profiles after seeding
        const seededProfiles = await apiSelect<seeds.Profile>("profiles");
        this.set("lms_profiles", seededProfiles);
      }

      // 2. Fetch other tables.
      //
      // EGRESS OPTIMISATION: For heavy tables we select only the columns needed
      // for list/summary views. In particular `submissions.content_link` can
      // hold large base64 PDF blobs (legacy) or Cloudinary URLs — pulling it on
      // every full sync was blowing the Supabase egress quota. The actual file
      // is fetched lazily via getSubmissionFile() only when a reviewer opens it.
      const tables: { name: string; key: string; columns?: string }[] = [
        { name: "instructors", key: "lms_instructors" },
        { name: "applications", key: "lms_applications" },
        { name: "cohorts", key: "lms_cohorts" },
        { name: "cohort_members", key: "lms_cohort_members" },
        {
          name: "submissions",
          key: "lms_submissions",
          // Exclude the heavy content_link (base64/URL) and content_text.
          columns:
            "id,assignment_id,user_id,content_file_name,content_public_id,grade,feedback,status,submitted_at",
        },
        { name: "quiz_attempts", key: "lms_quiz_attempts" },
        { name: "meetings", key: "lms_meetings" },
        { name: "attendance", key: "lms_attendance" },
        { name: "certificates", key: "lms_certificates" },
        { name: "graduate_status", key: "lms_graduate_status" },
        { name: "student_progress", key: "lms_progress" },
        { name: "email_logs", key: "lms_email_logs" },
        { name: "announcements", key: "lms_announcements" },
        { name: "survey_responses", key: "lms_survey_responses" }
      ];

      for (const t of tables) {
        try {
          const data = await apiSelect<Record<string, unknown>>(t.name, { columns: t.columns });
          if (t.name === "submissions") {
            // Deduplicate: keep only the most recent submission per (assignment_id, user_id).
            const deduped = Object.values(
              (data as unknown as seeds.Submission[]).reduce<Record<string, seeds.Submission>>((acc, sub) => {
                const key = `${sub.assignment_id}__${sub.user_id}`;
                if (!acc[key] || new Date(sub.submitted_at) > new Date(acc[key].submitted_at)) {
                  acc[key] = sub;
                }
                return acc;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }, {} as any)
            );
            this.set(t.key, deduped);
          } else {
            // Supabase is the source of truth — overwrite local cache with remote data.
            this.set(t.key, data);
          }
        } catch (tblErr) {
          console.warn(`[Sync] Skipping table '${t.name}':`, tblErr);
        }
      }

      console.log("Supabase synchronization successfully completed.");

      // Trigger UI updates safely (only on success)
      if (isBrowser) {
        try {
          window.dispatchEvent(
            new StorageEvent("storage", {
              key: null,
              newValue: null,
              storageArea: localStorage,
            })
          );
        } catch (err) {
          console.warn("[Storage Event Exception] Caught dispatch error:", err);
        }
      }
      this.hasSynced = true;
      this.notify();
    } catch (e) {
      console.error("Failed to sync from Supabase:", e);
    } finally {
      // Always release the guard so future syncs can run
      this.isSyncing = false;
    }
  }

  private async seedSupabase(profilesToSeed?: seeds.Profile[]) {
    if (!this.isSupabase) return;
    const isFullSeed = !profilesToSeed;
    const targetProfiles = profilesToSeed || seeds.seedProfiles;
    console.log(isFullSeed ? "Full Supabase seed starting..." : `Inserting ${targetProfiles.length} missing profile(s)...`);

    try {
      await apiWrite("profiles", targetProfiles, "upsert", "email");
    } catch (e) {
      console.error("Error seeding profiles:", e);
    }

    try {
      await apiWrite(
        "instructors",
        seeds.seedInstructors.map(inst => ({
          profile_id: inst.profile_id,
          full_name: inst.full_name,
          bio: inst.bio,
          qualifications: inst.qualifications,
          awards: inst.awards,
          philosophy: inst.philosophy
        })),
        "insert"
      );
    } catch (e) {
      console.error("Error seeding instructors:", e);
    }

    try {
      await apiWrite(
        "cohorts",
        seeds.seedCohorts.map(coh => ({
          id: coh.id,
          name: coh.name,
          start_date: coh.start_date,
          end_date: coh.end_date,
          active: coh.active,
          capacity: coh.capacity,
          instructor_id: coh.instructor_id
        })),
        "insert"
      );
    } catch (e) {
      console.error("Error seeding cohorts:", e);
    }

    try {
      await apiWrite("cohort_members", seeds.seedCohortMembers, "insert");
    } catch (e) {
      console.error("Error seeding cohort members:", e);
    }

    console.log("Supabase seeding completed.");
  }

  /**
   * Persist a record to the server DB. Returns true on success; on failure it
   * logs loudly and returns false — the local write has already happened, so
   * callers decide whether the failure is user-facing (e.g. assignment
   * submissions throw so students know their work was NOT saved).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async saveToSupabase(table: string, record: any, isInsert: boolean = false): Promise<boolean> {
    if (!this.isSupabase) return false;
    try {
      await apiWrite(table, [record], isInsert ? "insert" : "upsert");
      return true;
    } catch (err) {
      console.error(`[DB] Failed to persist '${table}' to server (kept locally):`, err);
      return false;
    }
  }

  private get<T>(key: string, defaultValue: T[]): T[] {
    if (this.memoryCache[key] !== undefined) {
      return this.memoryCache[key];
    }
    if (!isBrowser) return defaultValue;
    const data = localStorage.getItem(key);
    if (!data) {
      try {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      } catch (err) {
        console.warn(`[LocalStorage Write Failed in Get] key: ${key}`, err);
      }
      this.memoryCache[key] = defaultValue;
      return defaultValue;
    }
    try {
      const parsed = JSON.parse(data);
      this.memoryCache[key] = parsed;
      return parsed;
    } catch {
      this.memoryCache[key] = defaultValue;
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T[]): void {
    this.memoryCache[key] = value;
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        console.warn(`[LocalStorage Quota Exceeded] Could not write key '${key}' to LocalStorage. Relying on Supabase/in-memory cache.`);
        if (!this.isSupabase) {
          throw new Error("Storage quota exceeded. Your file may be too large. Please try a smaller file (under 4 MB).");
        }
      } else {
        throw err;
      }
    }
  }

  getProfiles(): seeds.Profile[] {
    // Use seed profiles as fallback when Supabase is configured but sync hasn't completed
    // or when profiles table is empty. This ensures login works for seed users even if
    // Supabase sync is slow or fails.
    const defaultProfiles = this.isSupabase && !this.hasSynced ? seeds.seedProfiles : (this.isSupabase ? [] : seeds.seedProfiles);
    return this.get<seeds.Profile>("lms_profiles", defaultProfiles);
  }

  getProfile(id: string): seeds.Profile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  getProfileByEmail(email: string): seeds.Profile | undefined {
    return this.getProfiles().find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  async createProfile(profile: seeds.Profile): Promise<seeds.Profile> {
    const list = this.getProfiles();
    // Deduplicate by both id AND email to prevent duplicate profiles
    const alreadyExists = list.some(
      (p) => p.id === profile.id || p.email.toLowerCase() === profile.email.toLowerCase()
    );
    if (!alreadyExists) {
      list.push(profile);
      this.set("lms_profiles", list);
      await this.saveToSupabase("profiles", profile);
    }
    return profile;
  }

  updateProfile(profile: seeds.Profile): seeds.Profile {
    const list = this.getProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...profile };
      this.set("lms_profiles", list);
      this.saveToSupabase("profiles", profile);
    }
    return profile;
  }

  deleteProfile(id: string): void {
    const list = this.getProfiles();
    const updatedList = list.filter((p) => p.id !== id);
    this.set("lms_profiles", updatedList);

    // Cascading cleanups
    this.deleteInstructorByProfile(id);
    this.deleteCohortMember(id);
    this.deleteGraduateStatus(id);
    this.deleteStudentProgress(id);
    this.deleteStudentSubmissions(id);
    this.deleteStudentQuizAttempts(id);
    this.deleteStudentCertificates(id);
    this.deleteStudentAttendance(id);

    apiDeleteEq("profiles", { id }).catch((err) =>
      console.error(`Failed to delete profile ${id} from server:`, err)
    );
  }

  deleteInstructorByProfile(profileId: string): void {
    const list = this.getInstructors();
    const updatedList = list.filter((i) => i.profile_id !== profileId);
    this.set("lms_instructors", updatedList);
    apiDeleteEq("instructors", { profile_id: profileId }).catch((err) =>
      console.error(`Failed to delete instructor ${profileId} from server:`, err)
    );
  }

  deleteGraduateStatus(userId: string): void {
    const list = this.get<seeds.GraduateStatus>("lms_graduate_status", []);
    const updatedList = list.filter((g) => g.user_id !== userId);
    this.set("lms_graduate_status", updatedList);
    apiDeleteEq("graduate_status", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete graduate status for ${userId} from server:`, err)
    );
  }

  deleteStudentProgress(userId: string): void {
    const list = this.get<seeds.StudentProgress>("lms_progress", []);
    const updatedList = list.filter((p) => p.user_id !== userId);
    this.set("lms_progress", updatedList);
    apiDeleteEq("student_progress", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete student progress for ${userId} from server:`, err)
    );
  }

  deleteStudentSubmissions(userId: string): void {
    const list = this.get<seeds.Submission>("lms_submissions", []);
    const updatedList = list.filter((s) => s.user_id !== userId);
    this.set("lms_submissions", updatedList);
    apiDeleteEq("submissions", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete submissions for ${userId} from server:`, err)
    );
  }

  deleteStudentQuizAttempts(userId: string): void {
    const list = this.get<seeds.QuizAttempt>("lms_quiz_attempts", []);
    const updatedList = list.filter((a) => a.user_id !== userId);
    this.set("lms_quiz_attempts", updatedList);
    apiDeleteEq("quiz_attempts", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete quiz attempts for ${userId} from server:`, err)
    );
  }

  deleteStudentCertificates(userId: string): void {
    const list = this.get<seeds.Certificate>("lms_certificates", []);
    const updatedList = list.filter((c) => c.user_id !== userId);
    this.set("lms_certificates", updatedList);
    apiDeleteEq("certificates", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete certificates for ${userId} from server:`, err)
    );
  }

  deleteStudentAttendance(userId: string): void {
    const list = this.get<seeds.Attendance>("lms_attendance", []);
    const updatedList = list.filter((a) => a.user_id !== userId);
    this.set("lms_attendance", updatedList);
    apiDeleteEq("attendance", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete attendance for ${userId} from server:`, err)
    );
  }

  getInstructors(): seeds.Instructor[] {
    return this.get<seeds.Instructor>("lms_instructors", this.isSupabase ? [] : seeds.seedInstructors);
  }

  getInstructorByProfile(profileId: string): seeds.Instructor | undefined {
    return this.getInstructors().find((i) => i.profile_id === profileId);
  }

  createInstructor(instructor: seeds.Instructor): seeds.Instructor {
    const list = this.getInstructors();
    if (!list.some((i) => i.profile_id === instructor.profile_id)) {
      list.push(instructor);
      this.set("lms_instructors", list);
      this.saveToSupabase("instructors", instructor);
    }
    return instructor;
  }

  updateInstructor(instructor: seeds.Instructor): seeds.Instructor {
    const list = this.getInstructors();
    const idx = list.findIndex((i) => i.profile_id === instructor.profile_id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...instructor };
      this.set("lms_instructors", list);
      this.saveToSupabase("instructors", instructor);
    }
    return instructor;
  }

  // --- Applications ---
  getApplications(): seeds.Application[] {
    return this.get<seeds.Application>("lms_applications", []);
  }

  async createApplication(app: Omit<seeds.Application, "id" | "status" | "created_at">): Promise<seeds.Application> {
    // If an existing application row for this email exists in Supabase, delete it first
    // to avoid the UNIQUE constraint on the email column blocking re-applications.
    try {
      await apiDeleteEq("applications", { email: app.email });
    } catch (err) {
      console.warn(`Could not clear previous application for ${app.email}:`, err);
    }

    // Remove any old local entry for same email
    const list = this.getApplications().filter((a) => a.email.toLowerCase() !== app.email.toLowerCase());
    const newApp: seeds.Application = {
      ...app,
      id: generateUUID(),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    list.push(newApp);
    this.set("lms_applications", list);
    // Use upsert (not insert) so re-submissions never fail on the unique email constraint
    await this.saveToSupabase("applications", newApp, false);
    return newApp;
  }

  async updateApplicationStatus(id: string, status: "approved" | "rejected", cohortId?: string): Promise<seeds.Application | undefined> {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].reviewed_at = new Date().toISOString();
      this.set("lms_applications", list);
      // Await so errors are surfaced rather than silently swallowed
      await this.saveToSupabase("applications", list[idx]);

      if (status === "approved" && cohortId) {
        // Automatically create student profile
        const email = list[idx].email;
        const name = list[idx].applicant_name;
        
        let studentProfile = this.getProfileByEmail(email);
        if (!studentProfile) {
          studentProfile = {
            id: generateUUID(),
            full_name: name,
            email: email,
            role: "student",
            created_at: new Date().toISOString(),
            course_id: list[idx].course_id || "real-estate-os",
          };
          // Await profile creation so we know it succeeds in Supabase before continuing
          await this.createProfile(studentProfile);
        }
        
        // Enroll in cohort
        this.enrollInCohort(cohortId, studentProfile.id);
        
        // Initialize graduate status
        this.updateGraduateStatus(studentProfile.id, "Available", "Newly admitted student.");
        
        // Log welcome email simulation
        this.logEmail(
          email,
          "Admission Approved - Welcome to Housmata Academy!",
          `Hello ${name},\n\nYour application to Housmata Academy has been approved!\nWe have assigned you to cohort: ${this.getCohort(cohortId)?.name || cohortId}.\n\nYou can log in at: https://academy.housmata.com/lms/login\n\nYour credentials are:\n- Email: ${email}\n- Password: housmata2024\n\nBest wishes,\nHousmata Admissions Team`
        );
      }
      return list[idx];
    }
    return undefined;
  }

  rescindApplicationApproval(id: string): seeds.Application | undefined {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      const app = list[idx];
      if (app.status === "approved") {
        app.status = "pending";
        delete app.reviewed_at;
        this.set("lms_applications", list);
        this.saveToSupabase("applications", app);

        // Find the profile for this applicant by email
        const email = app.email;
        const profile = this.getProfileByEmail(email);
        if (profile) {
          this.deleteProfile(profile.id);
        }
      }
      return app;
    }
    return undefined;
  }

  resetApplicationToPending(id: string): seeds.Application | undefined {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      const app = list[idx];
      app.status = "pending";
      delete app.reviewed_at;
      this.set("lms_applications", list);
      this.saveToSupabase("applications", app);
      return app;
    }
    return undefined;
  }

  // --- Cohorts ---
  getCohorts(): seeds.Cohort[] {
    return this.get<seeds.Cohort>("lms_cohorts", this.isSupabase ? [] : seeds.seedCohorts);
  }

  getCohort(id: string): seeds.Cohort | undefined {
    return this.getCohorts().find((c) => c.id === id);
  }

  createCohort(cohort: Omit<seeds.Cohort, "id" | "active">): seeds.Cohort {
    const list = this.getCohorts();
    const newCohort: seeds.Cohort = {
      ...cohort,
      id: generateUUID(),
      active: true,
    };
    list.push(newCohort);
    this.set("lms_cohorts", list);
    this.saveToSupabase("cohorts", newCohort);
    return newCohort;
  }

  updateCohort(cohort: seeds.Cohort): seeds.Cohort {
    const list = this.getCohorts();
    const idx = list.findIndex((c) => c.id === cohort.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...cohort };
      this.set("lms_cohorts", list);
      this.saveToSupabase("cohorts", cohort);
    }
    return cohort;
  }

  async deleteCohort(id: string): Promise<void> {
    const list = this.getCohorts();
    const filtered = list.filter((c) => c.id !== id);
    this.set("lms_cohorts", filtered);
    if (this.isSupabase) {
      try {
        await apiDeleteEq("cohorts", { id });
      } catch (err) {
        console.error("Error deleting cohort from server:", err);
      }
    }
  }

  // --- Cohort Members ---
  getCohortMembers(): seeds.CohortMember[] {
    return this.get<seeds.CohortMember>("lms_cohort_members", this.isSupabase ? [] : seeds.seedCohortMembers);
  }

  getStudentCohort(userId: string): seeds.Cohort | undefined {
    const member = this.getCohortMembers().find((m) => m.user_id === userId);
    if (!member) return undefined;
    return this.getCohort(member.cohort_id);
  }

  getStudentsInCohort(cohortId: string): seeds.Profile[] {
    const userIds = this.getCohortMembers()
      .filter((m) => m.cohort_id === cohortId)
      .map((m) => m.user_id);
    return this.getProfiles().filter((p) => userIds.includes(p.id));
  }

  enrollInCohort(cohortId: string, userId: string): void {
    const list = this.getCohortMembers();
    if (!list.some((m) => m.cohort_id === cohortId && m.user_id === userId)) {
      const member = {
        cohort_id: cohortId,
        user_id: userId,
        enrolled_at: new Date().toISOString(),
      };
      list.push(member);
      this.set("lms_cohort_members", list);
      this.saveToSupabase("cohort_members", member);
    }
  }

  enrollOrUpdateCohort(cohortId: string, userId: string): void {
    const list = this.getCohortMembers();
    const idx = list.findIndex((m) => m.user_id === userId);
    const member = {
      cohort_id: cohortId,
      user_id: userId,
      enrolled_at: new Date().toISOString(),
    };
    if (idx !== -1) {
      list[idx] = member;
    } else {
      list.push(member);
    }
    this.set("lms_cohort_members", list);
    this.saveToSupabase("cohort_members", member);
  }

  deleteCohortMember(userId: string): void {
    const list = this.getCohortMembers();
    const updatedList = list.filter((m) => m.user_id !== userId);
    this.set("lms_cohort_members", updatedList);
    apiDeleteEq("cohort_members", { user_id: userId }).catch((err) =>
      console.error(`Failed to delete cohort member for ${userId} from server:`, err)
    );
  }

  // --- Courses, Modules, Lessons ---
  getModules(phase?: 1 | 2): seeds.Module[] {
    const list = seeds.seedModules;
    if (phase) return list.filter((m) => m.phase === phase);
    return list;
  }

  getModule(id: string): seeds.Module | undefined {
    return this.getModules().find((m) => m.id === id);
  }

  getLessons(moduleId: string): seeds.Lesson[] {
    return seeds.seedLessons.filter((l) => l.module_id === moduleId);
  }

  getLesson(id: string): seeds.Lesson | undefined {
    return seeds.seedLessons.find((l) => l.id === id);
  }

  // --- Assignments & Submissions ---
  getAssignments(moduleId?: string): seeds.Assignment[] {
    const list = seeds.seedAssignments;
    if (moduleId) {
      const dbModuleId = normalizeToDbModuleId(moduleId);
      return list.filter((a) => a.module_id === dbModuleId);
    }
    return list;
  }

  getAssignment(id: string): seeds.Assignment | undefined {
    return this.getAssignments().find((a) => a.id === id);
  }

  getSubmissions(): seeds.Submission[] {
    return this.get<seeds.Submission>("lms_submissions", []);
  }

  getStudentSubmissions(userId: string): seeds.Submission[] {
    return this.getSubmissions().filter((s) => s.user_id === userId);
  }

  /**
   * Lazily fetch the heavy file payload for a single submission.
   *
   * The list sync intentionally omits `content_link` / `content_text` to save
   * egress, so reviewers must call this when they open a submission. Returns
   * the file fields and also patches them into the in-memory cache so repeated
   * opens don't re-fetch. Falls back to the cached row when Supabase is not
   * configured (local/mock mode).
   */
  async getSubmissionFile(
    submissionId: string
  ): Promise<{ content_link?: string; content_text?: string; content_public_id?: string; content_file_name?: string } | null> {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === submissionId);
    const cached = idx !== -1 ? list[idx] : undefined;

    // If we already have the file cached (e.g. local mode or previously fetched), reuse it.
    if (cached?.content_link) {
      return {
        content_link: cached.content_link,
        content_text: cached.content_text,
        content_public_id: cached.content_public_id,
        content_file_name: cached.content_file_name,
      };
    }

    if (!this.isSupabase) {
      return cached
        ? {
            content_link: cached.content_link,
            content_text: cached.content_text,
            content_public_id: cached.content_public_id,
            content_file_name: cached.content_file_name,
          }
        : null;
    }

    const data = await apiSelectOne<{
      content_link?: string;
      content_text?: string;
      content_public_id?: string;
      content_file_name?: string;
    }>("submissions", {
      columns: "content_link,content_text,content_public_id,content_file_name",
      filters: { id: submissionId },
    });

    if (!data) {
      console.error(`Failed to fetch submission file for ${submissionId}.`);
      return null;
    }

    // Patch into the cache so we don't fetch again this session.
    if (idx !== -1 && data) {
      list[idx] = { ...list[idx], ...data };
      this.set("lms_submissions", list);
    }

    return data;
  }

  async createSubmission(sub: Omit<seeds.Submission, "id" | "submitted_at" | "status">): Promise<seeds.Submission> {
    const list = this.getSubmissions();

    // Remove existing submission for the same assignment and user to overwrite it (resubmission).
    // The server keeps the authoritative history; syncFromSupabase() deduplicates
    // by (assignment_id, user_id) keeping the newest on every sync.
    const filtered = list.filter((s) => !(s.assignment_id === sub.assignment_id && s.user_id === sub.user_id));

    const newSub: seeds.Submission = {
      ...sub,
      id: generateUUID(),
      status: "pending",
      submitted_at: new Date().toISOString(),
    };
    filtered.push(newSub);
    this.set("lms_submissions", filtered);

    const persisted = await this.saveToSupabase("submissions", newSub, true);
    if (!persisted) {
      // Roll back the optimistic local write — the submission did NOT reach
      // the server. Throwing lets the UI show a real error instead of the
      // student believing they submitted.
      this.set("lms_submissions", filtered.filter((s) => s.id !== newSub.id));
      throw new Error("Could not upload your submission to the server. Please check your connection and try again.");
    }

    const assignment = this.getAssignment(newSub.assignment_id);
    if (assignment) {
      this.checkAndPromoteModule(newSub.user_id, assignment.module_id);
    }

    return newSub;
  }

  gradeSubmission(id: string, grade: number, feedback: string): seeds.Submission | undefined {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx].grade = grade;
      list[idx].feedback = feedback;
      list[idx].status = "graded";
      this.set("lms_submissions", list);
      this.saveToSupabase("submissions", list[idx]);

      // Trigger email simulation
      const profile = this.getProfile(list[idx].user_id);
      const assignment = this.getAssignment(list[idx].assignment_id);
      if (profile && assignment) {
        // Try to get the module name
        const modules = seeds.seedModules;
        const moduleObj = modules.find((m) => m.id === assignment.module_id);
        const moduleName = moduleObj ? moduleObj.title : `Module ${assignment.module_id}`;

        const finalGrades = this.getFinalModuleGrade(list[idx].user_id, assignment.module_id);

        let emailBody = `Hello ${profile.full_name},\n\nYour submission for "${assignment.title}" has been graded.\nScore: ${grade}/${assignment.points_possible}\nFeedback: ${feedback}\n\n`;

        if (finalGrades) {
          emailBody += `Great news! Your overall grade for ${moduleName} is now finalized:\n- Quiz Score: ${finalGrades.quizScore.toFixed(1)}%\n- Assignment Grade: ${finalGrades.assignmentGrade.toFixed(1)}%\n- Final Module Grade: ${finalGrades.finalGrade.toFixed(1)}% (weighted 30% Quiz / 70% Assignment)\n\n`;
        }

        emailBody += `Log in to your student dashboard to review details and proceed to the next module.\n\nBest regards,\nHousmata Academy Grading Team`;

        this.logEmail(
          profile.email,
          finalGrades ? `Academic Module Graded & Finalized: ${moduleName}` : `Assignment Graded: ${assignment.title}`,
          emailBody
        );
      }
      return list[idx];
    }
  }

  requestResubmission(id: string, feedback: string): seeds.Submission | undefined {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === id);
    if (idx !== -1) {
      list[idx].grade = undefined;
      list[idx].feedback = feedback;
      list[idx].status = "rejected";
      this.set("lms_submissions", list);
      this.saveToSupabase("submissions", list[idx]);

      // Remove from completed modules for the student
      const assignment = this.getAssignment(list[idx].assignment_id);
      if (assignment) {
        const uiModuleId = normalizeToUiModuleId(assignment.module_id) || "";
        const progress = this.getProgress(list[idx].user_id);
        progress.completed_modules = progress.completed_modules.filter(m => m !== uiModuleId);
        this.updateProgress(progress);
      }

      // Trigger email simulation
      const profile = this.getProfile(list[idx].user_id);
      const assignmentObj = this.getAssignment(list[idx].assignment_id);
      if (profile && assignmentObj) {
        this.logEmail(
          profile.email,
          `Resubmission Requested: ${assignmentObj.title}`,
          `Hello ${profile.full_name},\n\nYour instructor has requested a resubmission for "${assignmentObj.title}".\nFeedback: ${feedback}\n\nPlease log in to your student dashboard to submit your revised assignment.\n\nBest regards,\nHousmata Academy Grading Team`
        );
      }

      return list[idx];
    }
  }

  updateSubmission(sub: seeds.Submission): seeds.Submission {
    const list = this.getSubmissions();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...sub };
      this.set("lms_submissions", list);
      this.saveToSupabase("submissions", sub);
    }
    return sub;
  }



  // --- Quizzes & Attempts ---
  getQuizzes(moduleId?: string): seeds.Quiz[] {
    const list = [...seeds.seedQuizzes, ...generatedQuizzesHCPA];
    if (moduleId) {
      const dbModuleId = normalizeToDbModuleId(moduleId);
      return list.filter((q) => q.module_id === dbModuleId);
    }
    return list;
  }

  getQuiz(id: string): seeds.Quiz | undefined {
    return this.getQuizzes().find((q) => q.id === id);
  }

  getQuizQuestions(quizId: string): seeds.QuizQuestion[] {
    const list = [...seeds.seedQuizQuestions, ...generatedQuizQuestionsHCPA];
    return list.filter((q) => q.quiz_id === quizId);
  }

  getQuizAttempts(userId?: string): seeds.QuizAttempt[] {
    const list = this.get<seeds.QuizAttempt>("lms_quiz_attempts", []);
    if (userId) return list.filter((a) => a.user_id === userId);
    return list;
  }

  async createQuizAttempt(attempt: Omit<seeds.QuizAttempt, "id" | "attempted_at">): Promise<seeds.QuizAttempt> {
    const list = this.getQuizAttempts();
    
    // Calculate penalty based on previous attempts for this specific quiz
    const previousAttempts = list.filter(a => a.user_id === attempt.user_id && a.quiz_id === attempt.quiz_id).length;
    const penaltyFactor = Math.max(0, 1 - (previousAttempts * 0.1));
    const finalScore = attempt.score * penaltyFactor;
    
    // Check if the penalized score still meets passing criteria
    const quiz = this.getQuiz(attempt.quiz_id);
    const passed = quiz ? finalScore >= quiz.passing_score : attempt.passed;

    const newAttempt: seeds.QuizAttempt = {
      ...attempt,
      score: finalScore,
      passed: passed,
      id: generateUUID(),
      attempted_at: new Date().toISOString(),
    };
    list.push(newAttempt);
    this.set("lms_quiz_attempts", list);

    const persisted = await this.saveToSupabase("quiz_attempts", newAttempt, true);
    if (!persisted) {
      // Roll back the optimistic local write and let the UI show the error.
      this.set("lms_quiz_attempts", list.filter((a) => a.id !== newAttempt.id));
      throw new Error("Could not save your quiz attempt to the server. Please check your connection and try again.");
    }

    if (quiz) {
      this.checkAndPromoteModule(newAttempt.user_id, quiz.module_id);
    }
    
    return newAttempt;
  }

  // --- Survey Responses ---
  getSurveyResponses(): SurveyResponse[] {
    return this.get<SurveyResponse>("lms_survey_responses", []);
  }

  getSurveyResponse(userId: string, type: "pre" | "post"): SurveyResponse | undefined {
    return this.getSurveyResponses().find((r) => r.user_id === userId && r.type === type);
  }

  async createSurveyResponse(userId: string, type: "pre" | "post", answers: Record<string, number>): Promise<SurveyResponse> {
    const list = this.getSurveyResponses();
    const existing = list.find((r) => r.user_id === userId && r.type === type);
    const filtered = list.filter((r) => !(r.user_id === userId && r.type === type));

    const newResponse: SurveyResponse = {
      id: existing ? existing.id : generateUUID(),
      user_id: userId,
      type: type,
      answers: answers,
      submitted_at: new Date().toISOString()
    };

    filtered.push(newResponse);
    this.set("lms_survey_responses", filtered);
    
    // Use upsert (isInsert = false) to prevent unique constraint violation on (user_id, type)
    await this.saveToSupabase("survey_responses", newResponse, false);

    return newResponse;
  }

  // --- Grading Helper ---
  checkAndPromoteModule(userId: string, moduleId: string) {
    const dbModuleId = normalizeToDbModuleId(moduleId) || "";
    const uiModuleId = normalizeToUiModuleId(moduleId) || "";

    const progress = this.getProgress(userId);
    const courseId = progress.course_id || "real-estate-os";

    // Verify all lessons in the curriculum for this module are read
    const curriculum = courseId === "property-advisor-hcpa" ? hcpaCurriculum : phase1Curriculum;
    const curriculumModule = curriculum.find(m => m.id === uiModuleId);
    let allLessonsRead = true;
    if (curriculumModule) {
      allLessonsRead = curriculumModule.lessons.every((_, idx) => 
        progress.read_lessons?.includes(`${uiModuleId}-lesson-${idx}`)
      );
    }

    const quizzes = this.getQuizzes(dbModuleId);
    const quizPassed = quizzes.length === 0 || this.getQuizAttempts(userId).some(a => a.quiz_id === quizzes[0].id && a.passed);
    
    const assignments = this.getAssignments(dbModuleId);
    const assignmentSubmitted = assignments.length === 0 || this.getStudentSubmissions(userId).some(s => s.assignment_id === assignments[0].id);
    
    if (allLessonsRead && quizPassed && assignmentSubmitted) {
      if (!progress.completed_modules.includes(uiModuleId)) {
        progress.completed_modules.push(uiModuleId);
        this.updateProgress(progress);
      }
    }
  }

  getFinalModuleGrade(userId: string, moduleId: string): { assignmentGrade: number, quizScore: number, finalGrade: number } | null {
    const dbModuleId = normalizeToDbModuleId(moduleId) || "";

    // 1. Get Quiz Score
    const quizzes = this.getQuizzes(dbModuleId);
    if (quizzes.length === 0) return null;
    const quizId = quizzes[0].id;
    
    // Get highest passing attempt, or highest attempt if none passed
    const attempts = this.getQuizAttempts(userId).filter(a => a.quiz_id === quizId);
    if (attempts.length === 0) return null;
    
    const passedAttempts = attempts.filter(a => a.passed);
    const bestAttempt = passedAttempts.length > 0 
      ? passedAttempts.reduce((max, a) => a.score > max.score ? a : max, passedAttempts[0])
      : attempts.reduce((max, a) => a.score > max.score ? a : max, attempts[0]);
    
    const quizScore = bestAttempt.score;

    // 2. Get Assignment Grade
    const assignments = this.getAssignments(dbModuleId);
    if (assignments.length === 0) return null;
    const assignmentId = assignments[0].id;
    
    const submissions = this.getStudentSubmissions(userId).filter(s => s.assignment_id === assignmentId && s.status === "graded");
    if (submissions.length === 0 || submissions[0].grade === undefined) return null;
    
    const assignmentGrade = submissions[0].grade;

    // 3. Calculate Final Grade (30% Quiz, 70% Assignment)
    const finalGrade = (quizScore * 0.3) + (assignmentGrade * 0.7);

    return { assignmentGrade, quizScore, finalGrade };
  }

  // --- Meetings & Attendance ---
  getMeetings(cohortId?: string): seeds.Meeting[] {
    const list = this.get<seeds.Meeting>("lms_meetings", []);
    if (cohortId) return list.filter((m) => m.cohort_id === cohortId);
    return list;
  }

  createMeeting(meeting: Omit<seeds.Meeting, "id">): seeds.Meeting {
    const list = this.getMeetings();
    const newMeeting: seeds.Meeting = {
      ...meeting,
      id: generateUUID(),
    };
    list.push(newMeeting);
    this.set("lms_meetings", list);
    this.saveToSupabase("meetings", newMeeting);

    // Email notification simulation to all cohort students
    const students = this.getStudentsInCohort(meeting.cohort_id);
    students.forEach((s) => {
      this.logEmail(
        s.email,
        `New Live Class Scheduled: ${meeting.topic}`,
        `Hello ${s.full_name},\n\nAn instructor has scheduled a new live class:\nTopic: ${meeting.topic}\nTime: ${new Date(meeting.scheduled_at).toLocaleString()}\nLink: ${meeting.meeting_url}\n\nPlease mark your calendar.`
      );
    });
    return newMeeting;
  }

  getAttendance(meetingId?: string): seeds.Attendance[] {
    const list = this.get<seeds.Attendance>("lms_attendance", []);
    if (meetingId) return list.filter((a) => a.meeting_id === meetingId);
    return list;
  }

  markAttendance(meetingId: string, userId: string, present: boolean): seeds.Attendance {
    const list = this.getAttendance();
    const idx = list.findIndex((a) => a.meeting_id === meetingId && a.user_id === userId);
    
    const record: seeds.Attendance = {
      id: idx !== -1 ? list[idx].id : generateUUID(),
      meeting_id: meetingId,
      user_id: userId,
      present,
      marked_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    this.set("lms_attendance", list);
    this.saveToSupabase("attendance", record);
    return record;
  }

  // --- Announcements ---
  getAnnouncements(cohortId: string): seeds.Announcement[] {
    return this.get<seeds.Announcement>("lms_announcements", []).filter(
      (a) => a.cohort_id === cohortId || !a.cohort_id
    );
  }

  getAllAnnouncements(): seeds.Announcement[] {
    return this.get<seeds.Announcement>("lms_announcements", []);
  }

  createAnnouncement(ann: Omit<seeds.Announcement, "id" | "created_at">): seeds.Announcement {
    const list = this.get<seeds.Announcement>("lms_announcements", []);
    const newAnn: seeds.Announcement = {
      ...ann,
      cohort_id: ann.cohort_id || null,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newAnn);
    this.set("lms_announcements", list);
    this.saveToSupabase("announcements", newAnn);
    return newAnn;
  }

  // --- Certificates & Verifications ---
  getCertificates(userId?: string): seeds.Certificate[] {
    const list = this.get<seeds.Certificate>("lms_certificates", []);
    if (userId) return list.filter((c) => c.user_id === userId);
    return list;
  }

  createCertificate(userId: string, level: number, levelName: string): seeds.Certificate {
    const list = this.getCertificates();
    const existing = list.find((c) => c.user_id === userId && c.level === level);
    if (existing) return existing;

    const certCode = `HS-LVL${level}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const hash = Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 12);
    
    const newCert: seeds.Certificate = {
      id: generateUUID(),
      user_id: userId,
      certificate_code: certCode,
      issue_date: new Date().toISOString().split("T")[0],
      hash,
      level,
      level_name: levelName,
    };
    list.push(newCert);
    this.set("lms_certificates", list);
    this.saveToSupabase("certificates", newCert);

    // Update Graduate Deployment Status to Active if level 1 or higher is earned
    this.updateGraduateStatus(userId, "Active", `Earned ${levelName} Certification.`);

    const profile = this.getProfile(userId);
    if (profile) {
      this.logEmail(
        profile.email,
        `Congratulations! Certificate Issued: ${levelName}`,
        `Hello ${profile.full_name},\n\nWe are proud to award you the certificate for: ${levelName}.\nCertificate Code: ${certCode}\n\nYou can verify or download your certificate directly inside the LMS dashboard.`
      );
    }

    return newCert;
  }

  verifyCertificate(code: string): { cert: seeds.Certificate; student: seeds.Profile } | null {
    const cert = this.getCertificates().find(
      (c) => c.certificate_code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!cert) return null;
    const student = this.getProfile(cert.user_id);
    if (!student) return null;
    return { cert, student };
  }

  // --- Graduate Status ---
  getGraduateStatuses(): seeds.GraduateStatus[] {
    return this.get<seeds.GraduateStatus>("lms_graduate_status", []);
  }

  getGraduateStatus(userId: string): seeds.GraduateStatus | undefined {
    return this.getGraduateStatuses().find((g) => g.user_id === userId);
  }

  updateGraduateStatus(
    userId: string,
    status: seeds.GraduateStatus["deployment_status"],
    notes?: string
  ): seeds.GraduateStatus {
    const list = this.getGraduateStatuses();
    const idx = list.findIndex((g) => g.user_id === userId);

    const record: seeds.GraduateStatus = {
      id: idx !== -1 ? list[idx].id : generateUUID(),
      user_id: userId,
      deployment_status: status,
      placement_notes: notes || (idx !== -1 ? list[idx].placement_notes : ""),
      updated_at: new Date().toISOString(),
    };

    if (idx !== -1) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    this.set("lms_graduate_status", list);
    this.saveToSupabase("graduate_status", record);
    return record;
  }

  // --- Email Logs ---
  getEmailLogs(): seeds.EmailLog[] {
    return this.get<seeds.EmailLog>("lms_email_logs", []);
  }

  logEmail(recipient: string, subject: string, body: string): seeds.EmailLog {
    const list = this.getEmailLogs();
    const newLog: seeds.EmailLog = {
      id: generateUUID(),
      recipient_email: recipient,
      subject,
      body,
      sent_at: new Date().toISOString(),
    };
    list.push(newLog);
    this.set("lms_email_logs", list);
    this.saveToSupabase("email_logs", newLog, true);

    // Asynchronously dispatch real email transmission via server-side Resend API
    fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient,
        subject,
        body,
      }),
    }).catch((err) => {
      console.error("[Email Dispatch Error] Failed to send email via API endpoint:", err);
    });

    return newLog;
  }

  // --- Progress ---
  getProgress(userId: string): seeds.StudentProgress {
    const list = this.get<seeds.StudentProgress>("lms_progress", []);
    const existing = list.find((p) => p.user_id === userId);
    
    // Resolve course_id from profile if possible
    const profile = this.getProfile(userId);
    const resolvedCourseId = profile?.course_id || "real-estate-os";

    if (existing) {
      if (!existing.course_id) {
        existing.course_id = resolvedCourseId;
      }
      return existing;
    }

    return {
      user_id: userId,
      course_id: resolvedCourseId,
      current_phase: 1,
      completed_modules: [],
      read_lessons: [],
      phase2_status: "locked",
      selected_class: undefined,
      phase2_meeting_url: undefined,
      phase2_attendance: undefined,
    };
  }

  updateProgress(progress: seeds.StudentProgress): seeds.StudentProgress {
    const list = this.get<seeds.StudentProgress>("lms_progress", []);
    const idx = list.findIndex((p) => p.user_id === progress.user_id);
    
    // Default course_id if not present
    if (!progress.course_id) {
      const profile = this.getProfile(progress.user_id);
      progress.course_id = profile?.course_id || "real-estate-os";
    }

    if (idx !== -1) {
      list[idx] = progress;
    } else {
      list.push(progress);
    }
    this.set("lms_progress", list);
    // Strip fields that don't exist in the Supabase student_progress schema
    // (course_id, phase2_meeting_url, phase2_attendance are local-only fields).
    // Sending unknown columns causes the upsert to fail silently, leaving Supabase stale.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { course_id: _cid, ...progressForSupabase } = progress;
    this.saveToSupabase("student_progress", progressForSupabase);
    
    // Check auto-promotion from phase 1 to 2
    // HCPA has 16 modules (hcpa-m0 to hcpa-m15), HCEM has 9 modules (p1-m1 to p1-m9)
    const requiredModulesCount = progress.course_id === "property-advisor-hcpa" ? 16 : 9;
    
    if (progress.current_phase === 1 && progress.completed_modules.length >= requiredModulesCount) {
      const updated = {
        ...progress,
        current_phase: 2 as const,
        phase2_status: "in-progress" as const,
      };
      const list2 = this.get<seeds.StudentProgress>("lms_progress", []);
      const idx2 = list2.findIndex((p) => p.user_id === progress.user_id);
      if (idx2 !== -1) {
        list2[idx2] = updated;
      } else {
        list2.push(updated);
      }
      this.set("lms_progress", list2);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { course_id: _cid2, ...updatedForSupabase } = updated;
      this.saveToSupabase("student_progress", updatedForSupabase);
      return updated;
    }
    
    return progress;
  }

  promoteToPhase3(userId: string): seeds.StudentProgress {
    const progress = this.getProgress(userId);
    const updated = {
      ...progress,
      current_phase: 3 as const,
      phase2_status: "passed" as const,
    };
    return this.updateProgress(updated);
  }

  reversePromotion(userId: string): seeds.StudentProgress {
    const progress = this.getProgress(userId);
    const updated = {
      ...progress,
      current_phase: 2 as const,
      phase2_status: "in-progress" as const,
    };
    return this.updateProgress(updated);
  }

  deleteSurveyResponsesForEmail(email: string): void {
    const student = this.getProfileByEmail(email);
    if (!student) return;
    const userId = student.id;

    // Local Storage cleanup
    const responses = this.getSurveyResponses();
    const filtered = responses.filter(r => r.user_id !== userId);
    this.set("lms_survey_responses", filtered);

    // Remove local flags from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(`survey_completed_pre_${userId}`);
      localStorage.removeItem(`survey_completed_post_${userId}`);
      localStorage.removeItem(`survey_completed_pre_${email}`);
      localStorage.removeItem(`survey_completed_post_${email}`);
    }

    // Server deletion
    apiDeleteEq("survey_responses", { user_id: userId })
      .then(() => console.log(`Successfully deleted survey responses for ${email} from server.`))
      .catch((err) => console.error("Failed to delete survey responses from server:", err));
  }

  deleteUserByEmailEntirely(email: string): void {
    const student = this.getProfileByEmail(email);
    if (!student) return;
    const userId = student.id;

    // 1. Delete survey responses first
    this.deleteSurveyResponsesForEmail(email);

    // 2. Cascade delete profile and progress records
    this.deleteProfile(userId);
    
    // 3. Clear auth flags
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("lms_current_user_id");
      if (savedUserId === userId) {
        localStorage.removeItem("lms_current_user_id");
      }
    }
  }
}

export const db = new LocalStorageDB();

export type { LocalStorageDB };
