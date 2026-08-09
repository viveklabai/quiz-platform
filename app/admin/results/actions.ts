"use server";

import { syncAllScoreSummaries } from "@/src/lib/score-summaries";
import { supabase } from "@/src/lib/supabase";
import type { ResultsData, SubmissionReviewRow } from "@/src/types/database";
import { getLeaderboard } from "@/app/leaderboard/actions";

type OpenQuestionRow = {
  id: string;
  question_number: number;
  opened_at: string | null;
  rounds:
    | {
        name: string;
        quiz_id: string;
        quizzes:
          | {
              name: string;
              question_duration_seconds: number;
            }
          | {
              name: string;
              question_duration_seconds: number;
            }[];
      }
    | {
        name: string;
        quiz_id: string;
        quizzes:
          | {
              name: string;
              question_duration_seconds: number;
            }
          | {
              name: string;
              question_duration_seconds: number;
            }[];
      }[];
};

type RecentSubmissionRow = {
  id: string;
  current_answer: string;
  submission_count: number;
  latest_submitted_at: string;
  teams: { name: string } | { name: string }[];
  questions: { question_number: number } | { question_number: number }[];
};

type RecentGradeRow = {
  awarded_score: number;
  graded_at: string;
  submissions:
    | {
        teams: { name: string } | { name: string }[];
        questions: { question_number: number } | { question_number: number }[];
      }
    | {
        teams: { name: string } | { name: string }[];
        questions: { question_number: number } | { question_number: number }[];
      }[];
};

function normalizeRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function calculateTimeRemainingSeconds(
  openedAt: string | null,
  durationSeconds: number,
): number | null {
  if (!openedAt || durationSeconds <= 0) {
    return null;
  }

  const elapsed = (Date.now() - new Date(openedAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(durationSeconds - elapsed));
}

function mapRecentSubmission(row: RecentSubmissionRow): SubmissionReviewRow {
  const team = normalizeRelation(row.teams);
  const question = normalizeRelation(row.questions);

  return {
    id: row.id,
    teamId: "",
    teamName: team.name,
    questionNumber: question.question_number,
    currentAnswer: row.current_answer,
    submissionCount: row.submission_count,
    availableScore: null,
    latestSubmittedAt: row.latest_submitted_at,
    grade: null,
  };
}

export async function getResultsData(): Promise<ResultsData> {
  await syncAllScoreSummaries();

  const [
    openQuestionResult,
    teamsCountResult,
    submissionsCountResult,
    gradedCountResult,
    recentSubmissionsResult,
    recentGradesResult,
    leaderboard,
  ] = await Promise.all([
    supabase
      .from("questions")
      .select(
        `
        id,
        question_number,
        opened_at,
        rounds!inner (
          name,
          quiz_id,
          quizzes!inner (
            name,
            question_duration_seconds
          )
        )
      `,
      )
      .eq("status", "OPEN")
      .limit(1)
      .maybeSingle(),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }),
    supabase.from("grades").select("*", { count: "exact", head: true }),
    supabase
      .from("submissions")
      .select(
        `
        id,
        current_answer,
        submission_count,
        latest_submitted_at,
        teams ( name ),
        questions ( question_number )
      `,
      )
      .order("latest_submitted_at", { ascending: false })
      .limit(5),
    supabase
      .from("grades")
      .select(
        `
        awarded_score,
        graded_at,
        submissions (
          teams ( name ),
          questions ( question_number )
        )
      `,
      )
      .order("graded_at", { ascending: false })
      .limit(5),
    getLeaderboard(),
  ]);

  let currentQuestion: string | null = null;
  let timeRemainingSeconds: number | null = null;

  if (openQuestionResult.data) {
    const row = openQuestionResult.data as OpenQuestionRow;
    const round = normalizeRelation(row.rounds);
    const quiz = normalizeRelation(round.quizzes);
    currentQuestion = `Q${row.question_number} · ${round.name} · ${quiz.name}`;
    timeRemainingSeconds = calculateTimeRemainingSeconds(
      row.opened_at,
      quiz.question_duration_seconds,
    );
  }

  const totalSubmissions = submissionsCountResult.count ?? 0;
  const totalGraded = gradedCountResult.count ?? 0;

  const recentSubmissions =
    (recentSubmissionsResult.data as RecentSubmissionRow[] | null)?.map(
      mapRecentSubmission,
    ) ?? [];

  const recentGrades =
    (recentGradesResult.data as RecentGradeRow[] | null)?.map((row) => {
      const submission = normalizeRelation(row.submissions);
      const team = normalizeRelation(submission.teams);
      const question = normalizeRelation(submission.questions);

      return {
        teamName: team.name,
        questionNumber: question.question_number,
        awardedScore: row.awarded_score,
        gradedAt: row.graded_at,
      };
    }) ?? [];

  return {
    currentQuestion,
    timeRemainingSeconds,
    totalTeams: teamsCountResult.count ?? 0,
    totalSubmissions,
    totalGraded,
    ungradedCount: Math.max(0, totalSubmissions - totalGraded),
    highestScore: leaderboard.highestScore,
    topTeams: leaderboard.entries.slice(0, 5),
    recentSubmissions,
    recentGrades,
  };
}
