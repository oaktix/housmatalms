-- =====================================================================
-- HOUSMATA ACADEMY DATABASE INITIALIZATION MIGRATION
-- Database: PostgreSQL (Supabase Compatible)
-- Created At: 2026-05-31
-- Enforces: Row Level Security (RLS) & Multi-Role Access Control (RBAC)
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & ROLES
create table public.profiles (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    email text unique not null,
    role text not null default 'student' check (role in ('student', 'instructor', 'admin')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. INSTRUCTOR PROFILES
create table public.instructors (
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
create table public.applications (
    id uuid primary key default uuid_generate_v4(),
    applicant_name text not null,
    email text unique not null,
    qualifications text,
    experience text,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. COHORTS & MEMBERSHIPS
create table public.cohorts (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    start_date date not null,
    end_date date not null,
    active boolean default true not null
);

create table public.cohort_members (
    cohort_id uuid references public.cohorts(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (cohort_id, user_id)
);

-- 5. CURRICULUM: COURSES, MODULES & LESSONS
create table public.courses (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text
);

create table public.modules (
    id uuid primary key default uuid_generate_v4(),
    course_id uuid references public.courses(id) on delete cascade,
    title text not null,
    module_number integer not null,
    objective text,
    unique (course_id, module_number)
);

create table public.lessons (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    content text not null,
    lesson_number integer not null,
    unique (module_id, lesson_number)
);

-- 6. ASSIGNMENTS & SUBMISSIONS
create table public.assignments (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null,
    description text not null,
    points_possible integer not null default 100
);

create table public.submissions (
    id uuid primary key default uuid_generate_v4(),
    assignment_id uuid references public.assignments(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    content_link text not null,
    grade integer check (grade >= 0 and grade <= 100),
    feedback text,
    submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (assignment_id, user_id)
);

-- 7. QUIZZES, QUESTIONS & ATTEMPTS
create table public.quizzes (
    id uuid primary key default uuid_generate_v4(),
    module_id uuid references public.modules(id) on delete cascade,
    title text not null
);

create table public.quiz_questions (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.quizzes(id) on delete cascade,
    question text not null,
    options text[] not null,
    correct_option_index integer not null
);

create table public.quiz_attempts (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.quizzes(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    score integer not null check (score >= 0 and score <= 100),
    passed boolean not null,
    attempted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. VIRTUAL MEETINGS & ATTENDANCE
create table public.meetings (
    id uuid primary key default uuid_generate_v4(),
    cohort_id uuid references public.cohorts(id) on delete cascade,
    topic text not null,
    meeting_url text not null,
    scheduled_at timestamp with time zone not null
);

create table public.attendance (
    id uuid primary key default uuid_generate_v4(),
    meeting_id uuid references public.meetings(id) on delete cascade,
    user_id uuid references public.profiles(id) on delete cascade,
    present boolean default false not null,
    marked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (meeting_id, user_id)
);

-- 9. CERTIFICATES & GRADUATION STATUS
create table public.certificates (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade unique,
    certificate_code text not null unique, -- format: HS-LEVEL-ID
    issue_date date default current_date not null,
    hash text not null unique
);

create table public.graduate_status (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade unique,
    deployment_status text not null check (deployment_status in ('pending_placement', 'deployed', 'independent_operator')),
    placement_notes text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SYSTEM NOTIFICATION LOGS
create table public.email_logs (
    id uuid primary key default uuid_generate_v4(),
    recipient_email text not null,
    subject text not null,
    body text not null,
    sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.instructors enable row level security;
alter table public.applications enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.meetings enable row level security;
alter table public.attendance enable row level security;
alter table public.certificates enable row level security;
alter table public.graduate_status enable row level security;
alter table public.email_logs enable row level security;

-- General Helper Functions
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
create policy "Users can view all profiles in system" on public.profiles
    for select using (true);
create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- APPLICATIONS Policies
create policy "Public can submit applications" on public.applications
    for insert with check (true);
create policy "Admins can view and edit applications" on public.applications
    for all using (public.is_admin(auth.uid()));

-- LESSONS / ASSIGNMENTS Policies (Read access for all authenticated, modify for Admins/Instructors)
create policy "Students can view lessons" on public.lessons for select using (true);
create policy "Admins can manage lessons" on public.lessons for all using (public.is_admin(auth.uid()));

create policy "Students can view assignments" on public.assignments for select using (true);
create policy "Admins can manage assignments" on public.assignments for all using (public.is_admin(auth.uid()));

-- SUBMISSIONS Policies
create policy "Students can insert their own submissions" on public.submissions
    for insert with check (auth.uid() = user_id);
create policy "Students can view their own submissions" on public.submissions
    for select using (auth.uid() = user_id);
create policy "Instructors can view and grade submissions" on public.submissions
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- MEETINGS & ATTENDANCE Policies
create policy "Cohort members can view meetings" on public.meetings
    for select using (true);
create policy "Instructors can manage meetings" on public.meetings
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

create policy "Students can view their own attendance log" on public.attendance
    for select using (auth.uid() = user_id);
create policy "Instructors can mark attendance" on public.attendance
    for all using (public.is_instructor(auth.uid()) or public.is_admin(auth.uid()));

-- CERTIFICATES Policies
create policy "Anyone can verify a certificate code" on public.certificates
    for select using (true);
create policy "Admins can generate certificates" on public.certificates
    for insert with check (public.is_admin(auth.uid()));

-- =====================================================================
-- SEED DATA SETUP
-- =====================================================================

-- Seed Course Profile
insert into public.courses (id, title, description) values (
    'a0b2d6a5-7a91-4e9b-86d1-cfb42e7b7f11',
    'Housmata Verified Estate Manager Certification Program',
    'Full Academic & Operational Curriculum Framework designed to produce competent estate operators.'
);

-- Seed Instructor User & Profile
insert into public.profiles (id, full_name, email, role) values (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Akinwunmi Awoyode',
    'director@propertymax.co',
    'instructor'
);

insert into public.instructors (profile_id, full_name, bio, qualifications, awards, philosophy) values (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Akinwunmi Awoyode',
    'Managing Director / CEO, Property Max Results Ltd. Real Estate Training Handbook Course Director.',
    array['B.Sc. Physics and Mathematics (University of Ibadan)', 'MSc Real Estate Management and Investment (Edinburgh Napier University, UK)', 'MBA (University of South Wales, UK)', 'Certified International Professional Manager (IPMA-UK)', 'International Member, National Association of Realtors (USA)'],
    array['Recognised by The Guardian Nigeria as one of the Visionary CEOs shaping Nigerias economic landscape (2024/2025)'],
    'Focus on integrity, structured documentation, technology-driven estate management, and wealth creation through real estate.'
);
