-- Disable foreign key constraints on tables referencing mock tables with string IDs
alter table public.cohort_members drop constraint if exists cohort_members_cohort_id_fkey;
alter table public.submissions drop constraint if exists submissions_assignment_id_fkey;
alter table public.quiz_attempts drop constraint if exists quiz_attempts_quiz_id_fkey;
alter table public.meetings drop constraint if exists meetings_cohort_id_fkey;
alter table public.announcements drop constraint if exists announcements_cohort_id_fkey;

-- Alter column types from uuid to text to accommodate mock string IDs
alter table public.cohorts alter column id type text;
alter table public.cohort_members alter column cohort_id type text;
alter table public.submissions alter column assignment_id type text;
alter table public.quiz_attempts alter column quiz_id type text;
alter table public.meetings alter column cohort_id type text;
alter table public.announcements alter column cohort_id type text;
