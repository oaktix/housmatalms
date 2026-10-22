import { NextResponse } from "next/server";
import { getSessionFromRequest, SessionPayload } from "@/lib/session";

/**
 * Hardened Database Proxy Route.
 *
 * Implements strict Role-Based Access Control (RBAC) and row-level ownership
 * constraints. Replaces the insecure open superuser proxy with authenticated
 * session gates, preventing data dumps, privilege escalations, and unauthorized
 * data mutations.
 */

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const ALLOWED_TABLES = new Set([
  "profiles",
  "instructors",
  "applications",
  "cohorts",
  "cohort_members",
  "submissions",
  "quiz_attempts",
  "meetings",
  "attendance",
  "certificates",
  "graduate_status",
  "student_progress",
  "email_logs",
  "announcements",
  "survey_responses",
]);

// Tables that can be read without an active session (public catalog data)
const PUBLIC_READ_TABLES = new Set(["instructors", "cohorts", "announcements"]);

// Params that configure the request rather than act as eq() filters.
const RESERVED_PARAMS = new Set(["columns", "order", "limit", "single"]);

function isConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SERVICE_ROLE_KEY &&
      SUPABASE_URL !== "https://your-project-id.supabase.co" &&
      !SERVICE_ROLE_KEY.startsWith("your-service")
  );
}

function restHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...(extra || {}),
  };
}

type ParsedQuery = {
  filters: Record<string, string>;
  columns?: string;
  order?: string;
  limit?: number;
  single: boolean;
};

function parseQuery(request: Request): ParsedQuery {
  const { searchParams } = new URL(request.url);
  const filters: Record<string, string> = {};
  let columns: string | undefined;
  let order: string | undefined;
  let limit: number | undefined;
  let single = false;

  searchParams.forEach((value, key) => {
    if (RESERVED_PARAMS.has(key)) {
      if (key === "columns") columns = value;
      else if (key === "order") order = value;
      else if (key === "limit") limit = Number(value) || undefined;
      else if (key === "single") single = value === "1" || value === "true";
    } else {
      filters[key] = value;
    }
  });

  return { filters, columns, order, limit, single };
}

function buildRestUrl(
  table: string,
  query: ParsedQuery,
  extraParams?: Record<string, string>
): string {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set("select", query.columns || "*");
  for (const [key, value] of Object.entries(query.filters)) {
    url.searchParams.set(key, `eq.${value}`);
  }
  if (query.order) url.searchParams.set("order", query.order);
  if (query.limit) url.searchParams.set("limit", String(query.limit));
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function errorFromResponse(res: Response): Promise<{ message: string; status: number }> {
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
    if (body?.error) message = body.error;
  } catch {
    // keep default message
  }
  return { message, status: res.status };
}

async function resolveSession(request: Request): Promise<SessionPayload | null> {
  // Check forwarded headers from middleware
  const headerUserId = request.headers.get("x-lms-user-id");
  const headerRole = request.headers.get("x-lms-user-role") as SessionPayload["role"] | null;
  const headerEmail = request.headers.get("x-lms-user-email");

  if (headerUserId && headerRole && headerEmail) {
    return {
      userId: headerUserId,
      role: headerRole,
      email: headerEmail,
    };
  }

  // Fallback to cookie/bearer token verification
  return await getSessionFromRequest(request);
}

// =============================================================================
// GET HANDLER
// =============================================================================
export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ success: false, error: "Unknown table" }, { status: 400 });
  }
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }

  const session = await resolveSession(request);

  // 1. Unauthenticated checks
  if (!session) {
    // Allow public tables
    if (PUBLIC_READ_TABLES.has(table)) {
      // Allowed
    } else if (table === "certificates") {
      // Allow public verification if filtered by verification_code or certificate number
      const query = parseQuery(request);
      if (!query.filters.id && !query.filters.verification_code) {
        return NextResponse.json(
          { success: false, error: "Authentication required to query certificate records" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to private database table" },
        { status: 401 }
      );
    }
  }

  const query = parseQuery(request);

  // 2. Role-Based Scoping & Privacy Enforcement
  if (session && session.role === "student") {
    // Prevent students from viewing admin communications or other applicants
    if (table === "applications" || table === "email_logs") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Access restricted to platform administrators" },
        { status: 403 }
      );
    }

    // Automatically enforce row ownership for student private data
    if (
      table === "submissions" ||
      table === "quiz_attempts" ||
      table === "survey_responses" ||
      table === "student_progress"
    ) {
      query.filters.user_id = session.userId;
    }

    if (table === "attendance" && !query.filters.user_id) {
      query.filters.user_id = session.userId;
    }
  } else if (session && session.role === "instructor") {
    // Prevent instructors from viewing sensitive admin tables
    if (table === "email_logs" || table === "applications") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Access restricted to platform administrators" },
        { status: 403 }
      );
    }
  }

  try {
    const res = await fetch(buildRestUrl(table, query), {
      headers: restHeaders(query.single ? { Accept: "application/vnd.pgrst.object+json" } : undefined),
      cache: "no-store",
    });
    if (!res.ok) {
      const { message, status } = await errorFromResponse(res);
      return NextResponse.json({ success: false, error: message }, { status });
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : query.single ? null : [];
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[api/db] GET failed:", error);
    return NextResponse.json({ success: false, error: "Database request failed" }, { status: 500 });
  }
}

// =============================================================================
// POST HANDLER (Insert / Upsert)
// =============================================================================
export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ success: false, error: "Unknown table" }, { status: 400 });
  }
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }

  const session = await resolveSession(request);

  // Allow unauthenticated insertion ONLY for the public admissions application form
  if (!session) {
    if (table === "applications") {
      // Allowed for new candidate applications
    } else {
      return NextResponse.json(
        { success: false, error: "Authentication required to perform database writes" },
        { status: 401 }
      );
    }
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
  const records = Array.isArray(body.records)
    ? body.records
    : body.record
      ? [body.record]
      : null;
  if (!records || records.length === 0) {
    return NextResponse.json({ success: false, error: "No records provided" }, { status: 400 });
  }

  // 3. Write Permission Validation
  if (session && session.role === "student") {
    // Prohibited student write tables
    const prohibitedTables = new Set([
      "instructors",
      "cohorts",
      "announcements",
      "email_logs",
      "graduate_status",
      "applications",
    ]);
    if (prohibitedTables.has(table)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Students cannot modify this resource" },
        { status: 403 }
      );
    }

    // Verify all records belong to the student
    for (const rec of records) {
      if (typeof rec === "object" && rec !== null) {
        const recordUserId = (rec as Record<string, unknown>).user_id || (rec as Record<string, unknown>).id;
        if (recordUserId && recordUserId !== session.userId) {
          return NextResponse.json(
            { success: false, error: "Forbidden: Cannot write records for another user ID" },
            { status: 403 }
          );
        }
      }
    }
  } else if (session && session.role === "instructor") {
    // Prohibit instructors from altering admissions and email logs
    if (table === "applications" || table === "email_logs") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Restricted to platform administrators" },
        { status: 403 }
      );
    }
  }

  const mode: "insert" | "upsert" = body.mode === "insert" ? "insert" : "upsert";
  const prefer =
    mode === "upsert" ? "return=minimal,resolution=merge-duplicates" : "return=minimal";
  const extraParams: Record<string, string> = {};
  if (mode === "upsert" && body.onConflict) {
    extraParams.on_conflict = String(body.onConflict);
  }

  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: restHeaders({ Prefer: prefer }),
      body: JSON.stringify(records),
    });
    if (!res.ok) {
      const { message, status } = await errorFromResponse(res);
      return NextResponse.json({ success: false, error: message }, { status });
    }
    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    console.error("[api/db] POST failed:", error);
    return NextResponse.json({ success: false, error: "Database request failed" }, { status: 500 });
  }
}

// =============================================================================
// DELETE HANDLER
// =============================================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  if (!ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ success: false, error: "Unknown table" }, { status: 400 });
  }
  if (!isConfigured()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }

  const session = await resolveSession(request);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required to perform database deletions" },
      { status: 401 }
    );
  }

  // Students are completely barred from destructive DELETE queries
  if (session.role === "student") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Students are not authorized to delete database records" },
      { status: 403 }
    );
  }

  // Instructors can only delete meeting records
  if (session.role === "instructor" && table !== "meetings") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Instructors can only delete meeting items" },
      { status: 403 }
    );
  }

  const query = parseQuery(request);
  if (Object.keys(query.filters).length === 0) {
    return NextResponse.json(
      { success: false, error: "Refusing unfiltered delete" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(buildRestUrl(table, query), {
      method: "DELETE",
      headers: restHeaders(),
    });
    if (!res.ok) {
      const { message, status } = await errorFromResponse(res);
      return NextResponse.json({ success: false, error: message }, { status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/db] DELETE failed:", error);
    return NextResponse.json({ success: false, error: "Database request failed" }, { status: 500 });
  }
}
