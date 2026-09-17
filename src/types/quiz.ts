export type QuestionCategory = 'world_capitals' | 'geography' | 'landmarks' | 'history';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  question_text: string;
  code_snippet?: string;
  hint_emoji?: string;
  options: string[]; // Always 4 options
  correct_option_index: number;
  explanation: string;
  time_limit_seconds: number;
}

export interface Lifelines {
  fiftyFiftyUsed: boolean;
  addTimeUsed: boolean;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  correctAnswersCount: number;
  currentStreak: number;
  status: 'idle' | 'playing' | 'finished';
  lifelines: Lifelines;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    isCorrect: boolean;
    responseTimeMs: number;
    pointsEarned: number;
  }[];
  
  // Actions
  startQuiz: (questions: Question[]) => void;
  submitAnswer: (questionId: string, selectedOptionIndex: number, timeRemainingSecs: number, totalTimeLimitSecs: number) => void;
  nextQuestion: () => void;
  useFiftyFifty: () => void;
  useAddTime: () => void;
  resetQuiz: () => void;
}
