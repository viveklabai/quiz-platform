import { supabase } from "@/src/lib/supabase";

type GradeAward = {
  awarded_score: number;
};

type SubmissionSummaryRow = {
  team_id: string;
  grades: GradeAward | GradeAward[] | null;
  questions:
    | { rounds: { quiz_id: string } | { quiz_id: string }[] }
    | { rounds: { quiz_id: string } | { quiz_id: string }[] }[];
};

type TeamSummary = {
  teamId: string;
  quizId: string;
  totalScore: number;
  questionsGraded: number;
};

function normalizeRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeGradeRelation(
  value: GradeAward | GradeAward[] | null | undefined,
): GradeAward | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

/**
 * Leaderboard totals are always derived from grades.awarded_score.
 */
function aggregateSubmissionSummaries(
  submissions: SubmissionSummaryRow[],
): Map<string, TeamSummary> {
  const summaries = new Map<string, TeamSummary>();

  for (const submission of submissions) {
    const grade = normalizeGradeRelation(submission.grades);

    if (!grade) {
      continue;
    }

    const question = normalizeRelation(submission.questions);
    const round = normalizeRelation(question.rounds);
    const quizId = round.quiz_id;

    const current = summaries.get(submission.team_id) ?? {
      teamId: submission.team_id,
      quizId,
      totalScore: 0,
      questionsGraded: 0,
    };

    if (!current.quizId) {
      current.quizId = quizId;
    }

    current.totalScore += grade.awarded_score;
    current.questionsGraded += 1;
    summaries.set(submission.team_id, current);
  }

  return summaries;
}

async function upsertScoreSummary(summary: TeamSummary) {
  const now = new Date().toISOString();
  const totalScore = Math.round(summary.totalScore);

  const { data: existing, error: existingError } = await supabase
    .from("score_summaries")
    .select("team_id")
    .eq("team_id", summary.teamId)
    .maybeSingle();

  if (existingError) {
    throw new Error("Failed to load score summary.");
  }

  const row = {
    quiz_id: summary.quizId,
    total_score: totalScore,
    questions_graded: summary.questionsGraded,
    updated_at: now,
  };

  if (existing) {
    const { error } = await supabase
      .from("score_summaries")
      .update(row)
      .eq("team_id", summary.teamId);

    if (error) {
      throw new Error("Failed to update score summary.");
    }

    return;
  }

  const { error } = await supabase.from("score_summaries").insert({
    team_id: summary.teamId,
    ...row,
  });

  if (error) {
    throw new Error("Failed to create score summary.");
  }
}

async function getGradedSubmissionsForTeam(teamId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      team_id,
      grades ( awarded_score ),
      questions!inner (
        rounds!inner ( quiz_id )
      )
    `,
    )
    .eq("team_id", teamId);

  if (error) {
    throw new Error("Failed to calculate team score.");
  }

  return (data as SubmissionSummaryRow[] | null) ?? [];
}

async function getAllGradedSubmissions() {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      `
      team_id,
      grades ( awarded_score ),
      questions!inner (
        rounds!inner ( quiz_id )
      )
    `,
    );

  if (error) {
    throw new Error("Failed to sync score summaries.");
  }

  return (data as SubmissionSummaryRow[] | null) ?? [];
}

export async function syncTeamScoreSummary(teamId: string) {
  const submissions = await getGradedSubmissionsForTeam(teamId);
  const summaries = aggregateSubmissionSummaries(submissions);

  const summary = summaries.get(teamId);

  if (!summary) {
    return;
  }

  await upsertScoreSummary(summary);
}

export async function syncAllScoreSummaries() {
  const submissions = await getAllGradedSubmissions();
  const summaries = aggregateSubmissionSummaries(submissions);

  for (const summary of summaries.values()) {
    await upsertScoreSummary(summary);
  }
}
