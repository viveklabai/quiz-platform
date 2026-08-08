import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { getTeamWithMembers } from "../actions";

export const dynamic = "force-dynamic";

type TeamDetailPageProps = PageProps<"/admin/teams/[teamId]">;

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;
  const result = await getTeamWithMembers(teamId);

  if (!result) {
    notFound();
  }

  const { team, members } = result;

  return (
    <AdminShell
      title={team.name}
      description="Team details and members."
    >
      <div className="mb-6">
        <Link
          href="/admin/teams"
          className="text-sm text-foreground/60 underline underline-offset-4"
        >
          Back to Manage Teams
        </Link>
      </div>

      <section className="rounded-xl border border-foreground/10 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-foreground/60">Team Code</p>
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
              <li key={member.id} className="px-6 py-4">
                <p className="font-medium">{member.display_name}</p>
                {member.created_at ? (
                  <p className="text-sm text-foreground/50">
                    Joined {new Date(member.created_at).toLocaleString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
