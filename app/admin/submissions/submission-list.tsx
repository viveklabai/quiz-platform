"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { StatusBadge } from "@/src/components/ui/StatusBadge";
import {
  GRADING_OPTIONS,
  type GradingOption,
  type SubmissionGrade,
  type SubmissionReviewRow,
} from "@/src/types/database";
import { gradeSubmission } from "./actions";

type SubmissionListProps = {
  submissions: SubmissionReviewRow[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function gradeTone(grade: SubmissionGrade | null) {
  if (!grade) {
    return "neutral" as const;
  }

  if (grade.gradingMultiplier >= 1) {
    return "success" as const;
  }

  if (grade.gradingMultiplier >= 0.5) {
    return "warning" as const;
  }

  if (grade.gradingMultiplier >= 0.3333) {
    return "warning" as const;
  }

  if (grade.gradingMultiplier === 0) {
    return "danger" as const;
  }

  return "neutral" as const;
}

function isActiveGrade(
  grade: SubmissionGrade | null,
  option: GradingOption,
): boolean {
  if (!grade) {
    return false;
  }

  return grade.gradingMultiplier === option.multiplier;
}

export function SubmissionList({ submissions }: SubmissionListProps) {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<{
    submissionId: string;
    key: GradingOption["key"];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGrade(
    submissionId: string,
    gradingKey: GradingOption["key"],
  ) {
    setLoadingState({ submissionId, key: gradingKey });
    setError(null);

    const result = await gradeSubmission(submissionId, gradingKey);

    if (!result.success) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setLoadingState(null);
  }

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

      <section className="overflow-hidden rounded-xl border border-foreground/10">
        <div className="hidden grid-cols-[1fr_0.6fr_1.5fr_0.5fr_1fr_0.8fr_2fr] gap-4 border-b border-foreground/10 px-6 py-3 text-sm font-medium text-foreground/60 xl:grid">
          <span>Team Name</span>
          <span>Question</span>
          <span>Current Answer</span>
          <span>Count</span>
          <span>Latest Submitted</span>
          <span>Grade Status</span>
          <span>Grading</span>
        </div>

        <ul className="divide-y divide-foreground/10">
          {submissions.map((submission) => {
            const isRowLoading =
              loadingState?.submissionId === submission.id;

            return (
              <li
                key={submission.id}
                className="flex flex-col gap-4 px-6 py-4 xl:grid xl:grid-cols-[1fr_0.6fr_1.5fr_0.5fr_1fr_0.8fr_2fr] xl:items-start"
              >
                <div>
                  <p className="font-medium">{submission.teamName}</p>
                  <p className="mt-1 text-sm text-foreground/50 xl:hidden">
                    Question {submission.questionNumber}
                  </p>
                </div>
                <p className="hidden text-sm xl:block">
                  {submission.questionNumber}
                </p>
                <p className="text-sm">{submission.currentAnswer}</p>
                <p className="text-sm">{submission.submissionCount}</p>
                <p className="text-sm text-foreground/70">
                  {formatTimestamp(submission.latestSubmittedAt)}
                </p>
                <div>
                  <StatusBadge
                    label={
                      submission.grade ? submission.grade.label : "Ungraded"
                    }
                    tone={gradeTone(submission.grade)}
                  />
                  {submission.grade ? (
                    <p className="mt-2 text-xs text-foreground/50">
                      Score: {submission.grade.awardedScore}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {GRADING_OPTIONS.map((option) => (
                    <Button
                      key={option.key}
                      variant={
                        isActiveGrade(submission.grade, option)
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() => handleGrade(submission.id, option.key)}
                      disabled={loadingState !== null}
                      loading={
                        isRowLoading && loadingState?.key === option.key
                      }
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
