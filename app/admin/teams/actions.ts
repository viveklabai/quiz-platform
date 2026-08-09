"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { Team, TeamMember, TeamAdminRow } from "@/src/types/database";

export type TeamActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

type TeamRow = Team & {
  team_members: { count: number }[];
  score_summaries: { total_score: number }[] | { total_score: number } | null;
};

function normalizeRelation<T>(value: T | T[]): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function generateJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function mapTeamRow(row: TeamRow, submissionCount: number): TeamAdminRow {
  const scoreSummary = normalizeRelation(row.score_summaries);

  return {
    id: row.id,
    name: row.name,
    join_code: row.join_code,
    active: row.active,
    created_at: row.created_at,
    memberCount: row.team_members[0]?.count ?? 0,
    submissionCount,
    totalScore: scoreSummary?.total_score ?? 0,
  };
}

export async function getTeams(): Promise<TeamAdminRow[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, join_code, active, created_at, team_members(count), score_summaries(total_score)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load teams.");
  }

  const teams = ((data as TeamRow[] | null) ?? []);
  const teamIds = teams.map((team) => team.id);

  const submissionCounts = new Map<string, number>();

  if (teamIds.length > 0) {
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("team_id")
      .in("team_id", teamIds);

    if (submissionsError) {
      throw new Error("Failed to load team submissions.");
    }

    for (const submission of submissions ?? []) {
      submissionCounts.set(
        submission.team_id,
        (submissionCounts.get(submission.team_id) ?? 0) + 1,
      );
    }
  }

  return teams.map((team) =>
    mapTeamRow(team, submissionCounts.get(team.id) ?? 0),
  );
}

export async function getTeamWithMembers(teamId: string): Promise<{
  team: Team;
  members: TeamMember[];
  submissionCount: number;
  totalScore: number;
} | null> {
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, name, join_code, active, created_at")
    .eq("id", teamId)
    .maybeSingle();

  if (teamError) {
    throw new Error("Failed to load team.");
  }

  if (!team) {
    return null;
  }

  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("id, team_id, display_name, created_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });

  if (membersError) {
    throw new Error("Failed to load team members.");
  }

  const { count: submissionCount } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  const { data: scoreSummary } = await supabase
    .from("score_summaries")
    .select("total_score")
    .eq("team_id", teamId)
    .maybeSingle();

  return {
    team,
    members: members ?? [],
    submissionCount: submissionCount ?? 0,
    totalScore: scoreSummary?.total_score ?? 0,
  };
}

export async function createTeam(name: string): Promise<TeamActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Team name is required." };
  }

  const { error } = await supabase.from("teams").insert({
    name: trimmedName,
    join_code: generateJoinCode(),
    active: true,
  });

  if (error) {
    return {
      success: false,
      error: error.message || "Could not create team.",
    };
  }

  revalidatePath("/admin/teams");

  return { success: true, message: `Team "${trimmedName}" created.` };
}

export async function updateTeam(
  teamId: string,
  name: string,
): Promise<TeamActionResult> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, error: "Team name is required." };
  }

  const { error } = await supabase
    .from("teams")
    .update({ name: trimmedName })
    .eq("id", teamId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not update team.",
    };
  }

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);

  return { success: true, message: "Team updated." };
}

export async function regenerateJoinCode(teamId: string): Promise<TeamActionResult> {
  const joinCode = generateJoinCode();

  const { error } = await supabase
    .from("teams")
    .update({ join_code: joinCode })
    .eq("id", teamId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not regenerate join code.",
    };
  }

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);

  return { success: true, message: `New join code: ${joinCode}` };
}

export async function removeTeamMember(
  teamId: string,
  memberId: string,
): Promise<TeamActionResult> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not remove team member.",
    };
  }

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);

  return { success: true, message: "Member removed." };
}

export async function disableTeam(teamId: string): Promise<TeamActionResult> {
  const { error } = await supabase
    .from("teams")
    .update({ active: false })
    .eq("id", teamId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not disable team.",
    };
  }

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);

  return { success: true, message: "Team disabled." };
}

export async function enableTeam(teamId: string): Promise<TeamActionResult> {
  const { error } = await supabase
    .from("teams")
    .update({ active: true })
    .eq("id", teamId);

  if (error) {
    return {
      success: false,
      error: error.message || "Could not enable team.",
    };
  }

  revalidatePath("/admin/teams");
  revalidatePath(`/admin/teams/${teamId}`);

  return { success: true, message: "Team enabled." };
}
