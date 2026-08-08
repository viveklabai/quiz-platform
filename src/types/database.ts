export type QuestionStatus = "open" | "closed" | "pending";

export type Quiz = {
  id: string;
  name: string;
  created_at?: string;
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
  prompt: string;
  status: QuestionStatus;
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

export type LiveQuestionView = {
  questionId: string;
  questionPrompt: string;
  status: QuestionStatus;
  roundName: string;
  quizName: string;
};

export type TeamWithMemberCount = Team & {
  memberCount: number;
};
