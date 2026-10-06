export type QuestionCategory = 'world_capitals' | 'geography' | 'landmarks' | 'history' | 'technology' | 'nigerian_culture';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export const QUESTION_CATEGORIES: readonly { value: QuestionCategory; label: string }[] = [
  { value: 'nigerian_culture', label: 'Nigerian culture' },
  { value: 'history', label: 'Nigerian history' },
  { value: 'technology', label: 'Technology' },
  { value: 'geography', label: 'Geography' },
  { value: 'world_capitals', label: 'World capitals' },
  { value: 'landmarks', label: 'Landmarks' },
];

export function getQuestionCategoryLabel(category: QuestionCategory): string {
  return QUESTION_CATEGORIES.find(option => option.value === category)?.label ?? category.replaceAll('_', ' ');
}

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
  bestStreak: number;
  status: 'idle' | 'playing' | 'finished';
  competition: { challengeId: string; shareCode: string } | null;
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
  setCompetition: (competition: { challengeId: string; shareCode: string } | null) => void;
  submitAnswer: (questionId: string, selectedOptionIndex: number, timeRemainingSecs: number, totalTimeLimitSecs: number) => void;
  nextQuestion: () => void;
  activateFiftyFifty: () => void;
  activateAddTime: () => void;
  resetQuiz: () => void;
}
