-- =====================================================================
-- HOUSMATA ACADEMY LMS — PRE & POST SURVEY RESPONSES TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('pre', 'post')),
    answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies (permissive — app uses anon key without Supabase Auth sessions)
DROP POLICY IF EXISTS "Students can insert their own survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can insert survey responses" ON public.survey_responses;
CREATE POLICY "Anyone can insert survey responses" ON public.survey_responses
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view their own survey responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Anyone can view survey responses" ON public.survey_responses;
CREATE POLICY "Anyone can view survey responses" ON public.survey_responses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.survey_responses;
CREATE POLICY "Admins can manage all survey responses" ON public.survey_responses
    FOR ALL USING (public.is_admin(auth.uid()));
