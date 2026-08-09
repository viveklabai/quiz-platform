"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type {
  LiveControlData,
  LiveQuestionItem,
  QuestionStatus,
} from "@/src/types/database";
import { closeQuestion, openQuestion } from "./actions";

type LiveControlProps = {
  data: LiveControlData;
};

function statusTone(status: QuestionStatus) {
  if (status === "OPEN") {
    return "success" as const;
  }

  if (status === "CLOSED") {
    return "danger" as const;
  }

  return "warning" as const;
}

export function LiveControl({ data }: LiveControlProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<
    "open" | "close" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedQuestion = data.selectedQuestion;
  const selectedIndex = selectedQuestion
    ? data.questions.findIndex(
        (question) => question.id === selectedQuestion.questionId,
      )
    : -1;

  const hasPrevious = selectedIndex > 0;
  const hasNext =
    selectedIndex >= 0 && selectedIndex < data.questions.length - 1;

  function selectQuestion(questionId: string) {
    router.push(`/admin/live?questionId=${questionId}`);
  }

  function handlePrevious() {
    if (!hasPrevious) {
      return;
    }

    selectQuestion(data.questions[selectedIndex - 1].id);
  }

  function handleNext() {
    if (!hasNext) {
      return;
    }

    selectQuestion(data.questions[selectedIndex + 1].id);
  }

  async function handleOpen() {
    if (!selectedQuestion) {
      return;
    }

    setLoadingAction("open");
    setError(null);
    setSuccess(null);

    const result = await openQuestion(selectedQuestion.questionId);

    if (result.success) {
      setSuccess(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingAction(null);
  }

  async function handleClose() {
    if (!selectedQuestion) {
      return;
    }

    setLoadingAction("close");
    setError(null);
    setSuccess(null);

    const result = await closeQuestion(selectedQuestion.questionId);

    if (result.success) {
      setSuccess(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingAction(null);
  }

  if (!data.quizId) {
    return (
      <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
        <p className="text-foreground/60">
          No active quiz found. Create a quiz first.
        </p>
      </section>
    );
  }

  if (data.questions.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
        <p className="text-foreground/60">
          No questions found for {data.quizName}. Add rounds and questions to
          this quiz first.
        </p>
      </section>
    );
  }

  const isOpen = selectedQuestion?.status === "OPEN";

  return (
    <div className="flex flex-col gap-8">
      <Card title="Active Quiz" value={data.quizName ?? "—"} />

      <section className="overflow-hidden rounded-xl border border-foreground/10">
        <div className="border-b border-foreground/10 px-6 py-4">
          <h2 className="text-lg font-semibold">Questions</h2>
        </div>

        <div className="hidden grid-cols-[1fr_1fr] gap-4 border-b border-foreground/10 px-6 py-3 text-sm font-medium text-foreground/60 sm:grid">
          <span>Question Number</span>
          <span>Status</span>
        </div>

        <ul className="divide-y divide-foreground/10">
          {data.questions.map((question: LiveQuestionItem) => {
            const isSelected =
              selectedQuestion?.questionId === question.id;
            const isOpenQuestion = question.status === "OPEN";

            return (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => selectQuestion(question.id)}
                  className={`flex w-full flex-col gap-3 px-6 py-4 text-left transition-colors sm:grid sm:grid-cols-[1fr_1fr] sm:items-center ${
                    isOpenQuestion ? "bg-green-500/10" : ""
                  } ${isSelected ? "ring-2 ring-inset ring-foreground/20" : "hover:bg-foreground/5"}`}
                >
                  <span className="font-medium">
                    Question {question.questionNumber}
                  </span>
                  <StatusBadge
                    label={question.status}
                    tone={statusTone(question.status)}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {selectedQuestion ? (
        <section className="rounded-xl border border-foreground/10 p-6">
          <h2 className="text-lg font-semibold">Selected Question</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-foreground/60">Quiz Name</p>
              <p className="mt-1 font-medium">{selectedQuestion.quizName}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Round</p>
              <p className="mt-1 font-medium">{selectedQuestion.roundName}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Question Number</p>
              <p className="mt-1 font-medium">
                {selectedQuestion.questionNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground/60">Status</p>
              <div className="mt-2">
                <StatusBadge
                  label={selectedQuestion.status}
                  tone={statusTone(selectedQuestion.status)}
                />
              </div>
            </div>
          </div>

          {error ? (
            <p
              className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {success ? (
            <p
              className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
              role="status"
            >
              {success}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              onClick={handleOpen}
              loading={loadingAction === "open"}
              disabled={isOpen || loadingAction !== null}
            >
              Open Question
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              loading={loadingAction === "close"}
              disabled={!isOpen || loadingAction !== null}
            >
              Close Question
            </Button>
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={!hasPrevious || loadingAction !== null}
            >
              Previous Question
            </Button>
            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={!hasNext || loadingAction !== null}
            >
              Next Question
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
