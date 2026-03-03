export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  instructions?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  durationSeconds: number;
  totalMarks: number;
  categories?: Category[];
  questionCount?: number;
};

export type Choice = {
  id: string;
  text: string;
  order?: number;
  isCorrect?: boolean;
};

export type QuizQuestion = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
  text: string;
  explanation?: string | null;
  points: number;
  order: number;
  choices: Choice[];
  answer?: {
    selectedChoiceId?: string | null;
    textAnswer?: string | null;
    isCorrect?: boolean | null;
    awardedScore?: number | null;
  } | null;
};

export type AttemptPayload = {
  id: string;
  status: "STARTED" | "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";
  startedAt: string;
  submittedAt?: string | null;
  quizId: string;
  durationSeconds: number;
  timeRemainingSeconds: number;
  totalScore?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  tabSwitchCount?: number;
};

export type AttemptResultQuestion = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
  text: string;
  explanation?: string | null;
  points: number;
  options: Choice[];
  userAnswer: {
    selectedChoiceId?: string | null;
    textAnswer?: string | null;
  };
  correctAnswer: string[];
  isCorrect: boolean;
  awardedScore: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
