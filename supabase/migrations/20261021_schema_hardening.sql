-- =====================================================================
-- HOUSMATA LMS — DATABASE HARDENING, B-TREE INDEXES & AUDIT LOGS
-- Orchestrated via the System Design Engineering Methodology
-- Migration: 20261021_schema_hardening.sql
-- =====================================================================

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";

-- =====================================================================
-- PART 1: HIGH-FREQUENCY B-TREE INDEXES
-- Optimizes query performance under concurrent live session loads
-- =====================================================================

-- Submissions filtering & lookup
create index if not exists idx_submissions_user_assignment 
    on public.submissions (user_id, assignment_id);

create index if not exists idx_submissions_status 
    on public.submissions (status) 
    where status = 'submitted';

create index if not exists idx_submissions_user_id 
    on public.submissions (user_id);

-- Quiz attempts lookup
create index if not exists idx_quiz_attempts_user_quiz 
    on public.quiz_attempts (user_id, quiz_id);

create index if not exists idx_quiz_attempts_user_passed 
    on public.quiz_attempts (user_id, passed) 
    where passed = true;

-- Cohort memberships & Attendance
create index if not exists idx_cohort_members_cohort_user 
    on public.cohort_members (cohort_id, user_id);

create index if not exists idx_attendance_cohort_session 
    on public.attendance (cohort_id, session_date);

create index if not exists idx_attendance_user_id 
    on public.attendance (user_id);

-- User Profiles & Roles
create index if not exists idx_profiles_role 
    on public.profiles (role);

create index if not exists idx_profiles_email_lower 
    on public.profiles (lower(email));

-- Student Progress & Certificates
create index if not exists idx_student_progress_user 
    on public.student_progress (user_id);

create index if not exists idx_certificates_verification 
    on public.certificates (verification_code);

create index if not exists idx_certificates_user 
    on public.certificates (user_id);

-- Applications Pipeline
create index if not exists idx_applications_status 
    on public.applications (status);

create index if not exists idx_applications_email 
    on public.applications (lower(email));

-- =====================================================================
-- PART 2: IMMUTABLE ADMINISTRATIVE AUDIT TRAIL TABLE
-- Tracks sensitive actions: grade overrides, role elevations, application approvals
-- =====================================================================

create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    actor_user_id text not null,
    actor_email text,
    action text not null,
    resource_table text not null,
    resource_id text,
    target_user_id text,
    previous_state jsonb,
    new_state jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.audit_logs is 
    'Append-only immutable audit trail for administrative operations and compliance tracking';

create index if not exists idx_audit_logs_actor_created 
    on public.audit_logs (actor_user_id, created_at desc);

create index if not exists idx_audit_logs_action 
    on public.audit_logs (action);

-- Protect audit logs from mutation or deletion
create or replace rule audit_logs_no_update as on update to public.audit_logs do instead nothing;
create or replace rule audit_logs_no_delete as on delete to public.audit_logs do instead nothing;

-- =====================================================================
-- PART 3: ATOMIC TRANSACTION STORED PROCEDURES (ACID GUARANTEE)
-- Prevents race conditions, double points, and quiz attempt corruption
-- =====================================================================

-- 1. Atomic Quiz Attempt Recording with Progress Update
create or replace function public.record_quiz_attempt_atomic(
    p_user_id text,
    p_quiz_id text,
    p_score integer,
    p_passed boolean,
    p_answers jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_attempt_id uuid := uuid_generate_v4();
    v_existing_passed boolean := false;
    v_new_points integer := 0;
begin
    -- Check if student previously passed this quiz
    select exists (
        select 1 from public.quiz_attempts 
        where user_id::text = p_user_id 
          and quiz_id = p_quiz_id 
          and passed = true
    ) into v_existing_passed;

    -- Insert new attempt record
    insert into public.quiz_attempts (id, user_id, quiz_id, score, passed, answers, submitted_at)
    values (
        v_attempt_id,
        p_user_id::uuid,
        p_quiz_id,
        p_score,
        p_passed,
        p_answers,
        timezone('utc'::text, now())
    );

    -- Only credit points if this is the first time passing
    if p_passed and not v_existing_passed then
        v_new_points := p_score;
        
        insert into public.student_progress (user_id, completed_lessons, total_points, last_activity)
        values (p_user_id::uuid, 1, v_new_points, timezone('utc'::text, now()))
        on conflict (user_id) do update set
            completed_lessons = public.student_progress.completed_lessons + 1,
            total_points = public.student_progress.total_points + v_new_points,
            last_activity = timezone('utc'::text, now());
    end if;

    return jsonb_build_object(
        'success', true,
        'attempt_id', v_attempt_id,
        'points_awarded', v_new_points,
        'passed', p_passed
    );
end;
$$;

-- 2. Atomic Submission Grading with Audit Logging
create or replace function public.grade_submission_atomic(
    p_submission_id text,
    p_grade integer,
    p_feedback text,
    p_grader_id text,
    p_grader_email text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
    v_sub record;
    v_old_grade integer;
    v_user_id text;
    v_points_delta integer := 0;
begin
    -- Fetch existing submission with row lock
    select * from public.submissions 
    where id::text = p_submission_id 
    for update 
    into v_sub;

    if not found then
        return jsonb_build_object('success', false, 'error', 'Submission not found');
    end if;

    v_old_grade := coalesce(v_sub.grade, 0);
    v_user_id := v_sub.user_id::text;
    v_points_delta := p_grade - v_old_grade;

    -- Update submission
    update public.submissions set
        grade = p_grade,
        feedback = p_feedback,
        status = 'graded'
    where id::text = p_submission_id;

    -- Adjust student progress total points
    insert into public.student_progress (user_id, completed_lessons, total_points, last_activity)
    values (v_sub.user_id, 1, p_grade, timezone('utc'::text, now()))
    on conflict (user_id) do update set
        total_points = greatest(0, public.student_progress.total_points + v_points_delta),
        last_activity = timezone('utc'::text, now());

    -- Record immutable audit log
    insert into public.audit_logs (
        actor_user_id,
        actor_email,
        action,
        resource_table,
        resource_id,
        target_user_id,
        previous_state,
        new_state
    ) values (
        p_grader_id,
        p_grader_email,
        'GRADE_SUBMISSION',
        'submissions',
        p_submission_id,
        v_user_id,
        jsonb_build_object('grade', v_old_grade, 'status', v_sub.status),
        jsonb_build_object('grade', p_grade, 'status', 'graded')
    );

    return jsonb_build_object(
        'success', true,
        'submission_id', p_submission_id,
        'points_delta', v_points_delta
    );
end;
$$;
