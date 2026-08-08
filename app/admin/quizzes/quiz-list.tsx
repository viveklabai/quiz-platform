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
            className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{quiz.name}</p>
              {quiz.created_at ? (
                <p className="text-sm text-foreground/50">
                  Created {new Date(quiz.created_at).toLocaleString()}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
