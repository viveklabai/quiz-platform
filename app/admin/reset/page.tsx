import { AdminShell } from "@/src/components/admin/AdminShell";
import { getResetQuizzes } from "./actions";
import { ResetPanel } from "./reset-panel";

export const dynamic = "force-dynamic";

export default async function AdminResetPage() {
  const quizzes = await getResetQuizzes();

  return (
    <AdminShell
      title="Quiz Reset"
      description="Start a new quiz or reset data for an existing quiz."
    >
      <ResetPanel quizzes={quizzes} />
    </AdminShell>
  );
}
