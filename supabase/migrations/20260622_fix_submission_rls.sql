-- Fix: Add DELETE policy for students on their own submissions.
-- Without this, resubmission in db.createSubmission() silently fails to remove
-- the previous Supabase row (the non-atomic delete-then-insert pattern), leading
-- to duplicate submission rows per (assignment_id, user_id) pair.

drop policy if exists "Students can delete their own submissions" on public.submissions;
create policy "Students can delete their own submissions" on public.submissions
    for delete using (auth.uid() = user_id);
