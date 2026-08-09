"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { PlayerQuestion, Submission } from "@/src/types/database";

const TEAM_COOKIE = "quiz_team_id";

type SubmitAnswerResult =
  | {
      success: true;
      message: string;
      submission: Pick<
        Submission,
        "current_answer" | "submission_count" | "latest_submitted_at"
      >;
    }
  | { success: false; error: string };

type QuestionRow = {
  id: string;
  question_number: number;
  status: string;
  rounds:
    | { name: string; quizzes: { name: string } | { name: string }[] }
    | { name: string; quizzes: { name: string } | { name: string }[] }[];
};

function normalizeQuestionRow(row: QuestionRow): PlayerQuestion {
  const round = Array.isArray(row.rounds) ? row.rounds[0] : row.rounds;
  const quiz = Array.isArray(round.quizzes) ? round.quizzes[0] : round.quizzes;

  return {
    id: row.id,
    question_number: row.question_number,
    status: row.status,
    roundName: round.name,
    quizName: quiz.name,
  };
}

async function getTeamIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TEAM_COOKIE)?.value ?? null;
}

export async function getCurrentQuestion(): Promise<PlayerQuestion | null> {
  const selectQuery = `
    id,
    question_number,
    status,
    rounds!inner (
      name,
      quizzes!inner ( name )
    )
  `;

  const { data, error } = await supabase
    .from("questions")
    .select(selectQuery)
    .eq("status", "OPEN")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normalizeQuestionRow(data as QuestionRow);
}

export async function getSubmission(
  questionId: string,
  teamId: string,
): Promise<Submission | null> {
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, question_id, team_id, current_answer, submission_count, first_submitted_at, latest_submitted_at",
    )
    .eq("question_id", questionId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getPlayerContext(): Promise<{
  teamId: string | null;
  teamActive: boolean;
  question: PlayerQuestion | null;
  submission: Submission | null;
}> {
  const teamId = await getTeamIdFromCookie();

  if (!teamId) {
    return {
      teamId: null,
      teamActive: false,
      question: null,
      submission: null,
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, active")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError || !team) {
    return {
      teamId: null,
      teamActive: false,
      question: null,
      submission: null,
    };
  }

  const question = await getCurrentQuestion();
  const submission = question
    ? await getSubmission(question.id, team.id)
    : null;

  return {
    teamId: team.id,
    teamActive: team.active,
    question,
    submission,
  };
}

export async function submitAnswer(
  questionId: string,
  answer: string,
): Promise<SubmitAnswerResult> {
  const trimmedAnswer = answer.trim();

  if (!trimmedAnswer) {
    return { success: false, error: "Answer is required." };
  }

  const teamId = await getTeamIdFromCookie();

  if (!teamId) {
    return {
      success: false,
      error: "Join a team before submitting answers.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, active")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError || !team) {
    return {
      success: false,
      error: "Team not found. Join a team again.",
    };
  }

  if (!team.active) {
    return {
      success: false,
      error: "Team is currently disabled. Contact the Quiz Master.",
    };
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("id, status")
    .eq("id", questionId)
    .maybeSingle();

  if (questionError || !question) {
    return {
      success: false,
      error: "Question not found.",
    };
  }

  if (question.status !== "OPEN") {
    return {
      success: false,
      error: "This question is not open for submissions.",
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from("submissions")
    .select("id, submission_count")
    .eq("question_id", questionId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (existingError) {
    return {
      success: false,
      error: "Could not load existing submission. Please try again.",
    };
  }

  const now = new Date().toISOString();

  if (!existing) {
    const { data: created, error: insertError } = await supabase
      .from("submissions")
      .insert({
        question_id: questionId,
        team_id: teamId,
        current_answer: trimmedAnswer,
        first_submitted_at: now,
        latest_submitted_at: now,
        submission_count: 1,
      })
      .select(
        "current_answer, submission_count, latest_submitted_at",
      )
      .single();

    if (insertError || !created) {
      return {
        success: false,
        error: insertError?.message || "Could not submit answer. Please try again.",
      };
    }

    revalidatePath("/player");

    return {
      success: true,
      message: "Answer submitted successfully.",
      submission: created,
    };
  }

  const { data: updated, error: updateError } = await supabase
    .from("submissions")
    .update({
      current_answer: trimmedAnswer,
      latest_submitted_at: now,
      submission_count: existing.submission_count + 1,
    })
    .eq("id", existing.id)
    .select("current_answer, submission_count, latest_submitted_at")
    .single();

  if (updateError || !updated) {
    return {
      success: false,
      error: updateError?.message || "Could not submit answer. Please try again.",
    };
  }

  revalidatePath("/player");

  return {
    success: true,
    message: "Answer submitted successfully.",
    submission: updated,
  };
}
