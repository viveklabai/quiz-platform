import { AdminShell } from "@/src/components/admin/AdminShell";

export default function AdminQuizzesLoading() {
  return (
    <AdminShell title="Manage Quizzes" description="Loading quizzes...">
      <div className="animate-pulse space-y-8">
        <div className="h-48 rounded-xl bg-foreground/10" />
        <div className="h-64 rounded-xl bg-foreground/10" />
      </div>
    </AdminShell>
  );
}
