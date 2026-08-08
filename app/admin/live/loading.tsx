import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminLiveLoading() {
  return (
    <AdminShell title="Live Control" description="Loading live control...">
      <div className="h-64 animate-pulse rounded-xl bg-foreground/10" />
    </AdminShell>
  );
}
