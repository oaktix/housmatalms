-- =====================================================================
-- ADD CLOUDINARY PUBLIC_ID TO SUBMISSIONS
-- Stores the Cloudinary public_id so we can build thumbnails / delete files.
-- =====================================================================

alter table public.submissions
  add column if not exists content_public_id text;

comment on column public.submissions.content_public_id is
  'Cloudinary public_id for the uploaded submission file (PDF, etc.)';
