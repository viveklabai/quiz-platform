import { AdminShell } from "@/src/components/admin/AdminShell";
import { getTeams } from "./actions";
import { TeamList } from "./team-list";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const teams = await getTeams();

  return (
    <AdminShell
      title="Manage Teams"
      description="View teams, member counts, and enable or disable access."
    >
      <TeamList teams={teams} />
    </AdminShell>
  );
}
