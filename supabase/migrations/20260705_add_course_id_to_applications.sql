-- Migration: Add course_id to applications table
-- Run this script in your Supabase SQL Editor to resolve the schema mismatch.

ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS course_id text;
