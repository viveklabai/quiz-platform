import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminTeamsLoading() {
  return (
    <AdminShell title="Manage Teams" description="Loading teams...">
      <div className="h-64 animate-pulse rounded-xl bg-foreground/10" />
    </AdminShell>
  );
}
