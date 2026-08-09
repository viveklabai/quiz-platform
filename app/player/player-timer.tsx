"use client";

import { useEffect, useState } from "react";
import { calculateMaxScoreAvailable } from "@/src/lib/time-based-scoring";
import type { PlayerQuestion } from "@/src/types/database";

type PlayerTimerProps = {
  question: PlayerQuestion;
};

function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function PlayerTimer({ question }: PlayerTimerProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const config = {
    maxQuestionScore: question.maxQuestionScore,
    minQuestionScore: question.minQuestionScore,
    questionDurationSeconds: question.questionDurationSeconds,
  };

  const currentMaxScore = calculateMaxScoreAvailable(
    question.openedAt,
    config,
    nowMs,
  );

  const elapsedSeconds = question.openedAt
    ? Math.max(0, (nowMs - new Date(question.openedAt).getTime()) / 1000)
    : 0;

  const remainingSeconds = Math.max(
    0,
    question.questionDurationSeconds - elapsedSeconds,
  );

  const isExpired = remainingSeconds <= 0;

  return (
    <section className="mt-8 rounded-xl border border-foreground/10 p-6">
      <h2 className="text-lg font-semibold">Score Timer</h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-foreground/60">Current Max Score</dt>
          <dd className="mt-1 text-2xl font-semibold">{currentMaxScore}</dd>
        </div>
        <div>
          <dt className="text-sm text-foreground/60">Time Remaining</dt>
          <dd className="mt-1 text-2xl font-semibold">
            {isExpired ? "0:00" : formatDuration(remainingSeconds)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-foreground/60">Score Range</dt>
          <dd className="mt-1 text-sm font-medium">
            {question.maxQuestionScore} → {question.minQuestionScore}
          </dd>
        </div>
      </dl>

      {isExpired ? (
        <p className="mt-4 text-sm text-foreground/60">
          Minimum score reached. You can still submit, but maximum available
          score is {question.minQuestionScore}.
        </p>
      ) : null}
    </section>
  );
}
