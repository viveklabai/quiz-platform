import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { getTeamWithMembers } from "../actions";
import { TeamDetailPanel } from "./team-detail-panel";

export const dynamic = "force-dynamic";

type TeamDetailPageProps = PageProps<"/admin/teams/[teamId]">;

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;
  const result = await getTeamWithMembers(teamId);

  if (!result) {
    notFound();
  }

  const { team, members, submissionCount, totalScore } = result;

  return (
    <AdminShell
      title={team.name}
      description="Edit team details, join code, and members."
    >
      <div className="mb-6">
        <Link
          href="/admin/teams"
          className="text-sm text-foreground/60 underline underline-offset-4"
        >
          Back to Manage Teams
        </Link>
      </div>

      <TeamDetailPanel
        team={team}
        members={members}
        submissionCount={submissionCount}
        totalScore={totalScore}
      />
    </AdminShell>
  );
}
