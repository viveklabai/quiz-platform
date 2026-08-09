-- Reconcile application schema with existing Supabase database
-- Generated from application code review vs live schema introspection
--
-- Missing columns (application expects, database does not have):
--   submissions.maximum_score_available
--
-- All other application-required columns already exist:
--   quizzes: name, max_question_score, min_question_score, question_duration_seconds, archived, created_at
--   rounds: quiz_id, name, order_index, created_at
--   questions: round_id, question_number, status, opened_at, order_index, created_at
--   teams: name, join_code, active, created_at
--   team_members: team_id, display_name, created_at
--   submissions: question_id, team_id, current_answer, submission_count,
--                 first_submitted_at, latest_submitted_at
--   grades: submission_id, grading_multiplier, time_based_max_score, awarded_score, graded_at
--   score_summaries: team_id, quiz_id, total_score, questions_graded, updated_at

BEGIN;

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS maximum_score_available integer;

COMMENT ON COLUMN public.submissions.maximum_score_available IS
  'Team-specific available score locked in at the last submission time. Used for grading and display.';

-- Backfill from grade snapshots where grading already occurred
UPDATE public.submissions AS s
SET maximum_score_available = g.time_based_max_score
FROM public.grades AS g
WHERE g.submission_id = s.id
  AND s.maximum_score_available IS NULL
  AND g.time_based_max_score IS NOT NULL;

-- Backfill remaining rows from quiz starting score (best available approximation)
UPDATE public.submissions AS s
SET maximum_score_available = qz.max_question_score
FROM public.questions AS q
JOIN public.rounds AS r ON r.id = q.round_id
JOIN public.quizzes AS qz ON qz.id = r.quiz_id
WHERE s.question_id = q.id
  AND s.maximum_score_available IS NULL
  AND qz.max_question_score IS NOT NULL;

COMMIT;
