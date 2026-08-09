import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminSubmissionsLoading() {
  return (
    <AdminShell title="Submissions" description="Loading submissions...">
      <div className="animate-pulse space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-foreground/10" />
          ))}
        </div>
        <div className="h-32 rounded-xl bg-foreground/10" />
        <div className="h-64 rounded-xl bg-foreground/10" />
      </div>
    </AdminShell>
  );
}
