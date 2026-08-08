"use client";

import { useEffect } from "react";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { Button } from "@/src/components/ui/Button";

type AdminLiveErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminLiveError({ error, reset }: AdminLiveErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminShell title="Live Control" description="Could not load live control.">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          There was a problem loading live question data from Supabase.
        </p>
        <div className="mt-4">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </AdminShell>
  );
}
