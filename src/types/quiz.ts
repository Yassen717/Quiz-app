export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: QuizCategory;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
}

export type QuizCategory =
  | "history"
  | "math"
  | "science"
  | "geography"
  | "literature"
  | "sports";

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  isFinished: boolean;
  selectedAnswer: number | -1 | null;
  showResult: boolean;
  timeRemaining: number;
}

export interface QuizCategoryInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
}
