"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { QuizSetup } from "@/src/types/database";
import {
  archiveQuiz,
  createQuestion,
  createRound,
  deleteQuestion,
  deleteRound,
  updateQuestion,
  updateQuiz,
  updateRound,
} from "../actions";

type QuizSetupPanelProps = {
  setup: QuizSetup;
};

export function QuizSetupPanel({ setup }: QuizSetupPanelProps) {
  const router = useRouter();
  const [quizName, setQuizName] = useState(setup.quiz.name);
  const [startingScore, setStartingScore] = useState(
    String(setup.quiz.max_question_score),
  );
  const [minimumScore, setMinimumScore] = useState(
    String(setup.quiz.min_question_score),
  );
  const [durationSeconds, setDurationSeconds] = useState(
    String(setup.quiz.question_duration_seconds),
  );
  const [roundNames, setRoundNames] = useState<Record<string, string>>(
    Object.fromEntries(setup.rounds.map((round) => [round.id, round.name])),
  );
  const [newRoundName, setNewRoundName] = useState("");
  const [questionNumbers, setQuestionNumbers] = useState<Record<string, string>>(
    {},
  );
  const [newQuestionNumbers, setNewQuestionNumbers] = useState<
    Record<string, string>
  >({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function runAction(key: string, action: () => Promise<{ success: boolean; message?: string; error?: string }>) {
    setLoadingKey(key);
    setError(null);
    setSuccess(null);

    const result = await action();

    if (result.success) {
      setSuccess(result.message ?? "Saved.");
      router.refresh();
    } else {
      setError(result.error ?? "Action failed.");
    }

    setLoadingKey(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400" role="status">
          {success}
        </p>
      ) : null}

      <section className="rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Edit Quiz</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Quiz Name" value={quizName} onChange={(e) => setQuizName(e.target.value)} />
          <Input label="Starting Score" type="number" value={startingScore} onChange={(e) => setStartingScore(e.target.value)} />
          <Input label="Minimum Score" type="number" value={minimumScore} onChange={(e) => setMinimumScore(e.target.value)} />
          <Input label="Question Duration Seconds" type="number" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            loading={loadingKey === "quiz"}
            onClick={() =>
              runAction("quiz", () =>
                updateQuiz(
                  setup.quiz.id,
                  quizName,
                  Number(startingScore),
                  Number(minimumScore),
                  Number(durationSeconds),
                ),
              )
            }
          >
            Save Quiz
          </Button>
          {!setup.quiz.archived ? (
            <Button
              variant="danger"
              loading={loadingKey === "archive"}
              onClick={() => runAction("archive", () => archiveQuiz(setup.quiz.id))}
            >
              Archive Quiz
            </Button>
          ) : (
            <StatusBadge label="Archived" tone="neutral" />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Create Round</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input label="Round Name" value={newRoundName} onChange={(e) => setNewRoundName(e.target.value)} className="sm:flex-1" />
          <Button
            loading={loadingKey === "round"}
            onClick={() =>
              runAction("round", async () => {
                const result = await createRound(setup.quiz.id, newRoundName);
                if (result.success) setNewRoundName("");
                return result;
              })
            }
          >
            Create Round
          </Button>
        </div>
      </section>

      {setup.rounds.length === 0 ? (
        <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
          <p className="text-foreground/60">No rounds yet.</p>
        </section>
      ) : (
        setup.rounds.map((round) => (
          <section key={round.id} className="rounded-xl border border-foreground/10 p-6">
            <p className="mt-2 text-sm text-foreground/60">
              {round.questionCount} question{round.questionCount === 1 ? "" : "s"}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <Input
                label="Round Name"
                value={roundNames[round.id] ?? round.name}
                onChange={(e) =>
                  setRoundNames((current) => ({
                    ...current,
                    [round.id]: e.target.value,
                  }))
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  loading={loadingKey === `round-${round.id}`}
                  onClick={() =>
                    runAction(`round-${round.id}`, () =>
                      updateRound(
                        setup.quiz.id,
                        round.id,
                        roundNames[round.id] ?? round.name,
                      ),
                    )
                  }
                >
                  Save Round
                </Button>
                <Button
                  variant="danger"
                  loading={loadingKey === `delete-round-${round.id}`}
                  onClick={() =>
                    runAction(`delete-round-${round.id}`, () =>
                      deleteRound(setup.quiz.id, round.id),
                    )
                  }
                >
                  Delete Round
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                label="New Question Number"
                type="number"
                min={1}
                value={newQuestionNumbers[round.id] ?? ""}
                onChange={(e) =>
                  setNewQuestionNumbers((current) => ({
                    ...current,
                    [round.id]: e.target.value,
                  }))
                }
                className="sm:flex-1"
              />
              <Button
                loading={loadingKey === `question-create-${round.id}`}
                onClick={() =>
                  runAction(`question-create-${round.id}`, async () => {
                    const result = await createQuestion(
                      setup.quiz.id,
                      round.id,
                      Number(newQuestionNumbers[round.id]),
                    );
                    if (result.success) {
                      setNewQuestionNumbers((current) => ({
                        ...current,
                        [round.id]: "",
                      }));
                    }
                    return result;
                  })
                }
              >
                Add Question
              </Button>
            </div>

            {round.questions.length === 0 ? (
              <p className="mt-4 text-sm text-foreground/60">No questions in this round.</p>
            ) : (
              <ul className="mt-4 divide-y divide-foreground/10 rounded-lg border border-foreground/10">
                {round.questions.map((question) => (
                  <li key={question.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Input
                        label="Question Number"
                        type="number"
                        min={1}
                        value={questionNumbers[question.id] ?? String(question.question_number)}
                        onChange={(e) =>
                          setQuestionNumbers((current) => ({
                            ...current,
                            [question.id]: e.target.value,
                          }))
                        }
                      />
                      <StatusBadge label={question.status} tone={question.status === "OPEN" ? "success" : question.status === "CLOSED" ? "danger" : "warning"} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        loading={loadingKey === `question-${question.id}`}
                        onClick={() =>
                          runAction(`question-${question.id}`, () =>
                            updateQuestion(
                              setup.quiz.id,
                              question.id,
                              Number(questionNumbers[question.id] ?? question.question_number),
                            ),
                          )
                        }
                      >
                        Save
                      </Button>
                      <Button
                        variant="danger"
                        loading={loadingKey === `delete-question-${question.id}`}
                        onClick={() =>
                          runAction(`delete-question-${question.id}`, () =>
                            deleteQuestion(setup.quiz.id, question.id),
                          )
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
