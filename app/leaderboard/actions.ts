"use server";

import { syncAllScoreSummaries } from "@/src/lib/score-summaries";
import { supabase } from "@/src/lib/supabase";
import type {
  LeaderboardData,
  LeaderboardEntry,
  LeaderboardRow,
} from "@/src/types/database";

type ScoreSummaryRow = {
  team_id: string;
  total_score: number;
  teams:
    | { name: string }
    | { name: string }[];
};

function normalizeRelation<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value;
}

function assignRanks(entries: LeaderboardEntry[]): LeaderboardRow[] {
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);
  const ranked: LeaderboardRow[] = [];
  let rank = 0;
  let previousScore: number | null = null;

  sorted.forEach((entry, index) => {
    if (index === 0 || entry.totalScore !== previousScore) {
      rank = index + 1;
    }

    previousScore = entry.totalScore;

    ranked.push({
      ...entry,
      rank,
    });
  });

  return ranked;
}

export async function getLeaderboard(): Promise<LeaderboardData> {
  await syncAllScoreSummaries();

  const { data, error } = await supabase
    .from("score_summaries")
    .select(
      `
      team_id,
      total_score,
      teams!inner ( name )
    `,
    )
    .order("total_score", { ascending: false });

  if (error) {
    throw new Error("Failed to load leaderboard.");
  }

  const entries: LeaderboardEntry[] =
    (data as ScoreSummaryRow[] | null)?.map((row) => {
      const team = normalizeRelation(row.teams);

      return {
        teamId: row.team_id,
        teamName: team.name,
        totalScore: row.total_score,
      };
    }) ?? [];

  const rankedEntries = assignRanks(entries);

  return {
    entries: rankedEntries,
    totalTeams: rankedEntries.length,
    highestScore: rankedEntries[0]?.totalScore ?? 0,
  };
}
