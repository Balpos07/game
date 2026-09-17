import { create } from 'zustand';
import { QuizState, Question, DifficultyLevel } from '../types/quiz';

const getBasePoints = (difficulty: DifficultyLevel): number => {
  switch (difficulty) {
    case 'easy': return 100;
    case 'medium': return 200;
    case 'hard': return 300;
    default: return 100;
  }
};

export const useQuizStore = create<QuizState>((set) => ({
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  correctAnswersCount: 0,
  currentStreak: 0,
  status: 'idle',
  answers: [],
  lifelines: { fiftyFiftyUsed: false, addTimeUsed: false },

  startQuiz: (questions: Question[]) => set({
    questions,
    currentQuestionIndex: 0,
    score: 0,
    correctAnswersCount: 0,
    currentStreak: 0,
    status: 'playing',
    answers: [],
    lifelines: { fiftyFiftyUsed: false, addTimeUsed: false },
  }),

  submitAnswer: (questionId, selectedOptionIndex, timeRemainingSecs, totalTimeLimitSecs) => set((state) => {
    const question = state.questions.find(q => q.id === questionId);
    if (!question) return state;

    const isCorrect = selectedOptionIndex === question.correct_option_index;
    const basePoints = getBasePoints(question.difficulty);
    
    // Scoring Logic: Points Earned = Base Points * SpeedMultiplier * ComboMultiplier
    let pointsEarned = 0;
    let newStreak = isCorrect ? state.currentStreak + 1 : 0;

    if (isCorrect) {
      const speedMultiplier = 1 + (timeRemainingSecs / totalTimeLimitSecs);
      
      // Combo multiplier: 1.2x for streak of 3+, 1.5x for streak of 5+
      let comboMultiplier = 1;
      if (newStreak >= 5) comboMultiplier = 1.5;
      else if (newStreak >= 3) comboMultiplier = 1.2;

      pointsEarned = Math.round(basePoints * speedMultiplier * comboMultiplier);
    }

    const responseTimeMs = (totalTimeLimitSecs - timeRemainingSecs) * 1000;

    return {
      answers: [
        ...state.answers,
        { questionId, selectedOptionIndex, isCorrect, responseTimeMs, pointsEarned }
      ],
      score: state.score + pointsEarned,
      correctAnswersCount: state.correctAnswersCount + (isCorrect ? 1 : 0),
      currentStreak: newStreak,
    };
  }),

  nextQuestion: () => set((state) => {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.questions.length) {
      return { status: 'finished' };
    }
    return { currentQuestionIndex: nextIndex };
  }),

  useFiftyFifty: () => set((state) => ({
    lifelines: { ...state.lifelines, fiftyFiftyUsed: true }
  })),

  useAddTime: () => set((state) => ({
    lifelines: { ...state.lifelines, addTimeUsed: true }
  })),

  resetQuiz: () => set({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswersCount: 0,
    currentStreak: 0,
    status: 'idle',
    answers: [],
    lifelines: { fiftyFiftyUsed: false, addTimeUsed: false },
  }),
}));
