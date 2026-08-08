"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import type { LiveQuestionView } from "@/src/types/database";
import { closeQuestion, openQuestion } from "./actions";

type LiveControlProps = {
  liveQuestion: LiveQuestionView | null;
};

function statusTone(status: LiveQuestionView["status"]) {
  if (status === "open") {
    return "success" as const;
  }

  if (status === "closed") {
    return "danger" as const;
  }

  return "warning" as const;
}

export function LiveControl({ liveQuestion }: LiveControlProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<
    "open" | "close" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleOpen() {
    if (!liveQuestion) {
      return;
    }

    setLoadingAction("open");
    setError(null);
    setSuccess(null);

    const result = await openQuestion(liveQuestion.questionId);

    if (result.success) {
      setSuccess(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingAction(null);
  }

  async function handleClose() {
    if (!liveQuestion) {
      return;
    }

    setLoadingAction("close");
    setError(null);
    setSuccess(null);

    const result = await closeQuestion(liveQuestion.questionId);

    if (result.success) {
      setSuccess(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }

    setLoadingAction(null);
  }

  if (!liveQuestion) {
    return (
      <section className="rounded-xl border border-dashed border-foreground/20 p-8 text-center">
        <p className="text-foreground/60">
          No questions found. Add rounds and questions to a quiz first.
        </p>
      </section>
    );
  }

  const isOpen = liveQuestion.status === "open";

  return (
    <section className="rounded-xl border border-foreground/10 p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-foreground/60">Quiz Name</p>
          <p className="mt-1 font-medium">{liveQuestion.quizName}</p>
        </div>
        <div>
          <p className="text-sm text-foreground/60">Round</p>
          <p className="mt-1 font-medium">{liveQuestion.roundName}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-foreground/60">Question</p>
          <p className="mt-1 font-medium">{liveQuestion.questionPrompt}</p>
        </div>
        <div>
          <p className="text-sm text-foreground/60">Status</p>
          <div className="mt-2">
            <StatusBadge
              label={liveQuestion.status}
              tone={statusTone(liveQuestion.status)}
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
      </div>
    </section>
  );
}
