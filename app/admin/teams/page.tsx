import { AdminShell } from "@/src/components/admin/AdminShell";
import { getTeams } from "./actions";
import { CreateTeamForm } from "./create-team-form";
import { TeamList } from "./team-list";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const teams = await getTeams();

  return (
    <AdminShell
      title="Manage Teams"
      description="Create teams, manage join codes, members, and access."
    >
      <CreateTeamForm />
      <div className="mt-8">
        <TeamList teams={teams} />
      </div>
    </AdminShell>
  );
}
