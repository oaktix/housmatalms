/**
 * Cloudinary JSON document store — CLIENT-SAFE layer.
 *
 * This module must never import the Cloudinary admin SDK (api_key/api_secret),
 * because it is pulled in by client components via db.ts. All server-side work
 * lives in ./cloudStoreServer and is reached through the /api/store route.
 *
 * Each record is stored as a small JSON file under:
 *   housmata/_store/<collection>/<id>.json
 *
 * Durable fallback for writes when Supabase is over quota/unreachable, and a
 * permanent always-on backup. Already-configured Cloudinary creds means no new
 * secrets are required.
 */

const KNOWN_COLLECTIONS = [
  "submissions",
  "applications",
  "quiz_attempts",
  "student_progress",
  "cohort_members",
  "announcements",
  "meetings",
  "attendance",
  "certificates",
  "graduate_status",
  "email_logs",
  "survey_responses",
  "profiles",
  "instructors",
  "cohorts",
];

/** Map a Supabase table name to its Cloudinary store collection. */
export function collectionForTable(table: string): string | null {
  return KNOWN_COLLECTIONS.includes(table) ? table : null;
}

function isBrowserSafe(): boolean {
  return typeof window !== "undefined";
}

/** Client: persist a record via the API route. Never throws. */
export async function cloudStorePutClient(
  collection: string,
  id: string,
  record: unknown
): Promise<boolean> {
  if (!isBrowserSafe() || !KNOWN_COLLECTIONS.includes(collection) || !id) return false;
  try {
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, id, record }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

/** Client: fetch all records in a collection via the API route. */
export async function cloudStoreListClient<T>(collection: string): Promise<T[]> {
  if (!isBrowserSafe() || !KNOWN_COLLECTIONS.includes(collection)) return [];
  try {
    const res = await fetch(`/api/store?collection=${encodeURIComponent(collection)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.records as T[]) ?? [];
  } catch {
    return [];
  }
}
