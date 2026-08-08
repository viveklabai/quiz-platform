import { Button } from "@/src/components/ui/Button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Quiz Platform
      </h1>
      <p className="mt-4 max-w-md text-foreground/60">
        Join your team, compete in quizzes, and track results in one place.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/join-team">Join Team</Button>
        <Button href="/admin" variant="secondary">
          Admin
        </Button>
      </div>
    </main>
  );
}
