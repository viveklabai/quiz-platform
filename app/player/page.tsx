import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import { getPlayerContext } from "./actions";
import { PlayerForm } from "./player-form";

export const dynamic = "force-dynamic";

function statusTone(status: string) {
  if (status === "OPEN") {
    return "success" as const;
  }

  if (status === "CLOSED") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default async function PlayerPage() {
  const context = await getPlayerContext();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Player</h1>
          <p className="mt-2 text-foreground/60">
            Submit answers for the active question.
          </p>
        </div>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>

      {!context.teamId ? (
        <section className="mt-8 rounded-xl border border-foreground/10 p-6">
          <p className="text-foreground/60">
            Join a team before submitting answers.
          </p>
          <Button href="/join-team" className="mt-4">
            Join Team
          </Button>
        </section>
      ) : !context.teamActive ? (
        <section className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            Team is currently disabled. Contact the Quiz Master.
          </p>
        </section>
      ) : !context.question ? (
        <section className="mt-8 rounded-xl border border-foreground/10 p-6">
          <p className="text-foreground/60">No question is currently open.</p>
        </section>
      ) : (
        <>
          <section className="mt-8 rounded-xl border border-foreground/10 p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-foreground/60">Quiz</dt>
                <dd className="mt-1 font-medium">{context.question.quizName}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground/60">Round</dt>
                <dd className="mt-1 font-medium">{context.question.roundName}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground/60">Question</dt>
                <dd className="mt-1 font-medium">
                  Question {context.question.question_number}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground/60">Status</dt>
                <dd className="mt-2">
                  <StatusBadge
                    label={context.question.status}
                    tone={statusTone(context.question.status)}
                  />
                </dd>
              </div>
            </dl>
          </section>

          <PlayerForm
            questionId={context.question.id}
            initialSubmission={context.submission}
          />
        </>
      )}
    </main>
  );
}
