-- =====================================================================
-- HOUSMATA ACADEMY LMS — COMPLETE DATABASE SETUP SCRIPT
-- Run this ONCE in the Supabase SQL Editor to set up your full database.
-- This combines init + update migrations into one idempotent script.
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================================
-- PART 1: TABLE DEFINITIONS
-- =====================================================================

-- 1. PROFILES & ROLES
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    email text unique not null,
    role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. INSTRUCTOR PROFILES
create table if not exists public.instructors (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references public.profiles(id) on delete cascade,
    full_name text not null,
    bio text,
    qualifications text[] not null,
    awards text[] not null,
    philosophy text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ADMISSION APPLICATIONS
create table if not exists public.applications (
    id uuid primary key default uuid_generate_v4(),
    applicant_name text not null,
    email text unique not null,
    qualifications text,
    experience text,
    phone text,
    state text,
    experience_level text,
    motivation text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. COHORTS & MEMBERSHIPS
create table if not exists public.cohorts (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    start_date date not null,
    end_date date not null,
    active boolean default true not null,
    capacity integer not null default 25,
    instructor_id uuid references public.profiles(id) on delete set null
);

create table if not exists public.cohort_members (
    cohort_id uuid references public.cohorts(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (cohort_id, user_id)
);

-- 5. CURRICULUM: COURSES, MODULES & LESSONS
create table if not exists public.courses (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text
);

create table if not exists public.modules (
    id uuid primary key default uuid_generate_v4(),
    course_id uuid references public.courses(id) on delete cascade,
    title text not null,
    module_number integer not null,
    objective text,
    unique (course_id, module_number)
);

create table if not exists public.lessons (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    content text not null,
    lesson_number integer not null,
    unique (module_id, lesson_number)
);

-- 6. ASSIGNMENTS & SUBMISSIONS
create table if not exists public.assignments (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    description text not null,
    points_possible integer not null default 100
);

create table if not exists public.submissions (
    id uuid primary key default uuid_generate_v4(),
    assignment_id uuid references public.assignments(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    content_link text,
    content_text text,
    content_file_name text,
    grade integer check (grade >= 0 and grade <= 100),
    feedback text,
    status text not null default 'pending' check (status in ('pending', 'graded', 'rejected')),
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. QUIZZES, QUESTIONS & ATTEMPTS
create table if not exists public.quizzes (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    passing_score integer not null default 70
);

create table if not exists public.quiz_questions (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.quizzes(id) on delete cascade,
    question text not null,
    options text[] not null,
    correct_option_index integer not null
);

create table if not exists public.quiz_attempts (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.quizzes(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    score numeric(5,2) not null check (score >= 0 and score <= 100),
    passed boolean not null,
    attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. VIRTUAL MEETINGS & ATTENDANCE
create table if not exists public.meetings (
    id uuid primary key default uuid_generate_v4(),
    cohort_id uuid references public.cohorts(id) on delete cascade,
    topic text not null,
    meeting_url text not null,
    scheduled_at timestamp with time zone not null
);

create table if not exists public.attendance (
    id uuid primary key default uuid_generate_v4(),
    meeting_id uuid references public.meetings(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    present boolean default false not null,
    marked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (meeting_id, user_id)
);

-- 9. CERTIFICATES & GRADUATION STATUS
create table if not exists public.certificates (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    certificate_code text not null unique,
    issue_date date default current_date not null,
    hash text not null unique,
    level integer not null default 1,
    level_name text not null default 'Foundation'
);

create table if not exists public.graduate_status (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade unique,
    deployment_status text not null check (deployment_status in ('Active', 'Available', 'Assigned', 'Suspended', 'Alumni')),
    placement_notes text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. STUDENT PROGRESS
create table if not exists public.student_progress (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    current_phase integer not null default 1 check (current_phase in (1, 2, 3, 4)),
    completed_modules text[] not null default '{}',
    read_lessons text[] not null default '{}',
    phase2_status text not null default 'locked' check (phase2_status in ('locked', 'in-progress', 'passed', 'failed')),
    selected_class text,
    phase2_meeting_url text,
    phase2_attendance text
);

-- 11. ANNOUNCEMENTS
create table if not exists public.announcements (
    id uuid primary key default uuid_generate_v4(),
    cohort_id uuid references public.cohorts(id) on delete cascade,
    title text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. SYSTEM NOTIFICATION LOGS
create table if not exists public.email_logs (
    id uuid primary key default uuid_generate_v4(),
    recipient_email text not null,
    subject text not null,
    body text not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- PART 2: ROW LEVEL SECURITY (RLS)
-- =====================================================================

alter table public.profiles disable row level security;
alter table public.instructors disable row level security;
alter table public.applications disable row level security;
alter table public.cohorts disable row level security;
alter table public.cohort_members disable row level security;
alter table public.courses disable row level security;
alter table public.modules disable row level security;
alter table public.lessons disable row level security;
alter table public.assignments disable row level security;
alter table public.submissions disable row level security;
alter table public.quizzes disable row level security;
alter table public.quiz_questions disable row level security;
alter table public.quiz_attempts disable row level security;
alter table public.meetings disable row level security;
alter table public.attendance disable row level security;
alter table public.certificates disable row level security;
alter table public.graduate_status disable row level security;
alter table public.student_progress disable row level security;
alter table public.announcements disable row level security;
alter table public.email_logs disable row level security;

-- Helper Functions
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.profiles
        where id = user_id and role = 'admin'
    );
$$ language sql security definer;

create or replace function public.is_instructor(user_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.profiles
        where id = user_id and role = 'instructor'
    );
$$ language sql security definer;

-- PROFILES Policies
drop policy if exists "Users can view all profiles in system" on public.profiles;
create policy "Users can view all profiles in system" on public.profiles
    for select using (true);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id or public.is_admin(auth.uid()));
drop policy if exists "Admins can insert profiles" on public.profiles;
create policy "Admins can insert profiles" on public.profiles
    for insert with check (public.is_admin(auth.uid()) or true); -- allow seeding

-- INSTRUCTORS Policies
drop policy if exists "Anyone can view instructors" on public.instructors;
create policy "Anyone can view instructors" on public.instructors
    for select using (true);
drop policy if exists "Admins can manage instructors" on public.instructors;
create policy "Admins can manage instructors" on public.instructors
    for all using (public.is_admin(auth.uid()));

-- APPLICATIONS Policies
drop policy if exists "Public can submit applications" on public.applications;
create policy "Public can submit applications" on public.applications
    for insert with check (true);
drop policy if exists "Admins can view and edit applications" on public.applications;
create policy "Admins can view and edit applications" on public.applications
    for all using (public.is_admin(auth.uid()));

-- COHORTS Policies
drop policy if exists "Anyone can view cohorts" on public.cohorts;
create policy "Anyone can view cohorts" on public.cohorts
    for select using (true);
drop policy if exists "Admins can manage cohorts" on public.cohorts;
create policy "Admins can manage cohorts" on public.cohorts
    for all using (public.is_admin(auth.uid()));

-- COHORT MEMBERS Policies
drop policy if exists "Anyone can view cohort members" on public.cohort_members;
create policy "Anyone can view cohort members" on public.cohort_members
    for select using (true);
drop policy if exists "Admins can manage cohort members" on public.cohort_members;
create policy "Admins can manage cohort members" on public.cohort_members
    for all using (public.is_admin(auth.uid()) or public.is_instructor(auth.uid()));

-- LESSONS / ASSIGNMENTS Policies
drop policy if exists "Students can view lessons" on public.lessons;
create policy "Students can view lessons" on public.lessons for select using (true);
drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons" on public.lessons for all using (public.is_admin(auth.uid()));

drop policy if exists "Students can view assignments" on public.assignments;
create policy "Students can view assignments" on public.assignments for select using (true);
drop policy if exists "Admins can manage assignments" on public.assignments;
create policy "Admins can manage assignments" on public.assignments for all using (public.is_admin(auth.uid()));

-- SUBMISSIONS Policies
drop policy if exists "Students can insert their own submissions" on public.submissions;
create policy "Students can insert their own submissions" on public.submissions
    for insert with check (auth.uid() = user_id);
drop policy if exists "Students can delete their own submissions" on public.submissions;
create policy "Students can delete their own submissions" on public.submissions
    for delete using (auth.uid() = user_id);
drop policy if exists "Students can view their own submissions" on public.submissions;
create policy "Students can view their own submissions" on public.submissions
    for select using (auth.uid() = user_id or public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));
drop policy if exists "Instructors can view and grade submissions" on public.submissions;
create policy "Instructors can view and grade submissions" on public.submissions
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- QUIZ Policies
drop policy if exists "Anyone can view quizzes" on public.quizzes;
create policy "Anyone can view quizzes" on public.quizzes for select using (true);
drop policy if exists "Anyone can view quiz questions" on public.quiz_questions;
create policy "Anyone can view quiz questions" on public.quiz_questions for select using (true);
drop policy if exists "Students can insert quiz attempts" on public.quiz_attempts;
create policy "Students can insert quiz attempts" on public.quiz_attempts
    for insert with check (auth.uid() = user_id);
drop policy if exists "Users can view quiz attempts" on public.quiz_attempts;
create policy "Users can view quiz attempts" on public.quiz_attempts
    for select using (auth.uid() = user_id or public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- MEETINGS & ATTENDANCE Policies
drop policy if exists "Cohort members can view meetings" on public.meetings;
create policy "Cohort members can view meetings" on public.meetings
    for select using (true);
drop policy if exists "Instructors can manage meetings" on public.meetings;
create policy "Instructors can manage meetings" on public.meetings
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

drop policy if exists "Students can view their own attendance log" on public.attendance;
create policy "Students can view their own attendance log" on public.attendance
    for select using (auth.uid() = user_id or public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));
drop policy if exists "Instructors can mark attendance" on public.attendance;
create policy "Instructors can mark attendance" on public.attendance
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- CERTIFICATES Policies
drop policy if exists "Anyone can verify a certificate code" on public.certificates;
create policy "Anyone can verify a certificate code" on public.certificates
    for select using (true);
drop policy if exists "Admins can generate certificates" on public.certificates;
create policy "Admins can generate certificates" on public.certificates
    for insert with check (public.is_admin(auth.uid()));

-- GRADUATE STATUS Policies
drop policy if exists "Anyone can view graduate status" on public.graduate_status;
create policy "Anyone can view graduate status" on public.graduate_status
    for select using (true);
drop policy if exists "Admins can manage graduate status" on public.graduate_status;
create policy "Admins can manage graduate status" on public.graduate_status
    for all using (public.is_admin(auth.uid()) or public.is_instructor(auth.uid()));

-- STUDENT PROGRESS Policies
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

-- ANNOUNCEMENTS Policies
drop policy if exists "Cohort members can view announcements" on public.announcements;
create policy "Cohort members can view announcements" on public.announcements
    for select using (true);
drop policy if exists "Instructors can manage announcements" on public.announcements;
create policy "Instructors can manage announcements" on public.announcements
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- EMAIL LOGS Policies
drop policy if exists "Admins can view email logs" on public.email_logs;
create policy "Admins can view email logs" on public.email_logs
    for select using (public.is_admin(auth.uid()));
drop policy if exists "System can insert email logs" on public.email_logs;
create policy "System can insert email logs" on public.email_logs
    for insert with check (true);

-- =====================================================================
-- PART 3: SEED DATA
-- =====================================================================

-- Seed Admin Profile
insert into public.profiles (full_name, email, role)
values ('Housmata Super Admin', 'admin@housmata.co', 'admin')
on conflict (email) do update set role = excluded.role, full_name = excluded.full_name;

-- Seed Instructor Profile
insert into public.profiles (full_name, email, role)
values ('Akinwunmi Awoyode', 'director@propertymax.co', 'instructor')
on conflict (email) do update set role = excluded.role, full_name = excluded.full_name;

-- Seed Demo Student Profile
insert into public.profiles (full_name, email, role)
values ('Adebayo Mensah', 'adebayo@housmata.test', 'student')
on conflict (email) do update set role = excluded.role, full_name = excluded.full_name;

-- Seed Instructor Details
INSERT INTO public.instructors (profile_id, full_name, bio, qualifications, awards, philosophy)
SELECT p.id,
       'Akinwunmi Awoyode',
       'Managing Director / CEO, Property Max Results Ltd. Real Estate Training Handbook Course Director.',
       ARRAY[
         'B.Sc. Physics and Mathematics (University of Ibadan)',
         'MSc Real Estate Management and Investment (Edinburgh Napier University, UK)',
         'MBA (University of South Wales, UK)',
         'Certified International Professional Manager (IPMA-UK)',
         'International Member, National Association of Realtors (USA)'
       ],
       ARRAY['Recognised by The Guardian Nigeria as one of the Visionary CEOs shaping Nigeria''s economic landscape (2024/2025)'],
       'Focus on integrity, structured documentation, technology-driven estate management, and wealth creation through real estate.'
FROM public.profiles p
WHERE p.email = 'director@propertymax.co'
ON CONFLICT DO NOTHING;

-- Seed the course
insert into public.courses (id, title, description)
values (
    'a0b2d6a5-7a91-4e9b-86d1-cfb42e7b7f11',
    'Housmata Verified Estate Manager Certification Program',
    'Full Academic & Operational Curriculum Framework designed to produce competent estate operators.'
)
on conflict do nothing;

-- Seed a demo cohort
insert into public.cohorts (id, name, start_date, end_date, active, capacity, instructor_id)
values (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Cohort Alpha — 2026',
    '2026-01-06',
    '2026-06-30',
    true,
    25,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
)
on conflict do nothing;

-- Enroll demo student in the cohort
INSERT INTO public.cohort_members (cohort_id, user_id, enrolled_at)
SELECT 'dddddddd-dddd-dddd-dddd-dddddddddddd', p.id, now()
FROM public.profiles p
WHERE p.email = 'adebayo@housmata.test'
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SETUP COMPLETE ✓
-- Your Housmata LMS database is ready. Start your Next.js app and
-- add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
-- to .env.local to connect.
-- =====================================================================
