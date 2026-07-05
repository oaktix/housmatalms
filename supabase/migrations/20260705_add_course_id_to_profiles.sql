-- Migration: Add course_id to profiles table
-- The profiles table was missing the course_id column, causing Supabase to
-- reject profile upserts when a student was approved (since the profile object
-- includes course_id). This silently prevented student accounts from being created.
-- Run this script in your Supabase SQL Editor.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS course_id text;
