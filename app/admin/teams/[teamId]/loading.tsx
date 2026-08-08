import { AdminShell } from "@/src/components/admin/AdminShell";

export default function TeamDetailLoading() {
  return (
    <AdminShell title="Team Details" description="Loading team...">
      <div className="h-64 animate-pulse rounded-xl bg-foreground/10" />
    </AdminShell>
  );
}
