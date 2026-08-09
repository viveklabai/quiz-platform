import { GRADING_OPTIONS } from "@/src/types/database";

export type TimeBasedScoringConfig = {
  maxQuestionScore: number;
  minQuestionScore: number;
  questionDurationSeconds: number;
};

/**
 * Computes the live score clock for display only.
 * Persist the result on submit via submissions.maximum_score_available.
 */
export function calculateMaxScoreAvailable(
  openedAt: string | null,
  config: TimeBasedScoringConfig,
  nowMs = Date.now(),
): number {
  const { maxQuestionScore, minQuestionScore, questionDurationSeconds } = config;

  if (!openedAt || questionDurationSeconds <= 0) {
    return maxQuestionScore;
  }

  const elapsedSeconds =
    (nowMs - new Date(openedAt).getTime()) / 1000;

  if (elapsedSeconds >= questionDurationSeconds) {
    return minQuestionScore;
  }

  if (elapsedSeconds <= 0) {
    return maxQuestionScore;
  }

  const progress = elapsedSeconds / questionDurationSeconds;
  const score =
    maxQuestionScore - (maxQuestionScore - minQuestionScore) * progress;

  return Math.round(score);
}

/**
 * Grading always uses the persisted submission available score,
 * never a recalculated timestamp-based value.
 */
export function calculateAwardedScore(
  availableScore: number,
  gradingKey: "correct" | "half" | "one_third" | "incorrect",
): number {
  const option = GRADING_OPTIONS.find((gradingOption) => gradingOption.key === gradingKey);

  if (!option || option.multiplier === 0) {
    return 0;
  }

  return Math.round(availableScore * option.multiplier);
}
