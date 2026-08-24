/**
 * One-time migration: Cloudinary JSON document store -> Supabase.
 *
 * During the "Cloudinary mini-backend workaround" era, writes were mirrored to
 * Cloudinary as raw JSON assets under housmata/_store/<collection>/<id>.json.
 * This script pulls every record and upserts it into the matching Supabase
 * table by primary key `id`, so it is idempotent and safe to re-run.
 *
 * Usage:  node scripts/migrate-cloudinary-store.mjs [--dry-run]
 * Creds are read from .env.local (CLOUDINARY_*, SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- tiny .env.local loader -------------------------------------------------
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

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const SUPA_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

for (const [name, val] of Object.entries({ CLOUD_NAME, API_KEY, API_SECRET, SUPA_URL, SERVICE_KEY })) {
  if (!val) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
}

const PREFIX = "housmata/_store";

async function listAllRawResources() {
  const resources = [];
  let nextCursor = undefined;
  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/raw`);
    url.searchParams.set("type", "upload");
    url.searchParams.set("prefix", PREFIX);
    url.searchParams.set("max_results", "500");
    if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
    const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    if (!res.ok) throw new Error(`Cloudinary list failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    resources.push(...(json.resources || []));
    nextCursor = json.next_cursor;
  } while (nextCursor);
  return resources;
}

async function fetchRecord(secureUrl) {
  const res = await fetch(secureUrl);
  if (!res.ok) throw new Error(`fetch ${secureUrl} -> ${res.status}`);
  return res.json();
}

/** Table columns from the PostgREST OpenAPI spec, so we can strip fields the
 * live DB doesn't have (e.g. content_public_id if a migration wasn't applied). */
async function loadTableColumns() {
  const res = await fetch(`${SUPA_URL}/rest/v1/`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`Cannot load schema: ${res.status}`);
  const spec = await res.json();
  const cols = {};
  for (const [table, def] of Object.entries(spec.definitions || {})) {
    cols[table] = new Set(Object.keys(def.properties || {}));
  }
  return cols;
}

function pickKnownColumns(record, knownColumns) {
  const clean = {};
  const dropped = [];
  for (const [key, value] of Object.entries(record)) {
    if (!knownColumns || knownColumns.has(key)) clean[key] = value;
    else dropped.push(key);
  }
  return { clean, dropped };
}

async function upsert(table, record) {
  const url = `${SUPA_URL}/rest/v1/${table}?on_conflict=id`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify([record]),
  });
  if (!res.ok) {
    const err = new Error(`upsert ${table}/${record.id} -> ${res.status} ${await res.text()}`);
    err.status = res.status;
    throw err;
  }
}

/** Resolve unique-constraint conflicts (e.g. applications.email): keep whichever
 * row is newer and update the surviving row in place. */
async function resolveEmailConflict(table, record) {
  const lookup = await fetch(
    `${SUPA_URL}/rest/v1/${table}?select=*&email=eq.${encodeURIComponent(record.email)}`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  if (!lookup.ok) throw new Error(`lookup failed (${lookup.status})`);
  const existing = await lookup.json();
  if (!Array.isArray(existing) || existing.length === 0) {
    throw new Error("email conflict but no existing row found");
  }
  const current = existing[0];
  const cloudTime = new Date(record.created_at || 0).getTime();
  const dbTime = new Date(current.created_at || 0).getTime();
  if (cloudTime <= dbTime) return "kept-database-row";

  // Cloud copy is newer — update the existing row in place (keep its id).
  const { id: _ignored, ...payload } = record;
  const patch = await fetch(
    `${SUPA_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(current.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!patch.ok) throw new Error(`patch failed (${patch.status}) ${await patch.text()}`);
  return "updated-with-cloud-copy";
}

async function countRows(table) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?select=id&limit=1`, {
    method: "HEAD",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: "count=exact",
    },
  });
  const range = res.headers.get("content-range") || "";
  const m = range.match(/\/(\d+)/);
  return m ? Number(m[1]) : null;
}

async function main() {
  console.log("Loading live table schemas...");
  const tableColumns = await loadTableColumns();

  console.log(`Listing raw resources with prefix "${PREFIX}"...`);
  const resources = await listAllRawResources();
  console.log(`Found ${resources.length} stored records.\n`);

  const stats = {};
  for (const r of resources) {
    // public_id shape: housmata/_store/<collection>/<id>
    const parts = r.public_id.split("/");
    if (parts.length < 4) continue;
    const collection = parts[2];
    const id = parts[3];

    try {
      const rawRecord = await fetchRecord(r.secure_url);
      stats[collection] ??= { ok: 0, skip: 0, err: 0, notes: new Set() };
      if (!rawRecord || typeof rawRecord !== "object" || !rawRecord.id) {
        stats[collection].skip++;
        continue;
      }
      if (String(rawRecord.id) !== String(id)) {
        console.warn(`  ! id mismatch in ${r.public_id}: record.id=${rawRecord.id}`);
      }

      if (DRY_RUN) {
        stats[collection].ok++;
        continue;
      }

      const { clean, dropped } = pickKnownColumns(rawRecord, tableColumns[collection]);
      if (dropped.length > 0) {
        stats[collection].notes.add(`dropped unknown columns: ${dropped.join(", ")}`);
      }

      try {
        await upsert(collection, clean);
        stats[collection].ok++;
      } catch (err) {
        if (err.status === 409 && clean.email && collection === "applications") {
          const outcome = await resolveEmailConflict(collection, clean);
          stats[collection].notes.add(outcome);
          stats[collection].ok++;
        } else {
          throw err;
        }
      }
    } catch (err) {
      stats[collection] ??= { ok: 0, skip: 0, err: 0, notes: new Set() };
      stats[collection].err++;
      console.warn(`  x ${r.public_id}: ${err.message}`);
    }
  }

  console.log("\nMigration summary" + (DRY_RUN ? " (DRY RUN)" : "") + ":");
  for (const [collection, s] of Object.entries(stats)) {
    console.log(
      `  ${collection.padEnd(20)} migrated=${s.ok} skipped=${s.skip} failed=${s.err}`
    );
    for (const note of s.notes) console.log(`      - ${note}`);
  }

  if (!DRY_RUN) {
    console.log("\nPost-migration row counts in Supabase:");
    for (const collection of Object.keys(stats)) {
      try {
        console.log(`  ${collection.padEnd(20)} ${await countRows(collection)}`);
      } catch {
        console.log(`  ${collection.padEnd(20)} ?`);
      }
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
