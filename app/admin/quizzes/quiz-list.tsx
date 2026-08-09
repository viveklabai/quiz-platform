import Link from "next/link";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { Quiz } from "@/src/types/database";

type QuizListProps = {
  quizzes: Quiz[];
};

export function QuizList({ quizzes }: QuizListProps) {
  if (quizzes.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
        <p className="text-foreground/60">No quizzes yet. Create your first quiz above.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-foreground/10">
      <div className="border-b border-foreground/10 px-6 py-4">
        <h2 className="text-lg font-semibold">All Quizzes</h2>
      </div>
      <ul className="divide-y divide-foreground/10">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{quiz.name}</p>
                {quiz.archived ? <StatusBadge label="Archived" tone="neutral" /> : null}
              </div>
              <p className="mt-1 text-sm text-foreground/50">
                Start {quiz.max_question_score} · Min {quiz.min_question_score} · {quiz.question_duration_seconds}s
              </p>
            </div>
            <Link
              href={`/admin/quizzes/${quiz.id}`}
              className="text-sm font-medium underline underline-offset-4"
            >
              Manage Setup
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
