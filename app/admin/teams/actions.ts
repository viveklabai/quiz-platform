"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/src/lib/supabase";
import type { Team, TeamMember, TeamWithMemberCount } from "@/src/types/database";

export type TeamActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

type TeamRow = Team & {
  team_members: { count: number }[];
};

function mapTeamRow(row: TeamRow): TeamWithMemberCount {
  return {
    id: row.id,
    name: row.name,
    join_code: row.join_code,
    active: row.active,
    created_at: row.created_at,
    memberCount: row.team_members[0]?.count ?? 0,
  };
}

export async function getTeams(): Promise<TeamWithMemberCount[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, join_code, active, created_at, team_members(count)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to load teams.");
  }

  return (data as TeamRow[] | null)?.map(mapTeamRow) ?? [];
}

export async function getTeamWithMembers(teamId: string): Promise<{
  team: Team;
  members: TeamMember[];
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

  return {
    team,
    members: members ?? [],
  };
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
