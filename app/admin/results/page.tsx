import Link from "next/link";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { Button } from "@/src/components/ui/Button";
import { Card, CardGrid } from "@/src/components/ui/Card";
import { getResultsData } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const data = await getResultsData();

  return (
    <AdminShell
      title="Control Center"
      description="Live quiz overview, rankings, and recent activity."
    >
      <div className="flex flex-wrap gap-2">
        <Button href="/admin/live" variant="secondary">Live Control</Button>
        <Button href="/admin/submissions" variant="secondary">Submission Review</Button>
        <Button href="/leaderboard" variant="secondary">Leaderboard</Button>
        <Button href="/admin/teams" variant="secondary">Teams</Button>
      </div>

      <div className="mt-8">
        <CardGrid>
        <Card
          title="Current Question"
          value={data.currentQuestion ?? "None open"}
        />
        <Card
          title="Time Remaining"
          value={
            data.timeRemainingSeconds !== null
              ? `${data.timeRemainingSeconds}s`
              : "—"
          }
        />
        <Card title="Total Teams" value={data.totalTeams} />
        <Card title="Total Submissions" value={data.totalSubmissions} />
        <Card title="Total Graded" value={data.totalGraded} />
        <Card title="Ungraded" value={data.ungradedCount} />
        <Card title="Highest Score" value={data.highestScore} />
        </CardGrid>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Top 5 Teams</h2>
        {data.topTeams.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/60">No scores yet.</p>
        ) : (
          <ul className="mt-4 overflow-hidden rounded-xl border border-foreground/10 divide-y divide-foreground/10">
            {data.topTeams.map((team) => (
              <li
                key={team.teamId}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium">
                    #{team.rank} {team.teamName}
                  </p>
                </div>
                <p className="text-sm font-medium">{team.totalScore}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Submissions</h2>
            <Link
              href="/admin/submissions"
              className="text-sm text-foreground/60 underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {data.recentSubmissions.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/60">No submissions yet.</p>
          ) : (
            <ul className="mt-4 overflow-hidden rounded-xl border border-foreground/10 divide-y divide-foreground/10">
              {data.recentSubmissions.map((submission) => (
                <li key={submission.id} className="px-6 py-4">
                  <p className="font-medium">
                    {submission.teamName} · Q{submission.questionNumber}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70 line-clamp-2">
                    {submission.currentAnswer}
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {new Date(submission.latestSubmittedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Grades</h2>
            <Link
              href="/admin/submissions"
              className="text-sm text-foreground/60 underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          {data.recentGrades.length === 0 ? (
            <p className="mt-4 text-sm text-foreground/60">No grades yet.</p>
          ) : (
            <ul className="mt-4 overflow-hidden rounded-xl border border-foreground/10 divide-y divide-foreground/10">
              {data.recentGrades.map((grade, index) => (
                <li key={`${grade.teamName}-${grade.gradedAt}-${index}`} className="px-6 py-4">
                  <p className="font-medium">
                    {grade.teamName} · Q{grade.questionNumber}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Awarded {grade.awardedScore} pts
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">
                    {new Date(grade.gradedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
