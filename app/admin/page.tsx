import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { Card, CardGrid } from "@/src/components/ui/Card";
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
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-foreground/60">
            Overview of quizzes, teams, and questions.
          </p>
        </div>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>

      <CardGrid>
        <Card title="Total Quizzes" value={stats.quizCount} />
        <Card title="Total Teams" value={stats.teamCount} />
        <Card title="Total Questions" value={stats.questionCount} />
      </CardGrid>

      <p className="mt-8 text-sm text-foreground/50">
        Need to join a team?{" "}
        <Link href="/join-team" className="underline underline-offset-4">
          Go to Join Team
        </Link>
      </p>
    </main>
  );
}
