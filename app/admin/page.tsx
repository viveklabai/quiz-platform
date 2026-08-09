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
            title="Control Center"
            description="Live overview, top teams, and recent activity."
            href="/admin/results"
          />
          <NavCard
            title="Manage Quizzes"
            description="Create quizzes, rounds, questions, and scoring settings."
            href="/admin/quizzes"
          />
          <NavCard
            title="Live Control"
            description="Open and close the active quiz question."
            href="/admin/live"
          />
          <NavCard
            title="Manage Teams"
            description="Create teams, join codes, members, and access."
            href="/admin/teams"
          />
          <NavCard
            title="Submissions"
            description="Review team answers, submission counts, and timestamps."
            href="/admin/submissions"
          />
          <NavCard
            title="Quiz Reset"
            description="Start a new quiz or reset scores, grades, and submissions."
            href="/admin/reset"
          />
          <NavCard
            title="Leaderboard"
            description="View team rankings and total scores."
            href="/leaderboard"
          />
        </CardGrid>
      </div>
    </AdminShell>
  );
}
