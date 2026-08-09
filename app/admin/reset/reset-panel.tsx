"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Input } from "@/src/components/ui/Input";
import type { Quiz } from "@/src/types/database";
import { resetQuiz, startNewQuiz, type ResetOptions } from "./actions";

type ResetPanelProps = {
  quizzes: Quiz[];
};

export function ResetPanel({ quizzes }: ResetPanelProps) {
  const router = useRouter();
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id ?? "");
  const [options, setOptions] = useState<ResetOptions>({
    resetScores: false,
    resetGrades: false,
    resetSubmissions: false,
    resetLeaderboard: false,
  });
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function toggleOption(key: keyof ResetOptions) {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  }

  async function handleStartNewQuiz() {
    setLoadingKey("new");
    setError(null);
    setSuccess(null);

    const result = await startNewQuiz();

    if (result.success) {
      setSuccess(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingKey(null);
  }

  async function handleResetConfirm() {
    if (!selectedQuizId) {
      setError("Select a quiz to reset.");
      setShowConfirm(false);
      return;
    }

    setLoadingKey("reset");
    setError(null);
    setSuccess(null);

    const result = await resetQuiz(selectedQuizId, options, confirmText);

    if (result.success) {
      setSuccess(result.message);
      setConfirmText("");
      setShowConfirm(false);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingKey(null);
  }

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId);

  return (
    <>
      {error ? (
        <p
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <section className="rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Start New Quiz</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Create a fresh quiz with default scoring settings.
        </p>
        <Button
          className="mt-4"
          loading={loadingKey === "new"}
          disabled={loadingKey !== null}
          onClick={handleStartNewQuiz}
        >
          Start New Quiz
        </Button>
      </section>

      <section className="mt-8 rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Reset Existing Quiz</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Select a quiz and choose what data to clear. This cannot be undone.
        </p>

        {quizzes.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/60">
            No active quizzes available. Create a quiz first.
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-foreground/80">Quiz</span>
              <select
                value={selectedQuizId}
                onChange={(event) => setSelectedQuizId(event.target.value)}
                className="rounded-lg border border-foreground/20 bg-background px-3 py-2"
              >
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["resetScores", "Reset Scores"],
                  ["resetGrades", "Reset Grades"],
                  ["resetSubmissions", "Reset Submissions"],
                  ["resetLeaderboard", "Reset Leaderboard"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-foreground/10 px-4 py-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={() => toggleOption(key)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <Button
              variant="danger"
              disabled={loadingKey !== null || !selectedQuizId}
              onClick={() => setShowConfirm(true)}
            >
              Reset Quiz
            </Button>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm quiz reset"
        description={
          selectedQuiz
            ? `Reset "${selectedQuiz.name}" with the selected options? Type RESET to confirm.`
            : "Confirm quiz reset."
        }
        confirmLabel="Reset Quiz"
        loading={loadingKey === "reset"}
        onConfirm={handleResetConfirm}
        onCancel={() => {
          setShowConfirm(false);
          setConfirmText("");
        }}
      >
        <div className="mt-4">
          <Input
            label="Confirmation"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Type RESET"
          />
        </div>
      </ConfirmDialog>
    </>
  );
}
