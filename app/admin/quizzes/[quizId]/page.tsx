import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/src/components/admin/AdminShell";
import { getQuizSetup } from "../actions";
import { QuizSetupPanel } from "./quiz-setup-panel";

export const dynamic = "force-dynamic";

type QuizSetupPageProps = PageProps<"/admin/quizzes/[quizId]">;

export default async function QuizSetupPage({ params }: QuizSetupPageProps) {
  const { quizId } = await params;
  const setup = await getQuizSetup(quizId);

  if (!setup) {
    notFound();
  }

  return (
    <AdminShell
      title={setup.quiz.name}
      description="Configure quiz scoring, rounds, and questions."
    >
      <div className="mb-6">
        <Link
          href="/admin/quizzes"
          className="text-sm text-foreground/60 underline underline-offset-4"
        >
          Back to Quizzes
        </Link>
      </div>
      <QuizSetupPanel setup={setup} />
    </AdminShell>
  );
}
