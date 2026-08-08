import { Button } from "@/src/components/ui/Button";
import { JoinTeamForm } from "./join-team-form";

export default function JoinTeamPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Join Team</h1>
          <p className="mt-2 text-foreground/60">
            Enter your display name and team code to join.
          </p>
        </div>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>

      <JoinTeamForm />
    </main>
  );
}
