import { AdminShell } from "@/src/components/admin/AdminShell";
import { getLiveQuestion } from "./actions";
import { LiveControl } from "./live-control";

export const dynamic = "force-dynamic";

export default async function AdminLivePage() {
  const liveQuestion = await getLiveQuestion();

  return (
    <AdminShell
      title="Live Control"
      description="Open and close the active quiz question."
    >
      <LiveControl liveQuestion={liveQuestion} />
    </AdminShell>
  );
}
