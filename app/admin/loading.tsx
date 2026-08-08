import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminLoading() {
  return (
    <AdminShell title="Admin Dashboard" description="Loading dashboard...">
      <div className="animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-foreground/10 p-6"
            >
              <div className="h-4 w-24 rounded bg-foreground/10" />
              <div className="mt-4 h-8 w-16 rounded bg-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
