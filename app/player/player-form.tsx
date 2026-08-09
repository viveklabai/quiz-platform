"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import type { Submission } from "@/src/types/database";
import { submitAnswer } from "./actions";

type PlayerFormProps = {
  questionId: string;
  initialSubmission: Submission | null;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export function PlayerForm({ questionId, initialSubmission }: PlayerFormProps) {
  const [answer, setAnswer] = useState(initialSubmission?.current_answer ?? "");
  const [submission, setSubmission] = useState<Submission | null>(
    initialSubmission,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await submitAnswer(questionId, answer);

    if (result.success) {
      setSuccess(result.message);
      setSubmission((current) => ({
        id: current?.id ?? "",
        question_id: current?.question_id ?? questionId,
        team_id: current?.team_id ?? "",
        current_answer: result.submission.current_answer,
        submission_count: result.submission.submission_count,
        latest_submitted_at: result.submission.latest_submitted_at,
        maximum_score_available: result.submission.maximum_score_available,
        first_submitted_at: current?.first_submitted_at,
      }));
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-foreground/10 p-6"
      >
        <label htmlFor="answer" className="text-sm font-medium">
          Your Answer
        </label>
        <textarea
          id="answer"
          name="answer"
          rows={6}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type your answer here..."
          disabled={loading}
          required
          className="mt-3 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground/40 disabled:opacity-50"
        />

        {error ? (
          <p
            className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p
            className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
            role="status"
          >
            {success}
          </p>
        ) : null}

        <Button
          type="submit"
          loading={loading}
          className="mt-4 w-full sm:w-auto"
        >
          Submit Answer
        </Button>
      </form>

      <section className="rounded-xl border border-foreground/10 p-6">
        <h2 className="text-lg font-semibold">Submission Status</h2>

        {submission ? (
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-foreground/60">Current Submitted Answer</dt>
              <dd className="mt-1 font-medium">{submission.current_answer}</dd>
            </div>
            <div>
              <dt className="text-foreground/60">Available Score at Last Submit</dt>
              <dd className="mt-1 font-medium">
                {submission.maximum_score_available ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/60">Submission Count</dt>
              <dd className="mt-1 font-medium">{submission.submission_count}</dd>
            </div>
            <div>
              <dt className="text-foreground/60">Last Submitted</dt>
              <dd className="mt-1 font-medium">
                {formatTimestamp(submission.latest_submitted_at)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-foreground/60">No submission yet.</p>
        )}
      </section>
    </div>
  );
}
