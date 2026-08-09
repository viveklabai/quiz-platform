import { AdminShell } from "@/src/components/admin/AdminShell";
import { getLiveControlData } from "./actions";
import { LiveControl } from "./live-control";

export const dynamic = "force-dynamic";

type AdminLivePageProps = PageProps<"/admin/live">;

export default async function AdminLivePage({ searchParams }: AdminLivePageProps) {
  const params = await searchParams;
  const questionId =
    typeof params.questionId === "string" ? params.questionId : undefined;

  const data = await getLiveControlData(questionId);

  return (
    <AdminShell
      title="Live Control"
      description="Navigate questions and control the active live question."
    >
      <LiveControl data={data} />
    </AdminShell>
  );
}
