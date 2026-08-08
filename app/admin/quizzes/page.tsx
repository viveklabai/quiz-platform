import { AdminShell } from "@/src/components/admin/AdminShell";
import { CreateQuizForm } from "./create-quiz-form";
import { QuizList } from "./quiz-list";
import { getQuizzes } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <AdminShell
      title="Manage Quizzes"
      description="View all quizzes and create new ones."
    >
      <div className="flex flex-col gap-8">
        <CreateQuizForm />
        <QuizList quizzes={quizzes} />
      </div>
    </AdminShell>
  );
}
