"use client";

import { useEffect } from "react";
import { Button } from "@/src/components/ui/Button";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-start justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Could not load admin data</h1>
      <p className="mt-3 max-w-lg text-foreground/60">
        There was a problem fetching statistics from Supabase. Check your
        connection and try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>
    </main>
  );
}
