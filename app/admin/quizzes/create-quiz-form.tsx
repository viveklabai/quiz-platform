"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { QUIZ_SCORING_DEFAULTS } from "@/src/types/database";
import { createQuiz } from "./actions";

export function CreateQuizForm() {
  const [name, setName] = useState("");
  const [maxQuestionScore, setMaxQuestionScore] = useState(
    String(QUIZ_SCORING_DEFAULTS.maxQuestionScore),
  );
  const [minQuestionScore, setMinQuestionScore] = useState(
    String(QUIZ_SCORING_DEFAULTS.minQuestionScore),
  );
  const [questionDurationSeconds, setQuestionDurationSeconds] = useState(
    String(QUIZ_SCORING_DEFAULTS.questionDurationSeconds),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await createQuiz(
      name,
      Number(maxQuestionScore),
      Number(minQuestionScore),
      Number(questionDurationSeconds),
    );

    if (result.success) {
      setSuccess(result.message);
      setName("");
      setMaxQuestionScore(String(QUIZ_SCORING_DEFAULTS.maxQuestionScore));
      setMinQuestionScore(String(QUIZ_SCORING_DEFAULTS.minQuestionScore));
      setQuestionDurationSeconds(
        String(QUIZ_SCORING_DEFAULTS.questionDurationSeconds),
      );
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-foreground/10 p-6">
      <h2 className="text-lg font-semibold">Create Quiz</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Add a new quiz with time-based scoring settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Input
          label="Quiz Name"
          name="quizName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter quiz name"
          disabled={loading}
          required
        />

        <Input
          label="Starting Score"
          name="maxQuestionScore"
          type="number"
          min={0}
          value={maxQuestionScore}
          onChange={(event) => setMaxQuestionScore(event.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Minimum Score"
          name="minQuestionScore"
          type="number"
          min={0}
          value={minQuestionScore}
          onChange={(event) => setMinQuestionScore(event.target.value)}
          disabled={loading}
          required
        />

        <Input
          label="Question Duration (seconds)"
          name="questionDurationSeconds"
          type="number"
          min={1}
          value={questionDurationSeconds}
          onChange={(event) => setQuestionDurationSeconds(event.target.value)}
          disabled={loading}
          required
        />

        {error ? (
          <p
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
            role="status"
          >
            {success}
          </p>
        ) : null}

        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          Create Quiz
        </Button>
      </form>
    </section>
  );
}
