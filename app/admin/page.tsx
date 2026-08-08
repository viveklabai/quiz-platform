import { AdminShell } from "@/src/components/admin/AdminShell";
import { Card, CardGrid, NavCard } from "@/src/components/ui/Card";
import { supabase } from "@/src/lib/supabase";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [quizzesResult, teamsResult, questionsResult] = await Promise.all([
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }),
  ]);

  if (quizzesResult.error || teamsResult.error || questionsResult.error) {
    throw new Error("Failed to load admin statistics.");
  }

  return {
    quizCount: quizzesResult.count ?? 0,
    teamCount: teamsResult.count ?? 0,
    questionCount: questionsResult.count ?? 0,
  };
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <AdminShell
      title="Admin Dashboard"
      description="Overview of quizzes, teams, and questions."
    >
      <CardGrid>
        <Card title="Quiz Count" value={stats.quizCount} />
        <Card title="Team Count" value={stats.teamCount} />
        <Card title="Question Count" value={stats.questionCount} />
      </CardGrid>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Quick Links</h2>
        <CardGrid>
          <NavCard
            title="Manage Quizzes"
            description="Create quizzes and view the full quiz list."
            href="/admin/quizzes"
          />
          <NavCard
            title="Live Control"
            description="Open and close the active quiz question."
            href="/admin/live"
          />
          <NavCard
            title="Manage Teams"
            description="View teams, member counts, and enable or disable access."
            href="/admin/teams"
          />
        </CardGrid>
      </div>
    </AdminShell>
  );
}
