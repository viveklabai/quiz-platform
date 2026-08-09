"use server";

import { revalidatePath } from "next/cache";
import { syncAllScoreSummaries } from "@/src/lib/score-summaries";
import { supabase } from "@/src/lib/supabase";
import { QUIZ_SCORING_DEFAULTS, type Quiz } from "@/src/types/database";

export type ResetActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export type ResetOptions = {
  resetScores: boolean;
  resetGrades: boolean;
  resetSubmissions: boolean;
  resetLeaderboard: boolean;
};

export async function getResetQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, name, max_question_score, min_question_score, question_duration_seconds, archived, created_at",
    )
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load quizzes.");
  }

  return data ?? [];
}

async function getQuizQuestionIds(quizId: string): Promise<string[]> {
  const { data: rounds, error: roundsError } = await supabase
    .from("rounds")
    .select("id")
    .eq("quiz_id", quizId);

  if (roundsError) {
    throw new Error("Failed to load quiz rounds.");
  }

  const roundIds = rounds?.map((round) => round.id) ?? [];

  if (roundIds.length === 0) {
    return [];
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id")
    .in("round_id", roundIds);

  if (questionsError) {
    throw new Error("Failed to load quiz questions.");
  }

  return questions?.map((question) => question.id) ?? [];
}

async function getSubmissionIdsForQuestions(questionIds: string[]): Promise<string[]> {
  if (questionIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id")
    .in("question_id", questionIds);

  if (error) {
    throw new Error("Failed to load submissions.");
  }

  return data?.map((submission) => submission.id) ?? [];
}

export async function startNewQuiz(): Promise<ResetActionResult> {
  const name = `Quiz ${new Date().toLocaleString()}`;

  const { error } = await supabase.from("quizzes").insert({
    name,
    max_question_score: QUIZ_SCORING_DEFAULTS.maxQuestionScore,
    min_question_score: QUIZ_SCORING_DEFAULTS.minQuestionScore,
    question_duration_seconds: QUIZ_SCORING_DEFAULTS.questionDurationSeconds,
    archived: false,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Could not create quiz.",
    };
  }

  revalidatePath("/admin/reset");
  revalidatePath("/admin/quizzes");
  revalidatePath("/admin");

  return { success: true, message: `New quiz "${name}" created.` };
}

export async function resetQuiz(
  quizId: string,
  options: ResetOptions,
  confirmText: string,
): Promise<ResetActionResult> {
  if (confirmText.trim().toUpperCase() !== "RESET") {
    return {
      success: false,
      error: "Type RESET to confirm this action.",
    };
  }

  if (
    !options.resetScores &&
    !options.resetGrades &&
    !options.resetSubmissions &&
    !options.resetLeaderboard
  ) {
    return {
      success: false,
      error: "Select at least one reset option.",
    };
  }

  const questionIds = await getQuizQuestionIds(quizId);
  const submissionIds = await getSubmissionIdsForQuestions(questionIds);

  if (options.resetGrades || options.resetSubmissions) {
    if (submissionIds.length > 0) {
      const { error: gradesError } = await supabase
        .from("grades")
        .delete()
        .in("submission_id", submissionIds);

      if (gradesError) {
        return {
          success: false,
          error: gradesError.message || "Could not reset grades.",
        };
      }
    }
  }

  if (options.resetSubmissions && questionIds.length > 0) {
    const { error: submissionsError } = await supabase
      .from("submissions")
      .delete()
      .in("question_id", questionIds);

    if (submissionsError) {
      return {
        success: false,
        error: submissionsError.message || "Could not reset submissions.",
      };
    }
  }

  if (options.resetLeaderboard) {
    const { error: leaderboardError } = await supabase
      .from("score_summaries")
      .delete()
      .eq("quiz_id", quizId);

    if (leaderboardError) {
      return {
        success: false,
        error: leaderboardError.message || "Could not reset leaderboard.",
      };
    }
  } else if (options.resetScores) {
    const { error: scoresError } = await supabase
      .from("score_summaries")
      .update({
        total_score: 0,
        questions_graded: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("quiz_id", quizId);

    if (scoresError) {
      return {
        success: false,
        error: scoresError.message || "Could not reset scores.",
      };
    }
  }

  if (options.resetGrades && !options.resetLeaderboard && !options.resetScores) {
    await syncAllScoreSummaries();
  }

  revalidatePath("/admin/reset");
  revalidatePath("/admin/results");
  revalidatePath("/admin/submissions");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/teams");

  return { success: true, message: "Quiz reset completed." };
}
