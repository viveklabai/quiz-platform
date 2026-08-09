-- MVP RLS policies for quiz-platform (anon key client, no Supabase Auth)
-- Run in Supabase SQL editor. Re-runnable: drops MVP policy names before recreate.

BEGIN;

-- quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_quizzes ON public.quizzes;
CREATE POLICY mvp_anon_all_quizzes
  ON public.quizzes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_rounds ON public.rounds;
CREATE POLICY mvp_anon_all_rounds
  ON public.rounds
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_questions ON public.questions;
CREATE POLICY mvp_anon_all_questions
  ON public.questions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_teams ON public.teams;
CREATE POLICY mvp_anon_all_teams
  ON public.teams
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_team_members ON public.team_members;
CREATE POLICY mvp_anon_all_team_members
  ON public.team_members
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_submissions ON public.submissions;
CREATE POLICY mvp_anon_all_submissions
  ON public.submissions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- submission_versions (currently allows INSERT but hides SELECT for anon)
ALTER TABLE public.submission_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_submission_versions ON public.submission_versions;
CREATE POLICY mvp_anon_all_submission_versions
  ON public.submission_versions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- grades
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_grades ON public.grades;
CREATE POLICY mvp_anon_all_grades
  ON public.grades
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- score_summaries
ALTER TABLE public.score_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_score_summaries ON public.score_summaries;
CREATE POLICY mvp_anon_all_score_summaries
  ON public.score_summaries
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- audit_events
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mvp_anon_all_audit_events ON public.audit_events;
CREATE POLICY mvp_anon_all_audit_events
  ON public.audit_events
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

COMMIT;
