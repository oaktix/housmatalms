-- =====================================================================
-- HOUSMATA ACADEMY DATABASE UPDATE MIGRATION
-- Aligns database schema with the actual LMS Application specifications
-- =====================================================================

-- 1. COHORTS UPDATES
alter table public.cohorts add column if not exists capacity integer not null default 25;
alter table public.cohorts add column if not exists instructor_id uuid references public.profiles(id) on delete set null;

-- 2. APPLICATIONS UPDATES
alter table public.applications add column if not exists phone text;
alter table public.applications add column if not exists state text;
alter table public.applications add column if not exists experience_level text;
alter table public.applications add column if not exists motivation text;

-- 3. SUBMISSIONS UPDATES
alter table public.submissions add column if not exists content_text text;
alter table public.submissions add column if not exists content_file_name text;
alter table public.submissions add column if not exists status text not null default 'pending' check (status in ('pending', 'graded', 'rejected'));
alter table public.submissions alter column content_link drop not null;

-- 4. CERTIFICATES UPDATES
alter table public.certificates add column if not exists level integer not null default 1;
alter table public.certificates add column if not exists level_name text not null default 'Foundation';

-- 5. GRADUATE STATUS CONSTRAINT UPDATES
alter table public.graduate_status drop constraint if exists graduate_status_deployment_status_check;
alter table public.graduate_status add constraint graduate_status_deployment_status_check 
    check (deployment_status in ('Active', 'Available', 'Assigned', 'Suspended', 'Alumni'));

-- 6. STUDENT PROGRESS TABLE CREATION
create table if not exists public.student_progress (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    current_phase integer not null default 1 check (current_phase in (1, 2, 3, 4)),
    completed_modules text[] not null default '{}',
    read_lessons text[] not null default '{}',
    phase2_status text not null default 'locked' check (phase2_status in ('locked', 'in-progress', 'passed', 'failed'))
);

-- RLS policies for student_progress
alter table public.student_progress enable row level security;

drop policy if exists "Users can view all progress records" on public.student_progress;
create policy "Users can view all progress records" on public.student_progress
    for select using (true);

drop policy if exists "Users can update their own progress record" on public.student_progress;
create policy "Users can update their own progress record" on public.student_progress
    for update using (auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_instructor(auth.uid()));

drop policy if exists "Users can insert their own progress record" on public.student_progress;
create policy "Users can insert their own progress record" on public.student_progress
    for insert with check (auth.uid() = user_id or public.is_admin(auth.uid()) or public.is_instructor(auth.uid()));

drop policy if exists "Admins/Instructors can manage all progress records" on public.student_progress;
create policy "Admins/Instructors can manage all progress records" on public.student_progress
    for all using (public.is_admin(auth.uid()) or public.is_instructor(auth.uid()));

-- 7. ANNOUNCEMENTS TABLE CREATION
create table if not exists public.announcements (
    id uuid primary key default uuid_generate_v4(),
    cohort_id uuid references public.cohorts(id) on delete cascade,
    title text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

drop policy if exists "Cohort members can view announcements" on public.announcements;
create policy "Cohort members can view announcements" on public.announcements
    for select using (true);

drop policy if exists "Instructors can manage announcements" on public.announcements;
create policy "Instructors can manage announcements" on public.announcements
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));
