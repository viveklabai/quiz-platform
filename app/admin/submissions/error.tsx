"use client";

import { useEffect } from "react";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { Button } from "@/src/components/ui/Button";

type AdminSubmissionsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminSubmissionsError({
  error,
  reset,
}: AdminSubmissionsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminShell title="Submissions" description="Could not load submissions.">
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          There was a problem loading submissions from Supabase.
        </p>
        <div className="mt-4">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </AdminShell>
  );
}
