"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { Quiz } from "@/src/types/database";

export type QuizActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load quizzes.");
  }

  return data ?? [];
}

export async function createQuiz(name: string): Promise<QuizActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Quiz name is required." };
  }

  const { error } = await supabase.from("quizzes").insert({ name: trimmedName });

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
