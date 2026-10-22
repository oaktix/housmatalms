/**
 * Structured Audit Trail Logger for administrative, grading, and security events.
 * Writes immutable records to PostgreSQL and structured JSON to stdout.
 */

export interface AuditEvent {
  actorUserId: string;
  actorEmail?: string;
  action:
    | "GRADE_SUBMISSION"
    | "GRADE_OVERRIDE"
    | "ROLE_CHANGE"
    | "APPLICATION_APPROVED"
    | "APPLICATION_REJECTED"
    | "STUDENT_ENROLLED"
    | "CERTIFICATE_ISSUED"
    | "AUTH_LOGIN_SUCCESS"
    | "AUTH_LOGIN_FAILURE"
    | "SYSTEM_SETTINGS_CHANGE";
  resourceTable: string;
  resourceId?: string;
  targetUserId?: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function isConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SERVICE_ROLE_KEY &&
      SUPABASE_URL !== "https://your-project-id.supabase.co" &&
      !SERVICE_ROLE_KEY.startsWith("your-service")
  );
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const timestamp = new Date().toISOString();

  // 1. Structured JSON output for centralized log aggregators
  const structuredEntry = {
    level: "audit",
    timestamp,
    ...event,
  };
  console.log(`[AUDIT] ${JSON.stringify(structuredEntry)}`);

  // 2. Persist to PostgreSQL audit_logs table if database is configured
  if (isConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify([
          {
            actor_user_id: event.actorUserId,
            actor_email: event.actorEmail || null,
            action: event.action,
            resource_table: event.resourceTable,
            resource_id: event.resourceId || null,
            target_user_id: event.targetUserId || null,
            previous_state: event.previousState || null,
            new_state: event.newState || null,
            ip_address: event.ipAddress || null,
            user_agent: event.userAgent || null,
            created_at: timestamp,
          },
        ]),
      });
    } catch (err) {
      console.error("[AuditLogger] Failed to persist audit log entry:", err);
    }
  }
}
