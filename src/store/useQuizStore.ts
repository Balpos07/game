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
  status: 'idle',
  answers: [],

  startQuiz: (questions: Question[]) => set({
    questions,
    currentQuestionIndex: 0,
    score: 0,
    correctAnswersCount: 0,
    status: 'playing',
    answers: [],
  }),

  submitAnswer: (questionId, selectedOptionIndex, timeRemainingSecs, totalTimeLimitSecs) => set((state) => {
    const question = state.questions.find(q => q.id === questionId);
    if (!question) return state;

    const isCorrect = selectedOptionIndex === question.correct_option_index;
    const basePoints = getBasePoints(question.difficulty);
    
    // Scoring Logic: Points Earned = Base Points * (1 + (Time Remaining in Seconds / Total Time Limit))
    // Only give points if correct
    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = Math.round(basePoints * (1 + (timeRemainingSecs / totalTimeLimitSecs)));
    }

    const responseTimeMs = (totalTimeLimitSecs - timeRemainingSecs) * 1000;

    return {
      answers: [
        ...state.answers,
        { questionId, selectedOptionIndex, isCorrect, responseTimeMs, pointsEarned }
      ],
      score: state.score + pointsEarned,
      correctAnswersCount: state.correctAnswersCount + (isCorrect ? 1 : 0)
    };
  }),

  nextQuestion: () => set((state) => {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.questions.length) {
      return { status: 'finished' };
    }
    return { currentQuestionIndex: nextIndex };
  }),

  resetQuiz: () => set({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswersCount: 0,
    status: 'idle',
    answers: [],
  }),
}));
