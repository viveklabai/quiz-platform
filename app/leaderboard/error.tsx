"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/Button";

type LeaderboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LeaderboardError({ error, reset }: LeaderboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Leaderboard</h1>
      <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          There was a problem loading the leaderboard from Supabase.
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="secondary">
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}
