# HANDOFF: Cloudinary Media Migration + Supabase Egress Fix

**Project:** Housmata LMS (`housmatalms-main`)
**Stack:** Next.js 15 (App Router), TypeScript, Supabase (Postgres), Cloudinary (new), Resend (email)
**OS/Shell for dev:** Windows / PowerShell 5.1
**Last updated:** 2026-07-16

---

## 1. TL;DR — Where we are

We are migrating uploaded media (**primarily PDF assignment submissions**) OFF Supabase and ONTO Cloudinary, because the app was storing PDFs as **base64 `data:` URLs directly in `submissions.content_link`**. That bloated Postgres rows and blew the Supabase **egress quota**, which took the project offline (Cloudflare `522` errors).

**All code is written and type-checks clean.** The ONLY remaining step — running the one-time data migration script — is **BLOCKED** because the Supabase origin DB is unreachable (paused/throttled due to the egress limit). The edge (Cloudflare) responds, but real DB queries time out with `522`.

---

## 2. Root cause (important context)

- Old flow: student uploads PDF → `FileReader.readAsDataURL()` → base64 stored in `submissions.content_link` (Postgres + browser localStorage).
- `src/lib/db.ts` `syncFromSupabase()` did `select("*")` on **every table on every load AND every realtime change** → re-downloaded all base64 PDFs constantly → massive egress → quota hit → project throttled → `522`.
- This also caused the original "file too large / under 4MB" localStorage `QuotaExceededError` in `db.ts`.

Symptom nuance: hitting `https://<project>.supabase.co/rest/v1/` in a **browser** returns `{"message":"No API key found..."}` (served by Cloudflare edge — looks "up"), but **actual data queries** hit the origin DB and return Cloudflare `522`. Edge up + origin down = classic **usage-limit suspension**.

---

## 3. What has been DONE (all committed to working tree, not git-committed)

### New files
- `src/lib/cloudinary.ts` — WAIT, this was removed. Ignore. (Cloudinary is configured inline in API routes.)
- `src/lib/cloudinaryUpload.ts` — client helper: gets signed params from our API, uploads file DIRECTLY to Cloudinary (XHR w/ progress). PDFs uploaded as Cloudinary `image` resource_type (unlocks first-page thumbnails + inline preview). Exports `uploadToCloudinary`, `resourceTypeFor`, `pdfThumbnailUrl`, `pdfUrl`, type `UploadedMedia`.
- `src/app/api/media/upload-signed/route.ts` — server: generates Cloudinary upload signature (signs `timestamp` + `folder`). Secret stays server-side.
- `src/app/api/media/route.ts` — `DELETE` endpoint to destroy a Cloudinary asset (add admin auth before prod use).
- `src/components/MediaUploader.tsx` — drag & drop uploader, PDF-first, progress bar, size validation.
- `src/components/CloudinaryMedia.tsx` — display components: `CloudinaryImage`, `CloudinaryVideo`, `CloudinaryPdf`, and smart `CloudinaryAsset`.
- `supabase/migrations/20260716_01_create_media_assets.sql` — optional `media_assets` catalog table + RLS.
- `supabase/migrations/20260716_02_add_submission_public_id.sql` — adds `content_public_id` column to `submissions`.
- `scripts/migrate-to-cloudinary.ts` — ONE-TIME migration: reads legacy base64/external URLs from `submissions.content_link` and `profiles.avatar_url`, uploads to Cloudinary, rewrites DB rows to store only the URL + public_id. **Idempotent** (skips rows already on Cloudinary). Has an advisory (non-fatal) connectivity probe.
- `specs/cloudinary-migration-design.md` — full design doc.
- `.env.local` — env template; user has filled real values (do NOT commit).

### Edited files
- `src/lib/mockData.ts` — added `content_public_id?: string` to `Submission` interface.
- `src/app/lms/student/curriculum/page.tsx` — `submitAssignment` now uploads PDF to Cloudinary via `uploadToCloudinary` instead of base64; stores `content_link` (secureUrl) + `content_public_id`. Added import.
- `src/lib/db.ts` — **EGRESS FIX**:
  - `syncFromSupabase()` submissions sync now selects only light columns (excludes `content_link`, `content_text`). Added per-table `columns` option.
  - Added `getSubmissionFile(submissionId)` — lazily fetches the heavy file for ONE submission on demand and caches it.
  - Fixed a cast to `data as unknown as seeds.Submission[]`.
- `src/app/lms/instructor/grading/page.tsx` — opening a submission lazily loads the PDF via `db.getSubmissionFile`; added a "Loading submitted document…" placeholder.
- `src/app/lms/admin/students/page.tsx` — Download link replaced with on-demand button that lazily fetches the file via `db.getSubmissionFile` (added `handleDownloadSubmission` + `downloadingSubId` state).

### Removed
- `src/app/api/upload/route.ts` (redundant)
- root `lib/cloudinary.ts` (redundant)

---

## 4. Verification status

- `npx tsc --noEmit` on changed files: **clean**, except:
  - Pre-existing `lucide-react` TS7016 "no declaration file" warnings across the whole project (NOT ours; Next build tolerates).
  - Pre-existing `src/lib/db.ts(95)` `payload` implicit-any (untouched legacy code; confirmed not in our diff).
- `npm run build` currently FAILS locally due to a **corrupted native toolchain** (`@next/swc-win32-x64-msvc ... is not a valid Win32 application` + `lightningcss` missing `.node`). This is an ENV issue from interrupted installs, NOT our code. Fix: `rm -rf node_modules && npm install`.

---

## 5. THE BLOCKER (what's stopping completion)

`scripts/migrate-to-cloudinary.ts` cannot run: Supabase **origin DB returns Cloudflare `522`** on real queries. The project is paused/throttled from the egress overage.

### To unblock (requires USER action in Supabase dashboard — agent cannot do this):
1. Open https://supabase.com/dashboard → the project.
2. If "Paused" → **Restore** (may take minutes, may need retry).
3. Check **Reports → Usage** / **Billing**: if over a hard limit, either **upgrade to Pro / lift spend cap** (unblocks immediately, recommended so migration can read the data), or wait for **monthly usage reset**.
4. Confirm origin is truly up: the migration's real query must succeed (browser `/rest/v1/` returning JSON is NOT sufficient — that's just the edge).

### Catch-22 note
The migration must READ from the DB (uses egress) to move files out. If fully blocked, upgrading to Pro temporarily is the most reliable path to run the one-time migration; egress collapses afterward (files served by Cloudinary CDN), then downgrade is possible.

---

## 6. NEXT STEPS for the picking-up agent

1. **Confirm Supabase is genuinely reachable** (real query, not edge). Then run:
   ```
   npx tsx --env-file=.env.local scripts/migrate-to-cloudinary.ts
   ```
   (run from project root; PowerShell — use `workdir`, not `cd`). It's idempotent; safe to re-run.
2. **Apply the two SQL migrations** in Supabase (if not already):
   - `supabase/migrations/20260716_01_create_media_assets.sql`
   - `supabase/migrations/20260716_02_add_submission_public_id.sql`
3. After migration, **verify** a few `submissions.content_link` values are now `https://res.cloudinary.com/...` and `content_public_id` is populated.
4. Optional but recommended egress hardening still TODO:
   - **Trim `email_logs`** (and other unbounded tables) from the `syncFromSupabase()` full sync in `src/lib/db.ts` — it grows without bound and adds egress on every sync. (User was offered this; not yet done.)
   - Consider scoping the realtime full-resync to specific tables instead of `schema: "public"` wildcard.
5. Fix local build env if needed: `rm -rf node_modules && npm install` (repairs SWC/lightningcss native binaries), then `npm run build` to confirm.

---

## 7. Env vars required (`.env.local`, already filled by user — keep secret)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only; used by migration script
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=              # server-only
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=  # public; used by browser to build URLs
RESEND_API_KEY=                     # verify exact name expected by /api/send-email
```
Confirm `.env.local` is gitignored (was flagged, not yet verified).

---

## 8. Decisions / guardrails already established

- **Rejected: "fallback second Supabase account to share quota."** Not a real feature; quotas are per-project and non-poolable; multi-accounting to dodge limits violates Supabase ToS and doesn't fix root cause. Correct answer = finish Cloudinary migration + sync trimming; upgrade the ONE project to Pro if real usage still exceeds free tier.
- **Never accept user personal access tokens / secrets** (user asked early on to hand over a Supabase PAT — declined).
- PDFs stored on Cloudinary as `image` resource_type on purpose (thumbnails/preview). `raw` is the alternative if pure-download is preferred.
- Grading iframe is backwards-compatible: renders both legacy base64 (if any remain) and new Cloudinary URLs.

---

## 9. Quick file index (paths relative to project root)

- Upload helper: `src/lib/cloudinaryUpload.ts`
- Upload API: `src/app/api/media/upload-signed/route.ts`
- Delete API: `src/app/api/media/route.ts`
- Uploader UI: `src/components/MediaUploader.tsx`
- Display UI: `src/components/CloudinaryMedia.tsx`
- DB layer (egress fix + lazy fetch): `src/lib/db.ts`
- Student submit flow: `src/app/lms/student/curriculum/page.tsx`
- Grading (lazy load): `src/app/lms/instructor/grading/page.tsx`
- Admin students (lazy download): `src/app/lms/admin/students/page.tsx`
- Migration script: `scripts/migrate-to-cloudinary.ts`
- SQL migrations: `supabase/migrations/20260716_01_*.sql`, `20260716_02_*.sql`
- Design doc: `specs/cloudinary-migration-design.md`
