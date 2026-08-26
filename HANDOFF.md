# HANDOFF — UI/UX Overhaul & Cloudinary Mini-Backend

> **UPDATE (2026-08-26): Cloudinary is the sole media CDN again; Supabase stores data/state only.**
> - New uploads: browser asks `POST /api/media/sign-upload` (server signs with
>   `CLOUDINARY_*`), then POSTs the file straight to Cloudinary (no server proxy,
>   real progress events). PDFs go up as `resource_type: raw` (extension kept in
>   public_id); everything else uses `auto`. Folder: `housmata/submissions/<userId>`.
> - Client helper: `src/lib/cloudinaryUpload.ts` (`uploadSubmissionFile` →
>   `{ secureUrl, publicId, ... }`). The old `storageUpload.ts` and
>   `/api/media/storage-upload` route were deleted.
> - `submissions.content_link` = Cloudinary secure URL, `content_public_id` = asset id.
> - Serving/preview still flows through `/api/media/file?id=...` which 302-redirects
>   to the CDN. Downloads (`?download=1`) get a bare `fl_attachment` flag appended —
>   Cloudinary then serves `Content-Disposition: attachment` with the asset's
>   ORIGINAL filename (flag values containing dots are rejected with 400; do not
>   use `fl_attachment:<name>`). Inline preview needs NO flag: raw deliveries carry
>   no Content-Disposition, so browsers render them by content-type.
>   Legacy `data:`/`storage:` rows are still streamed as before (none remain).
> - MIGRATION COMPLETE (2026-08-26): all 181 submission rows now point at the CDN;
>   the Supabase "submissions" bucket is EMPTY. Rollback map:
>   `scripts/.cloudinary-migration-rollback.csv`. Re-run tools:
>   `node scripts/migrate-submissions-to-cloudinary.mjs [--dry-run|--limit=N|--delete-source]`
>   and `--cleanup-storage` (CSV-driven deletion with DB-link safety check).
> - REQUIRED for PDF delivery: enable **Settings → Security → "Allow delivery of
>   PDF and ZIP files"** in the Cloudinary console, otherwise PDF URLs return 401
>   (verified live on this account). Images/videos are unaffected.

> **UPDATE (2026-08): The Cloudinary mini-backend has been REMOVED.**
> All DB access now goes through `src/app/api/db/[table]/route.ts`, a server
> route authenticated with `SUPABASE_SERVICE_ROLE_KEY` (the browser never talks
> to Supabase directly anymore). `cloudStore.ts`, `cloudStoreServer.ts` and
> `/api/store` were deleted. Stranded Cloudinary `_store` records were migrated
> to Supabase via `scripts/migrate-cloudinary-store.mjs`.

This document lets another agent continue the UI/UX overhaul + Cloudinary fallback work
if the current session is interrupted. Repo: `housmatalms-main` (Next.js 15, Tailwind v4,
TypeScript, Supabase + Cloudinary).

## What's DONE (committed context)

### Cloudinary mini-backend (permanent Supabase fallback) — COMPLETE
- `src/lib/cloudStore.ts` — client-safe helpers (`cloudStorePutClient`, `cloudStoreListClient`, `collectionForTable`). Talks to API route over HTTP; **never** imports the Cloudinary admin SDK (keeps it out of the client bundle).
- `src/lib/cloudStoreServer.ts` — server-only Cloudinary admin API store (JSON files in `housmata/_store/<collection>/<id>.json`).
- `src/app/api/store/route.ts` — `GET /api/store?collection=` and `POST /api/store`.
- `src/lib/db.ts`:
  - `saveToSupabase` is now **non-throwing** and mirrors every write to Cloudinary (permanent fallback). Local (localStorage) write always succeeds.
  - `hydrateFromCloudStore()` runs once on startup (guarded by `cloudStoreHydrated`), merges cloud-stored records into the local cache with **submission dedup by (assignment_id, user_id)** so orphaned resubmissions don't reappear.

### Theme: device-default + manual toggle — COMPLETE
- `src/components/theme/ThemeProvider.tsx` — follows `prefers-color-scheme` by default; manual toggle persisted to `localStorage["housmata-theme"]`; applies `.light`/`.dark` class on `<html>`.
- `globals.css` — dark tokens moved from `@media (prefers-color-scheme: dark)` to a `.dark { ... }` scoped block. `:root` stays light.
- `src/app/layout.tsx` — wraps app in `ThemeProvider` + `ToastProvider`.

### UI primitives — COMPLETE (`src/components/ui/`)
- `Toast.tsx` (`useToast`), `Modal.tsx` (`variant: center | drawer-right | full`, ESC + backdrop close), `AiPanel.tsx` (collapsible AI result w/ dismiss + "Demo" badge), `Primitives.tsx` (`PageHeader`, `EmptyState`, `LoadingSkeleton`, `CardSkeleton`, `Spinner`), `LessonMarkdown.tsx` (react-markdown, links open `target=_blank rel=noopener`, no raw HTML).

### LmsLayout — COMPLETE
- Theme toggle button in header.
- **Student bottom tab bar** (`bottomTabs`) fixed at bottom, visible `<md` only (Hub / Learn / Grades / Live). Content area gets `pb-24 md:pb-8` so it isn't covered.
- Removed duplicate "Exit to Website" sidebar link (kept "Main Website" in header).

### Lesson drawer mobile bug — FIXED (the reported glitch)
- `src/app/lms/student/curriculum/page.tsx` lesson drawer now uses `Modal variant="full"` → full-screen on mobile, right-panel on `>=sm`.
- Structure: `flex-col` with **scrollable content** (`flex-grow overflow-y-auto`) + **pinned footer** (Close / Mark Read). Header has an always-tappable X.
- AI Summary/Answer are now `AiPanel` blocks with their own **dismiss (X)** so users can collapse them and keep reading.
- Added a **scroll-progress bar**; lesson content rendered via `LessonMarkdown` (replaces the ~50-line regex renderer — links/numbered/nested lists now work).
- `react-markdown@9` added to `package.json`.

### Toast migration (student side) — DONE
- `curriculum/page.tsx` (4 alerts → toast) and `grades/page.tsx` (1 alert → toast) migrated to `useToast`.

### Instructor submitted-PDF viewer — IMPROVED (latest request)
- `src/app/lms/instructor/grading/page.tsx`:
  - Replaced fixed 400px inline `<iframe>` with a **clickable PDF card** (file icon + filename + Save/Maximize actions). Clicking opens a **full-screen `Modal variant="full"` PDF reader** (raw `content_link`, no Cloudinary processing — just serves the uploaded PDF).
  - "Save" download links on both the card and the full-screen reader.
  - Guards `selectedSub` with `open={pdfFullscreen && !!selectedSub}` and `?.` optional chaining so it can't crash when no submission is selected.

## REMAINING WORK (not yet done)
1. **Toast migration on remaining pages** (still use `alert()`):
   - `src/app/lms/instructor/grading/page.tsx` (AI restructure, resubmission validation)
   - `src/app/lms/instructor/dashboard/page.tsx` (agenda)
   - `src/app/lms/admin/{users,applications,surveys,students,announcements,dashboard}.tsx`
   - `src/components/ProgressTrackerPortal.tsx`
   Pattern: `import { useToast } from "@/components/ui/Toast"; const { toast } = useToast();` then `toast(msg, "error")`.
2. **Sweep student pages** (dashboard, credentials, meetings) to use `PageHeader`/`EmptyState`/`CardSkeleton` + ensure `min-h-[44px]` tap targets. Lower priority.
3. **Instructor/Admin page sweeps** — same primitives + tap targets + modals reuse `Modal` base.
4. **Manual dark-mode audit** — verify contrast of AI/simulation banners, `premium-card` hover, and the new bottom tab bar in `.dark`.

## How to verify
- `npx tsc --noEmit` (clean), `npm run lint` (only harmless unused-var warnings), `npm run build` (51/51 pages generate).
- Manual: load at 360px width; open a lesson → Summarize → dismiss summary → keep reading → Mark Read. Submit assignment/quiz (Cloudinary fallback still persists). Instructor grading → click PDF → full-screen reader → Save. Toggle theme (persists on reload). Student bottom tabs visible < md.

## Env notes
- `.env.local` has real Supabase + Cloudinary creds. `vercel.json` was edited (uncommitted earlier) to remove hardcoded Supabase keys — ensure deployed env provides them.
- Cloudinary store uses existing `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`.
