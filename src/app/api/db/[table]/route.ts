import { NextResponse } from "next/server";

/**
 * Secure database proxy.
 *
 * The browser app must never talk to Supabase directly: the anon key can be
 * revoked/rotated platform-side (which silently broke every read/write once
 * already), and RLS policies assume Supabase Auth sessions this app doesn't
 * use. Instead all reads/writes go through this route, which runs on the
 * server and authenticates with SUPABASE_SERVICE_ROLE_KEY (never exposed to
 * the client).
 *
 * - GET    /api/db/<table>?columns=..&field=value&order=..&limit=..&single=1
 * - POST   /api/db/<table>          body: { records | record, mode, onConflict }
 * - DELETE /api/db/<table>?field=value
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

  const query = parseQuery(request);
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
