"use server";

import { supabase } from "@/src/lib/supabase";

export type JoinTeamResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function joinTeam(
  displayName: string,
  teamCode: string,
): Promise<JoinTeamResult> {
  const trimmedName = displayName.trim();
  const trimmedCode = teamCode.trim();

  if (!trimmedName || !trimmedCode) {
    return {
      success: false,
      error: "Display name and team code are required.",
    };
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id")
    .eq("join_code", trimmedCode)
    .maybeSingle();

  if (teamError) {
    return {
      success: false,
      error: "Something went wrong while looking up the team. Please try again.",
    };
  }

  if (!team) {
    return {
      success: false,
      error: "Team not found. Check your team code and try again.",
    };
  }

  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    display_name: trimmedName,
  });

  if (memberError) {
    return {
      success: false,
      error: memberError.message || "Could not join the team. Please try again.",
    };
  }

  return {
    success: true,
    message: `Welcome, ${trimmedName}! You have joined the team.`,
  };
}
