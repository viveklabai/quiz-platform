"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { LiveQuestionView, QuestionStatus } from "@/src/types/database";

export type LiveActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

type QuestionRow = {
  id: string;
  prompt: string;
  status: QuestionStatus;
  rounds: {
    name: string;
    quizzes: {
      name: string;
    };
  };
};

function mapQuestionRow(row: QuestionRow): LiveQuestionView {
  return {
    questionId: row.id,
    questionPrompt: row.prompt,
    status: row.status,
    roundName: row.rounds.name,
    quizName: row.rounds.quizzes.name,
  };
}

export async function getLiveQuestion(): Promise<LiveQuestionView | null> {
  const selectQuery = `
    id,
    prompt,
    status,
    rounds!inner (
      name,
      quizzes!inner ( name )
    )
  `;

  const { data: openQuestion, error: openError } = await supabase
    .from("questions")
    .select(selectQuery)
    .eq("status", "open")
    .limit(1)
    .maybeSingle();

  if (openError) {
    throw new Error("Failed to load live question.");
  }

  if (openQuestion) {
    return mapQuestionRow(openQuestion as QuestionRow);
  }

  const { data: nextQuestion, error: nextError } = await supabase
    .from("questions")
    .select(selectQuery)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextError) {
    throw new Error("Failed to load live question.");
  }

  if (!nextQuestion) {
    return null;
  }

  return mapQuestionRow(nextQuestion as QuestionRow);
}

export async function openQuestion(
  questionId: string,
): Promise<LiveActionResult> {
  if (!questionId) {
    return { success: false, error: "No question selected." };
  }

  const { error: closeError } = await supabase
    .from("questions")
    .update({ status: "closed" })
    .eq("status", "open");

  if (closeError) {
    return {
      success: false,
      error: closeError.message || "Could not close other open questions.",
    };
  }

  const { error: openError } = await supabase
    .from("questions")
    .update({ status: "open" })
    .eq("id", questionId);

  if (openError) {
    return {
      success: false,
      error: openError.message || "Could not open question.",
    };
  }

  revalidatePath("/admin/live");

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
    .update({ status: "closed" })
    .eq("id", questionId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not close question.",
    };
  }

  revalidatePath("/admin/live");

  return { success: true, message: "Question closed." };
}
