export type QuestionCategory = 'code_and_dev' | 'design_and_ui' | 'writing_and_content' | 'tech_culture';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  question_text: string;
  code_snippet?: string;
  options: string[]; // Always 4 options
  correct_option_index: number;
  explanation: string;
  time_limit_seconds: number;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  correctAnswersCount: number;
  status: 'idle' | 'playing' | 'finished';
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
  resetQuiz: () => void;
}
