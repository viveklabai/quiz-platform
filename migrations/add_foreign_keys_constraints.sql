-- Foreign keys, defaults, triggers, and constraints to match application behavior
-- Does not modify application code; reconciles DB requirements with current inserts/updates/deletes

BEGIN;

-- ---------------------------------------------------------------------------
-- Column defaults / nullability (app omits these on insert)
-- ---------------------------------------------------------------------------

-- App createTeam() does not send quiz_id; teams are used across quizzes in the UI
ALTER TABLE public.teams
  ALTER COLUMN quiz_id DROP NOT NULL;

-- App createRound() does not send sort_order (NOT NULL in DB today)
ALTER TABLE public.rounds
  ALTER COLUMN sort_order SET DEFAULT 1;

ALTER TABLE public.rounds
  ALTER COLUMN order_index SET DEFAULT 1;

-- App createQuestion() does not send quiz_id (NOT NULL in DB today)
CREATE OR REPLACE FUNCTION public.set_question_quiz_id_from_round()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quiz_id IS NULL THEN
    SELECT r.quiz_id
    INTO NEW.quiz_id
    FROM public.rounds AS r
    WHERE r.id = NEW.round_id;

    IF NEW.quiz_id IS NULL THEN
      RAISE EXCEPTION 'round_id % not found when setting questions.quiz_id', NEW.round_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_questions_set_quiz_id ON public.questions;
CREATE TRIGGER trg_questions_set_quiz_id
  BEFORE INSERT OR UPDATE OF round_id, quiz_id
  ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_question_quiz_id_from_round();

-- Optional: default quiz_id for teams when omitted (uses latest non-archived quiz)
CREATE OR REPLACE FUNCTION public.set_team_quiz_id_default()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quiz_id IS NULL THEN
    SELECT q.id
    INTO NEW.quiz_id
    FROM public.quizzes AS q
    WHERE q.archived IS NOT TRUE
    ORDER BY q.created_at DESC
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_teams_set_quiz_id ON public.teams;
CREATE TRIGGER trg_teams_set_quiz_id
  BEFORE INSERT
  ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_team_quiz_id_default();

-- ---------------------------------------------------------------------------
-- submissions.maximum_score_available (added previously; ensure present)
-- ---------------------------------------------------------------------------

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS maximum_score_available integer;

COMMENT ON COLUMN public.submissions.maximum_score_available IS
  'Team-specific available score locked in at last submission time.';

UPDATE public.submissions AS s
SET maximum_score_available = g.time_based_max_score
FROM public.grades AS g
WHERE g.submission_id = s.id
  AND s.maximum_score_available IS NULL
  AND g.time_based_max_score IS NOT NULL;

UPDATE public.submissions AS s
SET maximum_score_available = qz.max_question_score
FROM public.questions AS q
JOIN public.rounds AS r ON r.id = q.round_id
JOIN public.quizzes AS qz ON qz.id = r.quiz_id
WHERE s.question_id = q.id
  AND s.maximum_score_available IS NULL
  AND qz.max_question_score IS NOT NULL;

-- ---------------------------------------------------------------------------
-- grades: one grade per submission (app upserts by submission_id)
-- ---------------------------------------------------------------------------

DELETE FROM public.grades AS g_old
WHERE g_old.id IN (
  SELECT g1.id
  FROM public.grades AS g1
  JOIN public.grades AS g2
    ON g1.submission_id = g2.submission_id
   AND g1.graded_at < g2.graded_at
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_grades_submission_id
  ON public.grades (submission_id);

-- ---------------------------------------------------------------------------
-- Cascade deletes to match admin reset/delete flows
-- ---------------------------------------------------------------------------

ALTER TABLE public.grades
  DROP CONSTRAINT IF EXISTS grades_submission_id_fkey;

ALTER TABLE public.grades
  ADD CONSTRAINT grades_submission_id_fkey
  FOREIGN KEY (submission_id)
  REFERENCES public.submissions (id)
  ON DELETE CASCADE;

ALTER TABLE public.submission_versions
  DROP CONSTRAINT IF EXISTS submission_versions_submission_id_fkey;

ALTER TABLE public.submission_versions
  ADD CONSTRAINT submission_versions_submission_id_fkey
  FOREIGN KEY (submission_id)
  REFERENCES public.submissions (id)
  ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- Verify core foreign keys exist (no-op if already present)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rounds_quiz_id_fkey'
  ) THEN
    ALTER TABLE public.rounds
      ADD CONSTRAINT rounds_quiz_id_fkey
      FOREIGN KEY (quiz_id) REFERENCES public.quizzes (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'questions_round_id_fkey'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_round_id_fkey
      FOREIGN KEY (round_id) REFERENCES public.rounds (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'questions_quiz_id_fkey'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_quiz_id_fkey
      FOREIGN KEY (quiz_id) REFERENCES public.quizzes (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submissions_question_id_fkey'
  ) THEN
    ALTER TABLE public.submissions
      ADD CONSTRAINT submissions_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES public.questions (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submissions_team_id_fkey'
  ) THEN
    ALTER TABLE public.submissions
      ADD CONSTRAINT submissions_team_id_fkey
      FOREIGN KEY (team_id) REFERENCES public.teams (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_team_id_fkey'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_team_id_fkey
      FOREIGN KEY (team_id) REFERENCES public.teams (id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'score_summaries_team_id_fkey'
  ) THEN
    ALTER TABLE public.score_summaries
      ADD CONSTRAINT score_summaries_team_id_fkey
      FOREIGN KEY (team_id) REFERENCES public.teams (id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'score_summaries_quiz_id_fkey'
  ) THEN
    ALTER TABLE public.score_summaries
      ADD CONSTRAINT score_summaries_quiz_id_fkey
      FOREIGN KEY (quiz_id) REFERENCES public.quizzes (id);
  END IF;
END $$;

-- Enforce one submission per team+question (unique constraint submissions_question_id_team_id_key already exists in live DB)
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_submissions_question_team ON public.submissions (question_id, team_id);

COMMIT;
