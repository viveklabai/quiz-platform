"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type {
  LiveControlData,
  LiveQuestionItem,
  LiveQuestionView,
  QuestionStatus,
} from "@/src/types/database";

export type LiveActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

type QuestionRow = {
  id: string;
  question_number: number;
  status: QuestionStatus;
  rounds:
    | { name: string; quiz_id: string }
    | { name: string; quiz_id: string }[];
};

function normalizeRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function mapQuestionView(row: QuestionRow, quizName: string): LiveQuestionView {
  const round = normalizeRelation(row.rounds);

  return {
    questionId: row.id,
    questionNumber: row.question_number,
    questionPrompt: `Question ${row.question_number}`,
    status: row.status,
    roundName: round.name,
    quizName,
  };
}

async function getActiveQuizId(): Promise<string | null> {
  const { data: openQuestion, error: openError } = await supabase
    .from("questions")
    .select("rounds!inner ( quiz_id )")
    .eq("status", "OPEN")
    .limit(1)
    .maybeSingle();

  if (!openError && openQuestion) {
    const round = normalizeRelation(
      openQuestion.rounds as { quiz_id: string } | { quiz_id: string }[],
    );
    return round.quiz_id;
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (quizError || !quiz) {
    return null;
  }

  return quiz.id;
}

export async function getLiveControlData(
  selectedQuestionId?: string,
): Promise<LiveControlData> {
  const activeQuizId = await getActiveQuizId();

  if (!activeQuizId) {
    return {
      quizId: null,
      quizName: null,
      questions: [],
      selectedQuestion: null,
    };
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, name")
    .eq("id", activeQuizId)
    .single();

  if (quizError || !quiz) {
    throw new Error("Failed to load active quiz.");
  }

  const { data: rounds, error: roundsError } = await supabase
    .from("rounds")
    .select("id")
    .eq("quiz_id", activeQuizId);

  if (roundsError) {
    throw new Error("Failed to load quiz rounds.");
  }

  const roundIds = rounds?.map((round) => round.id) ?? [];

  if (roundIds.length === 0) {
    return {
      quizId: activeQuizId,
      quizName: quiz.name,
      questions: [],
      selectedQuestion: null,
    };
  }

  const { data: questionRows, error: questionsError } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_number,
      status,
      rounds!inner (
        name,
        quiz_id
      )
    `,
    )
    .in("round_id", roundIds)
    .order("question_number", { ascending: true });

  if (questionsError) {
    throw new Error("Failed to load questions.");
  }

  const rows = (questionRows as QuestionRow[] | null) ?? [];

  const questions: LiveQuestionItem[] = rows.map((row) => ({
    id: row.id,
    questionNumber: row.question_number,
    status: row.status,
  }));

  if (questions.length === 0) {
    return {
      quizId: activeQuizId,
      quizName: quiz.name,
      questions: [],
      selectedQuestion: null,
    };
  }

  let resolvedQuestionId = selectedQuestionId;

  if (
    !resolvedQuestionId ||
    !questions.some((question) => question.id === resolvedQuestionId)
  ) {
    const openQuestion = questions.find((question) => question.status === "OPEN");
    resolvedQuestionId = openQuestion?.id ?? questions[0].id;
  }

  const selectedRow = rows.find((row) => row.id === resolvedQuestionId);

  return {
    quizId: activeQuizId,
    quizName: quiz.name,
    questions,
    selectedQuestion: selectedRow
      ? mapQuestionView(selectedRow, quiz.name)
      : null,
  };
}

export async function openQuestion(
  questionId: string,
): Promise<LiveActionResult> {
  if (!questionId) {
    return { success: false, error: "No question selected." };
  }

  const { error: closeError } = await supabase
    .from("questions")
    .update({ status: "CLOSED" })
    .eq("status", "OPEN");

  if (closeError) {
    return {
      success: false,
      error: closeError.message || "Could not close other open questions.",
    };
  }

  const { error: openError } = await supabase
    .from("questions")
    .update({ status: "OPEN" })
    .eq("id", questionId);

  if (openError) {
    return {
      success: false,
      error: openError.message || "Could not open question.",
    };
  }

  revalidatePath("/admin/live");
  revalidatePath("/player");

  return { success: true, message: "Question opened." };
}

export async function closeQuestion(
  questionId: string,
): Promise<LiveActionResult> {
  if (!questionId) {
    return { success: false, error: "No question selected." };
  }

  const { error } = await supabase
    .from("questions")
    .update({ status: "CLOSED" })
    .eq("id", questionId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not close question.",
    };
  }

  revalidatePath("/admin/live");
  revalidatePath("/player");

  return { success: true, message: "Question closed." };
}
