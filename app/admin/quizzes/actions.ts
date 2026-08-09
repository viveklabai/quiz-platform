"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { Quiz, QuizSetup, RoundWithQuestions } from "@/src/types/database";

export type QuizActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, name, max_question_score, min_question_score, question_duration_seconds, archived, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load quizzes.");
  }

  return data ?? [];
}

export async function getQuizSetup(quizId: string): Promise<QuizSetup | null> {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(
      "id, name, max_question_score, min_question_score, question_duration_seconds, archived, created_at",
    )
    .eq("id", quizId)
    .maybeSingle();

  if (quizError || !quiz) {
    return null;
  }

  const { data: rounds, error: roundsError } = await supabase
    .from("rounds")
    .select("id, quiz_id, name, order_index, created_at")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });

  if (roundsError) {
    throw new Error("Failed to load rounds.");
  }

  const roundIds = rounds?.map((round) => round.id) ?? [];

  let questions: Array<{
    id: string;
    round_id: string;
    question_number: number;
    status: string;
    opened_at?: string | null;
    order_index?: number;
    created_at?: string;
  }> = [];

  if (roundIds.length > 0) {
    const { data: questionRows, error: questionsError } = await supabase
      .from("questions")
      .select("id, round_id, question_number, status, opened_at, order_index, created_at")
      .in("round_id", roundIds)
      .order("question_number", { ascending: true });

    if (questionsError) {
      throw new Error("Failed to load questions.");
    }

    questions = questionRows ?? [];
  }

  const roundsWithQuestions: RoundWithQuestions[] =
    rounds?.map((round) => {
      const roundQuestions = questions.filter(
        (question) => question.round_id === round.id,
      );

      return {
        ...round,
        questionCount: roundQuestions.length,
        questions: roundQuestions.map((question) => ({
          id: question.id,
          round_id: question.round_id,
          question_number: question.question_number,
          status: question.status as RoundWithQuestions["questions"][number]["status"],
          opened_at: question.opened_at,
          order_index: question.order_index,
          created_at: question.created_at,
        })),
      };
    }) ?? [];

  return {
    quiz,
    rounds: roundsWithQuestions,
  };
}

export async function createQuiz(
  name: string,
  maxQuestionScore: number,
  minQuestionScore: number,
  questionDurationSeconds: number,
): Promise<QuizActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Quiz name is required." };
  }

  if (maxQuestionScore < minQuestionScore) {
    return {
      success: false,
      error: "Starting score must be greater than or equal to minimum score.",
    };
  }

  if (questionDurationSeconds <= 0) {
    return {
      success: false,
      error: "Question duration must be greater than zero.",
    };
  }

  const { error } = await supabase.from("quizzes").insert({
    name: trimmedName,
    max_question_score: maxQuestionScore,
    min_question_score: minQuestionScore,
    question_duration_seconds: questionDurationSeconds,
    archived: false,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Could not create quiz. Please try again.",
    };
  }

  revalidatePath("/admin/quizzes");
  revalidatePath("/admin");

  return { success: true, message: `Quiz "${trimmedName}" created.` };
}

export async function updateQuiz(
  quizId: string,
  name: string,
  maxQuestionScore: number,
  minQuestionScore: number,
  questionDurationSeconds: number,
): Promise<QuizActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Quiz name is required." };
  }

  if (maxQuestionScore < minQuestionScore) {
    return {
      success: false,
      error: "Starting score must be greater than or equal to minimum score.",
    };
  }

  const { error } = await supabase
    .from("quizzes")
    .update({
      name: trimmedName,
      max_question_score: maxQuestionScore,
      min_question_score: minQuestionScore,
      question_duration_seconds: questionDurationSeconds,
    })
    .eq("id", quizId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not update quiz.",
    };
  }

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Quiz updated." };
}

export async function archiveQuiz(quizId: string): Promise<QuizActionResult> {
  const { error } = await supabase
    .from("quizzes")
    .update({ archived: true })
    .eq("id", quizId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not archive quiz.",
    };
  }

  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Quiz archived." };
}

export async function createRound(
  quizId: string,
  name: string,
): Promise<QuizActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Round name is required." };
  }

  const { error } = await supabase.from("rounds").insert({
    quiz_id: quizId,
    name: trimmedName,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Could not create round.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Round created." };
}

export async function updateRound(
  quizId: string,
  roundId: string,
  name: string,
): Promise<QuizActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Round name is required." };
  }

  const { error } = await supabase
    .from("rounds")
    .update({ name: trimmedName })
    .eq("id", roundId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not update round.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Round updated." };
}

export async function deleteRound(
  quizId: string,
  roundId: string,
): Promise<QuizActionResult> {
  const { data: activeQuestions, error: activeError } = await supabase
    .from("questions")
    .select("id")
    .eq("round_id", roundId)
    .eq("status", "OPEN");

  if (activeError) {
    return {
      success: false,
      error: "Could not verify round questions.",
    };
  }

  if (activeQuestions && activeQuestions.length > 0) {
    return {
      success: false,
      error: "Cannot delete a round that contains active open questions.",
    };
  }

  const { error: questionDeleteError } = await supabase
    .from("questions")
    .delete()
    .eq("round_id", roundId);

  if (questionDeleteError) {
    return {
      success: false,
      error: questionDeleteError.message || "Could not delete round questions.",
    };
  }

  const { error } = await supabase.from("rounds").delete().eq("id", roundId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not delete round.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Round deleted." };
}

export async function createQuestion(
  quizId: string,
  roundId: string,
  questionNumber: number,
): Promise<QuizActionResult> {
  if (!Number.isFinite(questionNumber) || questionNumber <= 0) {
    return { success: false, error: "Question number must be positive." };
  }

  const { error } = await supabase.from("questions").insert({
    round_id: roundId,
    question_number: questionNumber,
    status: "NOT_STARTED",
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Could not create question.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Question created." };
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  questionNumber: number,
): Promise<QuizActionResult> {
  if (!Number.isFinite(questionNumber) || questionNumber <= 0) {
    return { success: false, error: "Question number must be positive." };
  }

  const { error } = await supabase
    .from("questions")
    .update({ question_number: questionNumber })
    .eq("id", questionId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not update question.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Question updated." };
}

export async function deleteQuestion(
  quizId: string,
  questionId: string,
): Promise<QuizActionResult> {
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("status")
    .eq("id", questionId)
    .maybeSingle();

  if (questionError || !question) {
    return { success: false, error: "Question not found." };
  }

  if (question.status === "OPEN") {
    return {
      success: false,
      error: "Cannot delete an open question.",
    };
  }

  const { error } = await supabase.from("questions").delete().eq("id", questionId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not delete question.",
    };
  }

  revalidatePath(`/admin/quizzes/${quizId}`);

  return { success: true, message: "Question deleted." };
}
