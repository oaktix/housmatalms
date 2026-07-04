-- Migration: Add columns to student_progress for Phase 2 class selection, meeting URL, and attendance.

ALTER TABLE public.student_progress
ADD COLUMN IF NOT EXISTS selected_class text,
ADD COLUMN IF NOT EXISTS phase2_meeting_url text,
ADD COLUMN IF NOT EXISTS phase2_attendance text;
