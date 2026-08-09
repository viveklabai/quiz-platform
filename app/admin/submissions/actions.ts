"use server";

import { revalidatePath } from "next/cache";
import { syncTeamScoreSummary } from "@/src/lib/score-summaries";
import { supabase } from "@/src/lib/supabase";
import {
  GRADING_OPTIONS,
  type GradingOption,
  type SubmissionFilterOption,
  type SubmissionGrade,
  type SubmissionReviewRow,
} from "@/src/types/database";

export type GradeActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

type GradeRow = {
  grading_multiplier: number;
  awarded_score: number;
  graded_at: string;
};

type SubmissionRow = {
  id: string;
  current_answer: string;
  submission_count: number;
  latest_submitted_at: string;
  team_id: string;
  teams:
    | { name: string }
    | { name: string }[];
  questions:
    | { question_number: number }
    | { question_number: number }[];
  grades: GradeRow | GradeRow[] | null;
};

type SubmissionFilters = {
  questionId?: string;
  teamId?: string;
};

function normalizeRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeGradeRelation(
  value: GradeRow | GradeRow[] | null | undefined,
): GradeRow | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function getGradeLabel(multiplier: number): string {
  const option = GRADING_OPTIONS.find(
    (gradingOption) => gradingOption.multiplier === multiplier,
  );

  if (option) {
    return option.label;
  }

  if (multiplier >= 1) {
    return "Correct";
  }

  if (multiplier >= 0.5) {
    return "Half Correct";
  }

  if (multiplier >= 0.3333) {
    return "One Third Correct";
  }

  if (multiplier === 0) {
    return "Incorrect";
  }

  return "Graded";
}

function mapGradeRow(grade: GradeRow): SubmissionGrade {
  return {
    gradingMultiplier: grade.grading_multiplier,
    awardedScore: grade.awarded_score,
    gradedAt: grade.graded_at,
    label: getGradeLabel(grade.grading_multiplier),
  };
}

function mapSubmissionRow(row: SubmissionRow): SubmissionReviewRow {
  const team = normalizeRelation(row.teams);
  const question = normalizeRelation(row.questions);
  const gradeRow = normalizeGradeRelation(row.grades);

  return {
    id: row.id,
    teamId: row.team_id,
    teamName: team.name,
    questionNumber: question.question_number,
    currentAnswer: row.current_answer,
    submissionCount: row.submission_count,
    latestSubmittedAt: row.latest_submitted_at,
    grade: gradeRow ? mapGradeRow(gradeRow) : null,
  };
}

export async function getSubmissionFilterOptions(): Promise<{
  teams: SubmissionFilterOption[];
  questions: SubmissionFilterOption[];
}> {
  const [teamsResult, questionsResult] = await Promise.all([
    supabase.from("teams").select("id, name").order("name", { ascending: true }),
    supabase
      .from("questions")
      .select("id, question_number")
      .order("question_number", { ascending: true }),
  ]);

  if (teamsResult.error || questionsResult.error) {
    throw new Error("Failed to load submission filters.");
  }

  return {
    teams:
      teamsResult.data?.map((team) => ({
        id: team.id,
        label: team.name,
      })) ?? [],
    questions:
      questionsResult.data?.map((question) => ({
        id: question.id,
        label: `Question ${question.question_number}`,
      })) ?? [],
  };
}

export async function getSubmissions(
  filters: SubmissionFilters = {},
): Promise<SubmissionReviewRow[]> {
  let query = supabase
    .from("submissions")
    .select(
      `
      id,
      team_id,
      current_answer,
      submission_count,
      latest_submitted_at,
      teams!inner ( name ),
      questions!inner ( question_number ),
      grades ( grading_multiplier, awarded_score, graded_at )
    `,
    )
    .order("latest_submitted_at", { ascending: false });

  if (filters.questionId) {
    query = query.eq("question_id", filters.questionId);
  }

  if (filters.teamId) {
    query = query.eq("team_id", filters.teamId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Failed to load submissions.");
  }

  return (data as SubmissionRow[] | null)?.map(mapSubmissionRow) ?? [];
}

export async function gradeSubmission(
  submissionId: string,
  gradingKey: GradingOption["key"],
): Promise<GradeActionResult> {
  if (!submissionId) {
    return { success: false, error: "No submission selected." };
  }

  const gradingOption = GRADING_OPTIONS.find((option) => option.key === gradingKey);

  if (!gradingOption) {
    return { success: false, error: "Invalid grading option." };
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, team_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return { success: false, error: "Submission not found." };
  }

  const gradingMultiplier = gradingOption.multiplier;
  const timeBasedMaxScore = 100;
  const awardedScore = Math.round(
	timeBasedMaxScore * gradingMultiplier
);
  const gradedAt = new Date().toISOString();

  const { data: existingGrade, error: existingError } = await supabase
    .from("grades")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      error: "Could not load existing grade. Please try again.",
    };
  }

  if (existingGrade) {
    const { error: updateError } = await supabase
      .from("grades")
      .update({
        grading_multiplier: gradingMultiplier,
	time_based_max_score: timeBasedMaxScore,
        awarded_score: awardedScore,
        graded_at: gradedAt,
      })
      .eq("id", existingGrade.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Could not update grade. Please try again.",
      };
    }
  } else {
    const { error: insertError } = await supabase.from("grades").insert({
      submission_id: submissionId,
      grading_multiplier: gradingMultiplier,
      time_based_max_score: timeBasedMaxScore,
      awarded_score: awardedScore,
      graded_at: gradedAt,
    });

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Could not save grade. Please try again.",
      };
    }
  }

  await syncTeamScoreSummary(submission.team_id);

  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboard");

  return {
    success: true,
    message: `Graded as ${gradingOption.label}.`,
  };
}
