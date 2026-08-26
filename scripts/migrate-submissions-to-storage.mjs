/**
 * One-time migration: copy every submission file into Supabase Storage and
 * rewrite submissions.content_link to a lightweight `storage:<path>` ref.
 *
 * Handles the three legacy payload kinds found in the wild:
 *  - base64 `data:` URLs stored directly in Postgres (up to ~8 MB per row)
 *  - Cloudinary delivery URLs (docx/raw deliver fine)
 *  - Cloudinary PDF URLs that 401 while "Allow delivery of PDF and ZIP files"
 *    has not propagated yet -> falls back to rebuilding the PDF from
 *    Cloudinary's per-page JPEG transforms (pg_N,f_jpg), so grading previews
 *    work immediately. Originals stay recoverable via the report file.
 *
 * Rows already referencing Storage (`storage:` prefix) or without a file link
 * are skipped. Idempotent: re-running overwrites objects and rewrites rows.
 *
 * Usage: node scripts/migrate-submissions-to-storage.mjs [--dry-run] [--limit=N]
 * Creds come from .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * CLOUDINARY_* not required).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const MAX_REBUILD_PAGES = 40;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = path.join(ROOT, "scripts", ".migration-report.json");
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
for (const [name, val] of Object.entries({ SUPA_URL, SERVICE_KEY })) {
  if (!val) { console.error(`Missing env var: ${name}`); process.exit(1); }
}

const H = { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY };
const BUCKET = "submissions";
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

async function fetchAllSubmissions() {
  const res = await fetch(`${SUPA_URL}/rest/v1/submissions?select=id,content_link,content_file_name,content_public_id&limit=2000`, { headers: H });
  if (!res.ok) throw new Error(`list submissions failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function uploadObject(objectPath, bytes, contentType) {
  const res = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { ...H, "Content-Type": contentType, "x-upsert": "true" },
    body: bytes,
  });
  if (!res.ok) throw new Error(`upload ${objectPath} -> ${res.status} ${(await res.text()).slice(0, 150)}`);
}

async function patchRow(id, storageRef) {
  const res = await fetch(`${SUPA_URL}/rest/v1/submissions?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ content_link: storageRef }),
  });
  if (!res.ok) throw new Error(`patch ${id} -> ${res.status} ${(await res.text()).slice(0, 150)}`);
}

async function getLegacyBytes(row) {
  const link = row.content_link;
  if (link.startsWith("data:")) {
    const m = link.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
    if (!m) throw new Error("unparseable data URL");
    const mime = m[1] || undefined;
    const bytes = m[2]
      ? Buffer.from(m[3], "base64")
      : Buffer.from(decodeURIComponent(m[3]), "utf8");
    return { bytes, contentType: mime };
  }
  if (/^https?:\/\//i.test(link)) {
    const res = await fetch(link, { redirect: "follow" });
    if (!res.ok) {
      const err = new Error(`source fetch -> ${res.status}`);
      err.blocked = res.status === 401 || res.status === 403;
      throw err;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { bytes: buf, contentType: res.headers.get("content-type") || undefined };
  }
  throw new Error(`unknown link kind: ${link.slice(0, 40)}`);
}

// ---------------------------------------------------------------------------
// PDF recovery from Cloudinary page-image transforms
// ---------------------------------------------------------------------------

/** Read pixel dimensions from a JPEG buffer (SOF0/SOF1/SOF2 markers). */
function jpegSize(buf) {
  let off = 2;
  while (off < buf.length - 8) {
    if (buf[off] !== 0xff) { off++; continue; }
    const marker = buf[off + 1];
    // SOF0..SOF15 except DHT(C4)/DAC(CC)/RST
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
    }
    const len = buf.readUInt16BE(off + 2);
    off += 2 + len;
  }
  throw new Error("not a baseline jpeg");
}

/** Build a simple valid PDF embedding each JPEG as one full-bleed page. */
function buildPdfFromJpegs(pages) {
  const enc = (s) => Buffer.from(s, "latin1");

  // Allocate CONTIGUOUS object numbers (xref requires every number 1..max).
  let nextId = 3; // 1 = catalog, 2 = pages tree
  const contentIds = pages.map(() => nextId++);
  const pageIds = pages.map(() => nextId++);
  const imageIds = pages.map(() => nextId++);

  const chunks = []; // {num, body:Buffer}
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  chunks.push({ num: 1, body: enc("<< /Type /Catalog /Pages 2 0 R >>") });
  chunks.push({ num: 2, body: enc(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`) });

  pages.forEach((page, i) => {
    const { width, height, data } = page;

    const content = Buffer.from(`q\n${width} 0 0 ${height} 0 0 cm\n/Im Do\nQ\n`, "latin1");
    chunks.push({
      num: contentIds[i],
      body: Buffer.concat([
        enc(`<< /Length ${content.length} >>\nstream\n`),
        content,
        enc("\nendstream"),
      ]),
    });
    chunks.push({
      num: pageIds[i],
      body: enc(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] ` +
          `/Resources << /XObject << /Im ${imageIds[i]} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`
      ),
    });
    chunks.push({
      num: imageIds[i],
      body: Buffer.concat([
        enc(
          `<< /Type /XObject /Subtype /Image /Width ${page.pxWidth} /Height ${page.pxHeight} ` +
            `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`
        ),
        data,
        enc("\nendstream"),
      ]),
    });
  });

  const maxNum = nextId - 1;
  const header = enc("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // Order objects by number and record byte offsets for the xref table.
  const ordered = [...chunks].sort((a, b) => a.num - b.num);
  const offsets = new Map();
  const bodyParts = [];
  let offset = header.length;
  for (const c of ordered) {
    offsets.set(c.num, offset);
    const head = enc(`${c.num} 0 obj\n`);
    const tail = enc("\nendobj\n");
    bodyParts.push(head, c.body, tail);
    offset += head.length + c.body.length + tail.length;
  }

  const xrefParts = [enc(`xref\n0 ${maxNum + 1}\n0000000000 65535 f \n`)];
  for (let n = 1; n <= maxNum; n++) {
    xrefParts.push(enc(`${String(offsets.get(n)).padStart(10, "0")} 00000 n \n`));
  }
  const trailer = enc(
    `trailer\n<< /Size ${maxNum + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`
  );

  return Buffer.concat([header, ...bodyParts, ...xrefParts, trailer]);
}

/** Fetch each page of a Cloudinary-hosted PDF as JPEG and rebuild a PDF. */
async function rebuildPdfFromCloudinary(url) {
  // url looks like https://res.cloudinary.com/<cloud>/<rtype>/upload/vNNN/<pid>.pdf
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+)\/([^/]+)\/upload\/(?:v\d+\/)?(.+)\.pdf(\?.*)?$/i);
  if (!m) throw new Error("unrecognised cloudinary pdf url");
  const [, host, rtype, pid] = m;
  const pages = [];
  for (let pg = 1; pg <= MAX_REBUILD_PAGES; pg++) {
    const u = `${host}/${rtype}/upload/pg_${pg},f_jpg,dpr_1/${pid}.jpg`;
    const res = await fetch(u);
    if (!res.ok) break;
    const data = Buffer.from(await res.arrayBuffer());
    const size = jpegSize(data);
    // Cap page point-size to something sane (max 1400pt on long side)
    const longSide = Math.max(size.width, size.height);
    const scale = longSide > 1400 ? 1400 / longSide : 1;
    pages.push({
      data,
      pxWidth: size.width,
      pxHeight: size.height,
      width: Math.round(size.width * scale),
      height: Math.round(size.height * scale),
    });
  }
  if (!pages.length) throw new Error("no pages could be recovered");
  return { bytes: buildPdfFromJpegs(pages), contentType: "application/pdf" };
}

// ---------------------------------------------------------------------------

(async () => {
  console.log(DRY_RUN ? "== DRY RUN ==" : "== LIVE MIGRATION ==");
  const rows = await fetchAllSubmissions();
  console.log(`total submission rows: ${rows.length}`);

  const targets = [];
  let alreadyStorage = 0, noLink = 0;
  for (const row of rows) {
    if (!row.content_link) { noLink++; continue; }
    if (row.content_link.startsWith("storage:")) { alreadyStorage++; continue; }
    targets.push(row);
  }
  console.log(`already on storage: ${alreadyStorage}, no file: ${noLink}, to migrate: ${targets.length}${LIMIT !== Infinity ? ` (limited to ${LIMIT})` : ""}`);

  const report = existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, "utf8")) : {};
  const stats = { migratedOriginal: 0, migratedRebuilt: 0, failed: 0, dryRun: 0 };
  const failures = [];

  for (const row of targets.slice(0, LIMIT)) {
    const shortId = row.id.slice(0, 8);
    const fileName = safeName(row.content_file_name);
    const objectPath = `migrated/${row.id}/${fileName}`;
    try {
      let payload;
      try {
        payload = await getLegacyBytes(row);
        if (DRY_RUN) console.log(`[dry-original] ${shortId} ${fileName} (${Math.round(payload.bytes.length / 1024)} KB)`);
      } catch (err) {
        if (!err.blocked) throw err;
        if (!/\.pdf$/i.test(fileName)) throw err;
        if (DRY_RUN) {
          console.log(`[dry-rebuild] ${shortId} ${fileName} (original blocked, will rebuild from page images)`);
          stats.dryRun++;
          continue;
        }
        console.log(`[rebuild] ${shortId} ${fileName}: original blocked, rebuilding from page images…`);
        payload = await rebuildPdfFromCloudinary(row.content_link);
        report[row.id] = {
          fileName,
          rebuiltFrom: row.content_link,
          note: "Original blocked by Cloudinary PDF-delivery restriction; reconstructed from page JPEGs.",
        };
        stats.migratedRebuilt++;
      }

      if (DRY_RUN) { stats.dryRun++; continue; }
      const ct = payload.contentType || mimeFromName(fileName) || "application/octet-stream";
      await uploadObject(objectPath, payload.bytes, ct);
      await patchRow(row.id, `storage:${objectPath}`);
      console.log(`[ok] ${shortId} ${fileName} (${Math.round(payload.bytes.length / 1024)} KB, ${ct})`);
      if (!(row.id in report && report[row.id]?.rebuiltFrom)) stats.migratedOriginal++;
    } catch (err) {
      console.error(`[fail] ${shortId} ${fileName}:`, err.message);
      stats.failed++;
      failures.push(`${shortId} ${fileName}: ${err.message}`);
    }
  }

  if (!DRY_RUN && Object.keys(report).length) {
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`report written: scripts/.migration-report.json (${Object.keys(report).length} rebuilt files)`);
  }

  console.log("\n== SUMMARY ==");
  console.log(JSON.stringify(stats, null, 2));
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(" - " + f));
    process.exit(2);
  }
})();
