-- Migration: Create survey_responses table
-- This table was missing from Supabase, causing the sync to fail on every
-- page load with an "Error syncing table submissions" error (the error object
-- was empty {} because Supabase returned a relation-not-found error). This
-- was also the trigger for the infinite Realtime sync loop.
-- Run this script in your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    type text not null check (type in ('pre', 'post')),
    answers jsonb not null default '{}',
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.survey_responses DISABLE ROW LEVEL SECURITY;
