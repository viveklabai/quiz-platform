"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { TeamWithMemberCount } from "@/src/types/database";
import { disableTeam, enableTeam } from "./actions";

type TeamListProps = {
  teams: TeamWithMemberCount[];
};

export function TeamList({ teams }: TeamListProps) {
  const router = useRouter();
  const [pendingTeam, setPendingTeam] = useState<TeamWithMemberCount | null>(
    null,
  );
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDisableConfirm() {
    if (!pendingTeam) {
      return;
    }

    setLoadingTeamId(pendingTeam.id);
    setError(null);

    const result = await disableTeam(pendingTeam.id);

    if (result.success) {
      setPendingTeam(null);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingTeamId(null);
  }

  async function handleEnable(teamId: string) {
    setLoadingTeamId(teamId);
    setError(null);

    const result = await enableTeam(teamId);

    if (!result.success) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoadingTeamId(null);
  }

  if (teams.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
        <p className="text-foreground/60">No teams found yet.</p>
      </section>
    );
  }

  return (
    <>
      {error ? (
        <p
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-foreground/10">
        <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.4fr] gap-4 border-b border-foreground/10 px-6 py-3 text-sm font-medium text-foreground/60 lg:grid">
          <span>Team Name</span>
          <span>Team Code</span>
          <span>Status</span>
          <span>Members</span>
          <span>Actions</span>
        </div>

        <ul className="divide-y divide-foreground/10">
          {teams.map((team) => {
            const isLoading = loadingTeamId === team.id;

            return (
              <li
                key={team.id}
                className="flex flex-col gap-4 px-6 py-4 lg:grid lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.4fr] lg:items-center"
              >
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="mt-1 text-sm text-foreground/50 lg:hidden">
                    Code: {team.join_code}
                  </p>
                </div>
                <p className="hidden text-sm lg:block">{team.join_code}</p>
                <div>
                  <StatusBadge
                    label={team.active ? "Active" : "Disabled"}
                    tone={team.active ? "success" : "danger"}
                  />
                </div>
                <p className="text-sm">{team.memberCount}</p>
                <div className="flex flex-wrap gap-2">
                  <Button href={`/admin/teams/${team.id}`} variant="secondary">
                    View Team
                  </Button>
                  {team.active ? (
                    <Button
                      variant="danger"
                      onClick={() => setPendingTeam(team)}
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      Disable Team
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEnable(team.id)}
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      Enable Team
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <ConfirmDialog
        open={Boolean(pendingTeam)}
        title="Disable team?"
        description={
          pendingTeam
            ? `Disable "${pendingTeam.name}"? Members will not be able to join or submit answers until the team is enabled again.`
            : ""
        }
        confirmLabel="Disable Team"
        loading={loadingTeamId === pendingTeam?.id}
        onConfirm={handleDisableConfirm}
        onCancel={() => setPendingTeam(null)}
      />
    </>
  );
}
