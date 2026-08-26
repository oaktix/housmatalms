/**
 * One-time migration: move every submission file from Supabase Storage /
 * legacy base64 rows onto the Cloudinary CDN, then rewrite
 * submissions.content_link to the CDN URL (+ content_public_id).
 *
 * Handles two source kinds:
 *  - `storage:<path>` refs into the private Supabase "submissions" bucket
 *  - base64 `data:` URLs stored directly in Postgres
 *
 * Rows already referencing Cloudinary (`https://`) are left untouched.
 * Supabase keeps data/state only — after this runs (with --delete-source)
 * no submission bytes remain in Supabase.
 *
 * Usage:
 *   node scripts/migrate-submissions-to-cloudinary.mjs [--dry-run] [--limit=N] [--delete-source]
 *   node scripts/migrate-submissions-to-cloudinary.mjs --cleanup-storage
 *
 * `--cleanup-storage` is a second pass: it walks the rollback CSV and deletes
 * each Supabase object, but ONLY after re-verifying the DB row now points at
 * the recorded Cloudinary URL. Creds come from .env.local
 * (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).
 *
 * Every migrated row is appended to scripts/.cloudinary-migration-rollback.csv
 * (submission_id, old_link, new_url) BEFORE the source copy is deleted, so a
 * bad run can be rolled back by re-pointing content_link at old_link.
 */

import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const DELETE_SOURCE = process.argv.includes("--delete-source");
const CLEANUP_STORAGE = process.argv.includes("--cleanup-storage");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROLLBACK_CSV = path.join(ROOT, "scripts", ".cloudinary-migration-rollback.csv");

function loadEnvLocal() {
  try {
    const raw = readFileSync(path.join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (err) {
    console.error("Could not read .env.local:", err.message);
    process.exit(1);
  }
}
loadEnvLocal();

const SUPA_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

for (const [name, val] of Object.entries({ SUPA_URL, SERVICE_KEY, CLOUD_NAME, API_KEY, API_SECRET })) {
  if (!val) { console.error(`Missing env var: ${name}`); process.exit(1); }
}

const H = { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY };
const BUCKET = "submissions";
const PAGE_SIZE = 500;
const FOLDER_ROOT = "housmata/submissions";

const MIME_BY_EXT = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", txt: "text/plain", csv: "text/csv",
  mp4: "video/mp4", webm: "video/webm", zip: "application/zip",
};
const mimeFromName = (n) => {
  const ext = n?.split(".").pop()?.toLowerCase();
  return ext ? MIME_BY_EXT[ext] : undefined;
};
const safeName = (n) => {
  const base = (n || "file").split(/[/\\]/).pop() || "file";
  const cleaned = base.replace(/[\x00-\x1f?#%&{}<>|"^`\s]+/g, "_").slice(0, 90);
  return cleaned.length ? cleaned : "file";
};

function signParams(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + API_SECRET).digest("hex");
}

async function fetchAllSubmissions() {
  const all = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/submissions?select=id,user_id,content_link,content_file_name&limit=${PAGE_SIZE}&offset=${offset}`,
      { headers: H }
    );
    if (!res.ok) throw new Error(`list submissions failed: ${res.status} ${await res.text()}`);
    const rows = await res.json();
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return all;
}

async function fetchStorageBytes(objectPath) {
  const res = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}/${objectPath}`, { headers: H });
  if (!res.ok) throw new Error(`storage fetch -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToCloudinary(userId, fileName, bytes, contentType) {
  const extMatch = fileName.match(/\.([A-Za-z0-9]{1,10})$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const baseName = safeName(ext ? fileName.slice(0, fileName.length - extMatch[0].length) : fileName);

  // PDFs as raw (bytes preserved); everything else auto-detected. Same rules
  // as /api/media/sign-upload so delivery behaviour stays consistent.
  const isPdf = ext === "pdf";
  const resourceType = isPdf ? "raw" : "auto";
  const publicId = isPdf ? `${randomUUID().slice(0, 8)}-${baseName}.${ext}` : `${randomUUID().slice(0, 8)}-${baseName}`;
  const folder = `${FOLDER_ROOT}/${userId}`;
  const timestamp = Math.round(Date.now() / 1000);

  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType || "application/octet-stream" }), fileName);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", API_KEY);
  // Must match signParams exactly — every non-file/api_key param sent must be signed.
  form.append("signature", signParams({ folder, public_id: publicId, timestamp: String(timestamp) }));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: "POST",
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.secure_url) {
    throw new Error(`cloudinary upload -> ${res.status} ${body?.error?.message || ""}`.trim());
  }
  return { secureUrl: body.secure_url, publicId: body.public_id, resourceType };
}

async function patchRow(id, { secureUrl, publicId }) {
  const res = await fetch(`${SUPA_URL}/rest/v1/submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ content_link: secureUrl, content_public_id: publicId }),
  });
  if (!res.ok) throw new Error(`patch ${id} -> ${res.status} ${(await res.text()).slice(0, 150)}`);
}

async function deleteStorageObject(objectPath) {
  const res = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "DELETE",
    headers: H,
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`storage delete -> ${res.status} ${(await res.text()).slice(0, 120)}`);
  }
  return res.status;
}

/** Minimal CSV line parser (handles quoted fields with escaped quotes). */
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * --cleanup-storage pass: read the rollback CSV and delete each Supabase
 * object, but only after confirming the row's content_link now equals the
 * recorded Cloudinary URL.
 */
async function cleanupFromCsv() {
  const lines = readFileSync(ROLLBACK_CSV, "utf8").split(/\r?\n/).filter(Boolean).slice(1);
  console.log(`rollback entries: ${lines.length}`);
  const stats = { deleted: 0, missing: 0, skipped: 0, failed: 0 };
  for (const line of lines) {
    const [id, oldLink, newUrl] = parseCsvLine(line);
    if (!oldLink || !oldLink.startsWith("storage:")) { stats.skipped++; continue; }
    const shortId = id.slice(0, 8);
    try {
      // Safety: the DB must point at the CDN copy before we drop the source.
      const res = await fetch(`${SUPA_URL}/rest/v1/submissions?select=content_link&id=eq.${id}`, { headers: H });
      const row = (await res.json())[0];
      if (!row || row.content_link !== newUrl) {
        console.error(`[skip] ${shortId}: DB link does not match rollback URL — not deleting.`);
        stats.skipped++;
        continue;
      }
      const status = await deleteStorageObject(oldLink.slice("storage:".length));
      if (status === 404) { stats.missing++; console.log(`[gone] ${shortId} (already deleted)`); }
      else { stats.deleted++; console.log(`[del] ${shortId} ${oldLink.slice("storage:".length)}`); }
    } catch (err) {
      console.error(`[fail] ${shortId}:`, err.message);
      stats.failed++;
    }
  }
  console.log("\n== CLEANUP SUMMARY ==");
  console.log(JSON.stringify(stats, null, 2));
  process.exit(stats.failed ? 2 : 0);
}

async function getRowBytes(row) {
  const link = row.content_link;
  if (link.startsWith("data:")) {
    const m = link.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
    if (!m) throw new Error("unparseable data URL");
    return { bytes: m[2] ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]), "utf8"), contentType: m[1] };
  }
  if (link.startsWith("storage:")) {
    const objectPath = link.slice("storage:".length).replace(/^\/+/, "");
    return { bytes: await fetchStorageBytes(objectPath), contentType: undefined, objectPath };
  }
  throw new Error(`unknown link kind: ${link.slice(0, 40)}`);
}

(async () => {
  if (CLEANUP_STORAGE) await cleanupFromCsv();
  console.log(DRY_RUN ? "== DRY RUN ==" : "== LIVE MIGRATION ==");
  console.log(`delete supabase copies after success: ${DELETE_SOURCE ? "yes" : "no"}`);

  const rows = await fetchAllSubmissions();
  console.log(`total submission rows: ${rows.length}`);

  const targets = [];
  let alreadyCloudinary = 0, noLink = 0;
  for (const row of rows) {
    if (!row.content_link) { noLink++; continue; }
    if (/^https?:\/\//i.test(row.content_link)) { alreadyCloudinary++; continue; }
    targets.push(row);
  }
  console.log(`already on cloudinary: ${alreadyCloudinary}, no file: ${noLink}, to migrate: ${targets.length}${LIMIT !== Infinity ? ` (limited to ${LIMIT})` : ""}`);

  if (!DRY_RUN) {
    if (!existsReported()) writeFileSync(ROLLBACK_CSV, "submission_id,old_link,new_url\n", "utf8");
  }

  const stats = { migrated: 0, sourceDeleted: 0, failed: 0, dryRun: 0 };
  const failures = [];

  for (const row of targets.slice(0, LIMIT)) {
    const shortId = row.id.slice(0, 8);
    const fileName = safeName(row.content_file_name);
    try {
      const payload = await getRowBytes(row);
      if (DRY_RUN) {
        console.log(`[dry] ${shortId} ${fileName} (${Math.round(payload.bytes.length / 1024)} KB)`);
        stats.dryRun++;
        continue;
      }

      const uploaded = await uploadToCloudinary(
        row.user_id || "unknown-user",
        fileName,
        payload.bytes,
        payload.contentType || mimeFromName(fileName)
      );

      // Record rollback info before mutating anything.
      appendFileSync(
        ROLLBACK_CSV,
        `${row.id},"${row.content_link.replace(/"/g, '""')}","${uploaded.secureUrl}"\n`,
        "utf8"
      );

      await patchRow(row.id, uploaded);

      // Only delete the Supabase copy once the DB points at the CDN.
      if (DELETE_SOURCE && payload.objectPath) {
        await deleteStorageObject(payload.objectPath);
        stats.sourceDeleted++;
      }

      stats.migrated++;
      console.log(`[ok] ${shortId} ${fileName} (${Math.round(payload.bytes.length / 1024)} KB -> ${uploaded.resourceType})`);
    } catch (err) {
      console.error(`[fail] ${shortId} ${fileName}:`, err.message);
      stats.failed++;
      failures.push(`${shortId} ${fileName}: ${err.message}`);
    }
  }

  console.log("\n== SUMMARY ==");
  console.log(JSON.stringify(stats, null, 2));
  if (!DRY_RUN && stats.migrated > 0) {
    console.log(`rollback log: ${ROLLBACK_CSV}`);
  }
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(" - " + f));
    process.exit(2);
  }
})();

function existsReported() {
  try {
    readFileSync(ROLLBACK_CSV, "utf8");
    return true;
  } catch {
    return false;
  }
}
