import { Button } from "@/src/components/ui/Button";
import { Card, CardGrid } from "@/src/components/ui/Card";
import { getLeaderboard } from "./actions";

export const dynamic = "force-dynamic";

function formatScore(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-2 text-foreground/60">
            Team rankings based on graded submission scores.
          </p>
        </div>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>

      <div className="mt-8">
        <CardGrid>
          <Card title="Total Teams" value={leaderboard.totalTeams} />
          <Card
            title="Highest Score"
            value={formatScore(leaderboard.highestScore)}
          />
        </CardGrid>
      </div>

      {leaderboard.entries.length === 0 ? (
        <section className="mt-8 rounded-xl border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground/60">
            No graded submissions yet. Scores will appear after grading.
          </p>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-xl border border-foreground/10">
          <div className="hidden grid-cols-[0.6fr_1.4fr_0.8fr] gap-4 border-b border-foreground/10 px-6 py-3 text-sm font-medium text-foreground/60 sm:grid">
            <span>Rank</span>
            <span>Team Name</span>
            <span>Total Score</span>
          </div>

          <ul className="divide-y divide-foreground/10">
            {leaderboard.entries.map((entry) => (
              <li
                key={entry.teamId}
                className="flex flex-col gap-2 px-6 py-4 sm:grid sm:grid-cols-[0.6fr_1.4fr_0.8fr] sm:items-center"
              >
                <p className="text-lg font-semibold">{entry.rank}</p>
                <p className="font-medium">{entry.teamName}</p>
                <p className="text-sm font-medium sm:text-base">
                  {formatScore(entry.totalScore)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
