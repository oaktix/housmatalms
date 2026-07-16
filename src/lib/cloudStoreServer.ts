/**
 * Cloudinary JSON document store — SERVER-ONLY layer.
 *
 * Uses the Cloudinary admin API (api_key/api_secret). Imported exclusively by
 * the /api/store route handler. Never import from a "use client" module.
 *
 * Each record is stored as a small JSON file (raw resource) under:
 *   housmata/_store/<collection>/<id>.json
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const STORE_FOLDER = "housmata/_store";

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

function isConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function publicIdFor(collection: string, id: string): string {
  return `${STORE_FOLDER}/${collection}/${id}`;
}

async function uploadJson(publicId: string, record: unknown): Promise<void> {
  const json = JSON.stringify(record);
  const dataUri = `data:application/json;base64,${Buffer.from(json, "utf8").toString("base64")}`;
  await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    resource_type: "raw",
    overwrite: true,
    invalidate: true,
  });
}

async function fetchJson<T>(publicId: string): Promise<T | null> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "raw",
    });
    const url: string = result?.secure_url;
    if (!url) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function deleteJson(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch {
    // best-effort
  }
}

async function listCollection<T>(collection: string): Promise<T[]> {
  try {
    const folder = `${STORE_FOLDER}/${collection}`;
    const result = await cloudinary.api.resources_by_asset_folder(folder, {
      resource_type: "raw",
      max_results: 500,
    });
    const resources: { public_id: string }[] = result?.resources ?? [];
    const items = (await Promise.all(
      resources.map((r) => fetchJson<T>(r.public_id))
    )) as (T | null)[];
    return items.filter((x): x is T => x !== null);
  } catch {
    return [];
  }
}

/** Persist a single record. Never throws. */
export async function cloudStorePut(
  collection: string,
  id: string,
  record: unknown
): Promise<boolean> {
  if (!isConfigured() || !KNOWN_COLLECTIONS.includes(collection) || !id) return false;
  try {
    await uploadJson(publicIdFor(collection, id), record);
    return true;
  } catch (err) {
    console.warn(`[cloudStore] put failed (${collection}/${id}):`, err);
    return false;
  }
}

/** Remove a single record (best-effort). */
export async function cloudStoreDelete(collection: string, id: string): Promise<void> {
  if (!isConfigured() || !id) return;
  await deleteJson(publicIdFor(collection, id));
}

/** Fetch all records in a collection (best-effort). */
export async function cloudStoreList<T>(collection: string): Promise<T[]> {
  if (!isConfigured() || !KNOWN_COLLECTIONS.includes(collection)) return [];
  return listCollection<T>(collection);
}
