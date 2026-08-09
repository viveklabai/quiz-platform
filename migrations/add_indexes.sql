-- Recommended indexes for quiz-platform query patterns
-- Safe to re-run (IF NOT EXISTS)

BEGIN;

-- Live control / player: find open question
CREATE INDEX IF NOT EXISTS idx_questions_status
  ON public.questions (status);

CREATE INDEX IF NOT EXISTS idx_questions_status_open
  ON public.questions (status)
  WHERE status = 'OPEN';

-- Quiz setup / live: questions per round
CREATE INDEX IF NOT EXISTS idx_questions_round_id
  ON public.questions (round_id);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id
  ON public.questions (quiz_id);

CREATE INDEX IF NOT EXISTS idx_questions_round_question_number
  ON public.questions (round_id, question_number);

-- Rounds per quiz
CREATE INDEX IF NOT EXISTS idx_rounds_quiz_id
  ON public.rounds (quiz_id);

CREATE INDEX IF NOT EXISTS idx_rounds_quiz_order
  ON public.rounds (quiz_id, order_index, sort_order);

-- Join team lookup (unique constraint teams_join_code_key already exists in live DB)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_join_code ON public.teams (join_code);

-- Team admin aggregates
CREATE INDEX IF NOT EXISTS idx_team_members_team_id
  ON public.team_members (team_id);

CREATE INDEX IF NOT EXISTS idx_submissions_team_id
  ON public.submissions (team_id);

CREATE INDEX IF NOT EXISTS idx_submissions_question_id
  ON public.submissions (question_id);

-- Submission review filters and recent activity
CREATE INDEX IF NOT EXISTS idx_submissions_latest_submitted_at
  ON public.submissions (latest_submitted_at DESC);

-- Grading lookups (app selects grade by submission_id)
CREATE INDEX IF NOT EXISTS idx_grades_submission_id
  ON public.grades (submission_id);

CREATE INDEX IF NOT EXISTS idx_grades_graded_at
  ON public.grades (graded_at DESC);

-- Leaderboard / reset by quiz
CREATE INDEX IF NOT EXISTS idx_score_summaries_quiz_id
  ON public.score_summaries (quiz_id);

CREATE INDEX IF NOT EXISTS idx_score_summaries_total_score
  ON public.score_summaries (total_score DESC);

-- Active quiz selection
CREATE INDEX IF NOT EXISTS idx_quizzes_archived_created_at
  ON public.quizzes (archived, created_at DESC);

-- Unused by app today but present in schema
CREATE INDEX IF NOT EXISTS idx_submission_versions_submission_id
  ON public.submission_versions (submission_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
  ON public.audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON public.audit_events (entity_type, entity_id);

COMMIT;
