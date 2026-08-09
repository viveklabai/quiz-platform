export type QuestionStatus = "OPEN" | "CLOSED" | "NOT_STARTED";

export type Quiz = {
  id: string;
  name: string;
  max_question_score: number;
  min_question_score: number;
  question_duration_seconds: number;
  archived?: boolean;
  created_at?: string;
};

export type RoundWithQuestions = {
  id: string;
  quiz_id: string;
  name: string;
  order_index?: number;
  created_at?: string;
  questionCount: number;
  questions: Question[];
};

export type QuizSetup = {
  quiz: Quiz;
  rounds: RoundWithQuestions[];
};

export type TeamAdminRow = TeamWithMemberCount & {
  submissionCount: number;
  totalScore: number;
};

export type ResultsData = {
  currentQuestion: string | null;
  timeRemainingSeconds: number | null;
  totalTeams: number;
  totalSubmissions: number;
  totalGraded: number;
  ungradedCount: number;
  highestScore: number;
  topTeams: LeaderboardRow[];
  recentSubmissions: SubmissionReviewRow[];
  recentGrades: Array<{
    teamName: string;
    questionNumber: number;
    awardedScore: number;
    gradedAt: string;
  }>;
};

export type Round = {
  id: string;
  quiz_id: string;
  name: string;
  order_index?: number;
  created_at?: string;
};

export type Question = {
  id: string;
  round_id: string;
  question_number: number;
  status: QuestionStatus;
  opened_at?: string | null;
  order_index?: number;
  created_at?: string;
};

export type Team = {
  id: string;
  name: string;
  join_code: string;
  active: boolean;
  created_at?: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  display_name: string;
  created_at?: string;
};

export type LiveQuestionItem = {
  id: string;
  questionNumber: number;
  status: QuestionStatus;
};

export type LiveQuestionView = {
  questionId: string;
  questionNumber: number;
  questionPrompt: string;
  status: QuestionStatus;
  roundName: string;
  quizName: string;
};

export type LiveControlData = {
  quizId: string | null;
  quizName: string | null;
  questions: LiveQuestionItem[];
  selectedQuestion: LiveQuestionView | null;
};

export type TeamWithMemberCount = Team & {
  memberCount: number;
};

export type Submission = {
  id: string;
  question_id: string;
  team_id: string;
  current_answer: string;
  submission_count: number;
  /** Persisted team-specific available score at last submission time. */
  maximum_score_available?: number;
  first_submitted_at?: string;
  latest_submitted_at: string;
};

export type PlayerQuestion = {
  id: string;
  question_number: number;
  status: string;
  quizName: string;
  roundName: string;
  openedAt: string | null;
  maxQuestionScore: number;
  minQuestionScore: number;
  questionDurationSeconds: number;
};

export type SubmissionReviewRow = {
  id: string;
  teamId: string;
  teamName: string;
  questionNumber: number;
  currentAnswer: string;
  submissionCount: number;
  /** Team-specific available score locked in at last submission. */
  availableScore: number | null;
  latestSubmittedAt: string;
  grade: SubmissionGrade | null;
};

export type SubmissionFilterOption = {
  id: string;
  label: string;
};

export type Grade = {
  id: string;
  submission_id: string;
  grading_multiplier: number;
  /** Snapshot of submission available score used when grading. */
  time_based_max_score?: number;
  /** Final points from stored available score and grading multiplier. */
  awarded_score: number;
  graded_at: string;
};

export type SubmissionGrade = {
  gradingMultiplier: number;
  awardedScore: number;
  gradedAt: string;
  label: string;
};

export type GradingOption = {
  key: "correct" | "half" | "one_third" | "incorrect";
  label: string;
  multiplier: number;
};

export const QUIZ_SCORING_DEFAULTS = {
  maxQuestionScore: 100,
  minQuestionScore: 0,
  questionDurationSeconds: 60,
};

export const GRADING_OPTIONS: GradingOption[] = [
  { key: "correct", label: "Correct", multiplier: 1.0 },
  { key: "half", label: "Half Correct", multiplier: 0.5 },
  { key: "one_third", label: "One Third Correct", multiplier: 0.3333 },
  { key: "incorrect", label: "Incorrect", multiplier: 0 },
];

export type ScoreSummary = {
  team_id: string;
  quiz_id: string;
  total_score: number;
  questions_graded: number;
  updated_at?: string;
};

export type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  totalScore: number;
};

export type LeaderboardRow = LeaderboardEntry & {
  rank: number;
};

export type LeaderboardData = {
  entries: LeaderboardRow[];
  totalTeams: number;
  highestScore: number;
};
