import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminLiveLoading() {
  return (
    <AdminShell title="Live Control" description="Loading live control...">
      <div className="animate-pulse space-y-8">
        <div className="h-28 rounded-xl bg-foreground/10" />
        <div className="h-64 rounded-xl bg-foreground/10" />
        <div className="h-72 rounded-xl bg-foreground/10" />
      </div>
    </AdminShell>
  );
}
