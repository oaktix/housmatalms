import { createClient } from "@supabase/supabase-js";
import * as seeds from "./mockData";
import { phase1Curriculum } from "./curriculum";

// Retrieve keys from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-project-id.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if running in browser
const isBrowser = typeof window !== "undefined";

// Normalization Helpers to bridge UI (module-X) and DB (p1-mX) module IDs
function normalizeToDbModuleId(moduleId?: string): string | undefined {
  if (!moduleId) return undefined;
  const match = moduleId.match(/^module-(\d+)$/);
  if (match) {
    return `p1-m${match[1]}`;
  }
  return moduleId;
}

function normalizeToUiModuleId(moduleId?: string): string | undefined {
  if (!moduleId) return undefined;
  const match = moduleId.match(/^p1-m(\d+)$/);
  if (match) {
    return `module-${match[1]}`;
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

// LocalStorage Mock DB implementation with Supabase Synchronization
class LocalStorageDB {
  private isSupabase = false;
  private listeners = new Set<() => void>();

  constructor() {
    if (isSupabaseConfigured && supabase) {
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
    if (!supabase) return;
    try {
      console.log("Synchronizing data from Supabase...");
      
      // 1. Fetch profiles from Supabase
      const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
      if (pErr) throw pErr;
      this.set("lms_profiles", profiles || []);

      // 2. Fetch other tables in parallel
      const tables = [
        { name: "instructors", key: "lms_instructors" },
        { name: "applications", key: "lms_applications" },
        { name: "cohorts", key: "lms_cohorts" },
        { name: "cohort_members", key: "lms_cohort_members" },
        { name: "submissions", key: "lms_submissions" },
        { name: "quiz_attempts", key: "lms_quiz_attempts" },
        { name: "meetings", key: "lms_meetings" },
        { name: "attendance", key: "lms_attendance" },
        { name: "certificates", key: "lms_certificates" },
        { name: "graduate_status", key: "lms_graduate_status" },
        { name: "student_progress", key: "lms_progress" },
        { name: "email_logs", key: "lms_email_logs" },
        { name: "announcements", key: "lms_announcements" }
      ];

      await Promise.all(
        tables.map(async (t) => {
          const { data, error } = await supabase!.from(t.name).select("*");
          if (!error && data) {
            this.set(t.key, data);
          }
        })
      );

      console.log("Supabase synchronization successfully completed.");

      // Trigger UI updates safely
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
      this.notify();
    } catch (e) {
      console.error("Failed to sync from Supabase:", e);
    }
  }

  private async seedSupabase(profilesToSeed?: seeds.Profile[]) {
    if (!supabase) return;
    try {
      const isFullSeed = !profilesToSeed;
      const targetProfiles = profilesToSeed || seeds.seedProfiles;
      console.log(isFullSeed ? "Full Supabase seed starting..." : `Inserting ${targetProfiles.length} missing profile(s)...`);
      
      // Seed profiles
      const { error: pErr } = await supabase.from("profiles").upsert(targetProfiles, { onConflict: "email" });
      if (pErr) console.error("Error seeding profiles:", pErr);

      // Seed instructors
      const { error: iErr } = await supabase.from("instructors").insert(
        seeds.seedInstructors.map(inst => ({
          profile_id: inst.profile_id,
          full_name: inst.full_name,
          bio: inst.bio,
          qualifications: inst.qualifications,
          awards: inst.awards,
          philosophy: inst.philosophy
        }))
      );
      if (iErr) console.error("Error seeding instructors:", iErr);

      // Seed cohorts
      const { error: cErr } = await supabase.from("cohorts").insert(
        seeds.seedCohorts.map(coh => ({
          id: coh.id,
          name: coh.name,
          start_date: coh.start_date,
          end_date: coh.end_date,
          active: coh.active,
          capacity: coh.capacity,
          instructor_id: coh.instructor_id
        }))
      );
      if (cErr) console.error("Error seeding cohorts:", cErr);

      // Seed cohort members
      const { error: cmErr } = await supabase.from("cohort_members").insert(seeds.seedCohortMembers);
      if (cmErr) console.error("Error seeding cohort members:", cmErr);
      
      console.log("Supabase seeding completed successfully.");
    } catch (e) {
      console.error("Failed to seed Supabase:", e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async saveToSupabase(table: string, record: any, isInsert: boolean = false) {
    if (!this.isSupabase || !supabase) return;
    try {
      const { error } = isInsert
        ? await supabase.from(table).insert(record)
        : await supabase.from(table).upsert(record);
      if (error) {
        console.error(`Supabase ${isInsert ? 'insert' : 'upsert'} error on '${table}':`, {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details,
        });
      }
    } catch (e) {
      console.error(`Failed to ${isInsert ? 'insert' : 'upsert'} to Supabase table ${table}:`, e);
    }
  }

  private get<T>(key: string, defaultValue: T[]): T[] {
    if (!isBrowser) return defaultValue;
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T[]): void {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getProfiles(): seeds.Profile[] {
    return this.get<seeds.Profile>("lms_profiles", this.isSupabase ? [] : seeds.seedProfiles);
  }

  getProfile(id: string): seeds.Profile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  getProfileByEmail(email: string): seeds.Profile | undefined {
    return this.getProfiles().find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  createProfile(profile: seeds.Profile): seeds.Profile {
    const list = this.getProfiles();
    if (!list.some((p) => p.id === profile.id)) {
      list.push(profile);
      this.set("lms_profiles", list);
      this.saveToSupabase("profiles", profile);
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

    if (supabase) {
      supabase
        .from("profiles")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete profile ${id} from Supabase:`, error);
        });
    }
  }

  deleteInstructorByProfile(profileId: string): void {
    const list = this.getInstructors();
    const updatedList = list.filter((i) => i.profile_id !== profileId);
    this.set("lms_instructors", updatedList);
    if (supabase) {
      supabase
        .from("instructors")
        .delete()
        .eq("profile_id", profileId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete instructor ${profileId} from Supabase:`, error);
        });
    }
  }

  deleteGraduateStatus(userId: string): void {
    const list = this.get<seeds.GraduateStatus>("lms_graduate_status", []);
    const updatedList = list.filter((g) => g.user_id !== userId);
    this.set("lms_graduate_status", updatedList);
    if (supabase) {
      supabase
        .from("graduate_status")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete graduate status for ${userId} from Supabase:`, error);
        });
    }
  }

  deleteStudentProgress(userId: string): void {
    const list = this.get<seeds.StudentProgress>("lms_progress", []);
    const updatedList = list.filter((p) => p.user_id !== userId);
    this.set("lms_progress", updatedList);
    if (supabase) {
      supabase
        .from("student_progress")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete student progress for ${userId} from Supabase:`, error);
        });
    }
  }

  deleteStudentSubmissions(userId: string): void {
    const list = this.get<seeds.Submission>("lms_submissions", []);
    const updatedList = list.filter((s) => s.user_id !== userId);
    this.set("lms_submissions", updatedList);
    if (supabase) {
      supabase
        .from("submissions")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete submissions for ${userId} from Supabase:`, error);
        });
    }
  }

  deleteStudentQuizAttempts(userId: string): void {
    const list = this.get<seeds.QuizAttempt>("lms_quiz_attempts", []);
    const updatedList = list.filter((a) => a.user_id !== userId);
    this.set("lms_quiz_attempts", updatedList);
    if (supabase) {
      supabase
        .from("quiz_attempts")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete quiz attempts for ${userId} from Supabase:`, error);
        });
    }
  }

  deleteStudentCertificates(userId: string): void {
    const list = this.get<seeds.Certificate>("lms_certificates", []);
    const updatedList = list.filter((c) => c.user_id !== userId);
    this.set("lms_certificates", updatedList);
    if (supabase) {
      supabase
        .from("certificates")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete certificates for ${userId} from Supabase:`, error);
        });
    }
  }

  deleteStudentAttendance(userId: string): void {
    const list = this.get<seeds.Attendance>("lms_attendance", []);
    const updatedList = list.filter((a) => a.user_id !== userId);
    this.set("lms_attendance", updatedList);
    if (supabase) {
      supabase
        .from("attendance")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete attendance for ${userId} from Supabase:`, error);
        });
    }
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

  createApplication(app: Omit<seeds.Application, "id" | "status" | "created_at">): seeds.Application {
    const list = this.getApplications();
    const newApp: seeds.Application = {
      ...app,
      id: generateUUID(),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    list.push(newApp);
    this.set("lms_applications", list);
    this.saveToSupabase("applications", newApp, true);
    return newApp;
  }

  updateApplicationStatus(id: string, status: "approved" | "rejected", cohortId?: string): seeds.Application | undefined {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].reviewed_at = new Date().toISOString();
      this.set("lms_applications", list);
      this.saveToSupabase("applications", list[idx]);

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
          };
          this.createProfile(studentProfile);
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
    if (supabase) {
      supabase
        .from("cohort_members")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete cohort member for ${userId} from Supabase:`, error);
        });
    }
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

  createSubmission(sub: Omit<seeds.Submission, "id" | "submitted_at" | "status">): seeds.Submission {
    const list = this.getSubmissions();
    
    // Find the existing submission so we can delete it from Supabase if configured
    const existing = list.find((s) => s.assignment_id === sub.assignment_id && s.user_id === sub.user_id);
    if (existing && supabase) {
      supabase
        .from("submissions")
        .delete()
        .eq("id", existing.id)
        .then(({ error }) => {
          if (error) console.error(`Failed to delete old submission ${existing.id} from Supabase:`, error);
        });
    }

    // Remove existing submission for the same assignment and user to overwrite it (resubmission)
    const filtered = list.filter((s) => !(s.assignment_id === sub.assignment_id && s.user_id === sub.user_id));
    
    const newSub: seeds.Submission = {
      ...sub,
      id: generateUUID(),
      status: "pending",
      submitted_at: new Date().toISOString(),
    };
    filtered.push(newSub);
    this.set("lms_submissions", filtered);
    this.saveToSupabase("submissions", newSub, true);
    
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
    const list = seeds.seedQuizzes;
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
    return seeds.seedQuizQuestions.filter((q) => q.quiz_id === quizId);
  }

  getQuizAttempts(userId?: string): seeds.QuizAttempt[] {
    const list = this.get<seeds.QuizAttempt>("lms_quiz_attempts", []);
    if (userId) return list.filter((a) => a.user_id === userId);
    return list;
  }

  createQuizAttempt(attempt: Omit<seeds.QuizAttempt, "id" | "attempted_at">): seeds.QuizAttempt {
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
    this.saveToSupabase("quiz_attempts", newAttempt, true);
    
    if (quiz) {
      this.checkAndPromoteModule(newAttempt.user_id, quiz.module_id);
    }
    
    return newAttempt;
  }

  // --- Grading Helper ---
  checkAndPromoteModule(userId: string, moduleId: string) {
    const dbModuleId = normalizeToDbModuleId(moduleId) || "";
    const uiModuleId = normalizeToUiModuleId(moduleId) || "";

    const progress = this.getProgress(userId);

    // Verify all lessons in the curriculum for this module are read
    const curriculumModule = phase1Curriculum.find(m => m.id === uiModuleId);
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
    if (existing) return existing;
    return {
      user_id: userId,
      current_phase: 1,
      completed_modules: [],
      read_lessons: [],
      phase2_status: "locked",
    };
  }

  updateProgress(progress: seeds.StudentProgress): seeds.StudentProgress {
    const list = this.get<seeds.StudentProgress>("lms_progress", []);
    const idx = list.findIndex((p) => p.user_id === progress.user_id);
    if (idx !== -1) {
      list[idx] = progress;
    } else {
      list.push(progress);
    }
    this.set("lms_progress", list);
    this.saveToSupabase("student_progress", progress);
    
    // Check auto-promotion from phase 1 to 2
    if (progress.current_phase === 1 && progress.completed_modules.length >= 9) {
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
      this.saveToSupabase("student_progress", updated);
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
}

export const db = new LocalStorageDB();
export type { LocalStorageDB };
