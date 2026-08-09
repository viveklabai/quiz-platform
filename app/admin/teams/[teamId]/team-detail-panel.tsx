"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Input } from "@/src/components/ui/Input";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { Team, TeamMember } from "@/src/types/database";
import {
  disableTeam,
  enableTeam,
  regenerateJoinCode,
  removeTeamMember,
  updateTeam,
} from "../actions";

type TeamDetailPanelProps = {
  team: Team;
  members: TeamMember[];
  submissionCount: number;
  totalScore: number;
};

export function TeamDetailPanel({
  team,
  members,
  submissionCount,
  totalScore,
}: TeamDetailPanelProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(team.name);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pendingMemberId, setPendingMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function runAction(
    key: string,
    action: () => Promise<
      { success: true; message?: string } | { success: false; error: string }
    >,
  ) {
    setLoadingKey(key);
    setError(null);
    setSuccess(null);

    const result = await action();

    if (result.success) {
      setSuccess(result.message ?? "Saved.");
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingKey(null);
  }

  async function handleRemoveMember() {
    if (!pendingMemberId) {
      return;
    }

    await runAction(`remove-${pendingMemberId}`, () =>
      removeTeamMember(team.id, pendingMemberId),
    );
    setPendingMemberId(null);
  }

  const pendingMember = members.find((member) => member.id === pendingMemberId);

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

      {success ? (
        <p
          className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <section className="rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Team Details</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Team Name"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
          <div>
            <p className="text-sm text-foreground/60">Join Code</p>
            <p className="mt-1 font-medium">{team.join_code}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/60">Status</p>
            <div className="mt-2">
              <StatusBadge
                label={team.active ? "Active" : "Disabled"}
                tone={team.active ? "success" : "danger"}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-foreground/60">Submission Count</p>
            <p className="mt-1 font-medium">{submissionCount}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/60">Total Score</p>
            <p className="mt-1 font-medium">{totalScore}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            loading={loadingKey === "update"}
            disabled={loadingKey !== null}
            onClick={() =>
              runAction("update", () => updateTeam(team.id, teamName))
            }
          >
            Save Name
          </Button>
          <Button
            variant="secondary"
            loading={loadingKey === "regenerate"}
            disabled={loadingKey !== null}
            onClick={() =>
              runAction("regenerate", () => regenerateJoinCode(team.id))
            }
          >
            Regenerate Join Code
          </Button>
          {team.active ? (
            <Button
              variant="danger"
              loading={loadingKey === "disable"}
              disabled={loadingKey !== null}
              onClick={() =>
                runAction("disable", () => disableTeam(team.id))
              }
            >
              Disable Team
            </Button>
          ) : (
            <Button
              loading={loadingKey === "enable"}
              disabled={loadingKey !== null}
              onClick={() =>
                runAction("enable", () => enableTeam(team.id))
              }
            >
              Enable Team
            </Button>
          )}
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-foreground/10">
        <div className="border-b border-foreground/10 px-6 py-4">
          <h2 className="text-lg font-semibold">Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <p className="px-6 py-8 text-sm text-foreground/60">
            No members have joined this team yet.
          </p>
        ) : (
          <ul className="divide-y divide-foreground/10">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{member.display_name}</p>
                  {member.created_at ? (
                    <p className="text-sm text-foreground/50">
                      Joined {new Date(member.created_at).toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="danger"
                  loading={loadingKey === `remove-${member.id}`}
                  disabled={loadingKey !== null}
                  onClick={() => setPendingMemberId(member.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingMemberId)}
        title="Remove member?"
        description={
          pendingMember
            ? `Remove "${pendingMember.display_name}" from this team?`
            : ""
        }
        confirmLabel="Remove Member"
        loading={loadingKey?.startsWith("remove-") ?? false}
        onConfirm={handleRemoveMember}
        onCancel={() => setPendingMemberId(null)}
      />
    </>
  );
}
