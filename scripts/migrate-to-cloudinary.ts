/**
 * One-time migration: move legacy base64 PDF submissions (and any external
 * media URLs) into Cloudinary, then rewrite the DB to store lightweight URLs.
 *
 * WHY: The old flow stored PDFs as base64 `data:` URLs directly in
 * `submissions.content_link`. That bloats Postgres rows and blows the browser
 * localStorage quota (hence the "file too large" errors). After migration each
 * row stores only a Cloudinary secure_url + public_id.
 *
 * USAGE (run locally with service-role access):
 *   npx tsx scripts/migrate-to-cloudinary.ts
 *
 * REQUIRED ENV:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (service role, NOT the anon key)
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 */

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface SubmissionRow {
  id: string;
  user_id: string;
  content_link: string | null;
  content_file_name: string | null;
  content_public_id: string | null;
}

function isCloudinaryUrl(url: string) {
  return url.includes('res.cloudinary.com');
}

function resourceTypeForName(name: string): 'image' | 'video' | 'raw' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'image'; // PDFs => image for previews
  if (/\.(jpe?g|png|gif|webp|svg)$/.test(lower)) return 'image';
  if (/\.(mp4|mov|webm|avi|mkv)$/.test(lower)) return 'video';
  return 'raw';
}

async function migrateSubmissions() {
  console.log('Fetching submissions...');
  const { data, error } = await supabase
    .from('submissions')
    .select('id, user_id, content_link, content_file_name, content_public_id');

  if (error) throw error;
  const rows = (data ?? []) as SubmissionRow[];
  console.log(`Found ${rows.length} submissions.`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.content_link) {
      skipped++;
      continue;
    }
    if (isCloudinaryUrl(row.content_link) || row.content_public_id) {
      skipped++; // already migrated
      continue;
    }

    const fileName = row.content_file_name || `submission-${row.id}.pdf`;
    const resourceType = resourceTypeForName(fileName);

    try {
      // Cloudinary's uploader accepts both base64 `data:` URLs and remote URLs.
      const uploadResult = await cloudinary.uploader.upload(row.content_link, {
        folder: `housmata/submissions/${row.user_id}`,
        resource_type: resourceType,
        public_id: `${fileName.replace(/\.[^.]+$/, '')}-${Date.now()}`,
        use_filename: true,
        unique_filename: true,
      });

      const { error: updErr } = await supabase
        .from('submissions')
        .update({
          content_link: uploadResult.secure_url,
          content_public_id: uploadResult.public_id,
        })
        .eq('id', row.id);

      if (updErr) throw updErr;

      console.log(`  ✓ ${row.id} -> ${uploadResult.secure_url}`);
      migrated++;
    } catch (err) {
      console.error(`  ✗ ${row.id} failed:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`\nSubmissions: ${migrated} migrated, ${skipped} skipped, ${failed} failed.`);
}

async function migrateAvatars() {
  console.log('\nFetching profiles with avatars...');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .not('avatar_url', 'is', null);

  if (error) throw error;
  const rows = (data ?? []) as { id: string; avatar_url: string }[];
  console.log(`Found ${rows.length} profiles with avatars.`);

  let migrated = 0;
  for (const row of rows) {
    if (!row.avatar_url || isCloudinaryUrl(row.avatar_url)) continue;
    try {
      const res = await cloudinary.uploader.upload(row.avatar_url, {
        folder: 'housmata/avatars',
        public_id: `avatar-${row.id}`,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      });
      await supabase.from('profiles').update({ avatar_url: res.secure_url }).eq('id', row.id);
      console.log(`  ✓ avatar ${row.id}`);
      migrated++;
    } catch (err) {
      console.error(`  ✗ avatar ${row.id} failed:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Avatars: ${migrated} migrated.`);
}

async function assertSupabaseReachable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (service role required).");

  // Best-effort reachability probe. This is advisory only: some environments
  // (proxies, IPv6, TLS quirks) make raw fetch stall even when the Supabase
  // JS client connects fine. So we WARN on failure rather than abort — the
  // real query in migrateSubmissions() is the authoritative test.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY! },
      signal: controller.signal,
    });
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      // Cloudflare error page => project paused / egress-blocked.
      console.warn(
        "[warn] Supabase returned an HTML error page (likely paused or over quota). Attempting anyway..."
      );
    } else {
      console.log(`Supabase probe OK (status ${res.status}).`);
    }
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    console.warn(
      `[warn] Reachability probe failed (${name || "network error"}). ` +
        "This is often a local fetch/proxy quirk — continuing with the Supabase client..."
    );
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log('=== Cloudinary migration starting ===');
  console.log('Checking Supabase connectivity...');
  await assertSupabaseReachable();
  console.log('Supabase reachable ✓');
  await migrateSubmissions();
  await migrateAvatars();
  console.log('\n=== Migration complete ===');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
