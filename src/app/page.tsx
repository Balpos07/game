'use client';

import React, { useEffect } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import { Question } from '@/types/quiz';
import { Trophy } from 'lucide-react';

import { GEOGRAPHY_QUESTIONS } from '@/data/questions';

export default function Home() {
  const { startQuiz, status, score, correctAnswersCount, questions, resetQuiz } = useQuizStore();

  useEffect(() => {
    // Only start if not already playing or finished
    if (status === 'idle') {
      startQuiz(GEOGRAPHY_QUESTIONS);
    }
  }, [status, startQuiz]);

  if (status === 'finished') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-10 flex flex-col items-center gap-6 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center border border-amber-500/50">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-50">Quiz Complete!</h1>
          
          <div className="flex gap-8 my-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#00f2fe]">{score}</span>
              <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Total Score</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-[#10b981]">{correctAnswersCount}/{questions.length}</span>
              <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Correct</span>
            </div>
          </div>

          <button 
            onClick={() => { resetQuiz(); startQuiz(GEOGRAPHY_QUESTIONS); }}
            className="w-full bg-[#00f2fe] text-slate-950 font-bold text-lg py-4 rounded-xl hover:bg-[#00f2fe]/90 transition-colors"
          >
            Play Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col pt-16">
      <div className="max-w-5xl mx-auto w-full mb-12 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00f2fe] to-[#4facfe]">
          World Explorer Trivia
        </h1>
        <p className="text-slate-400 mt-2">Geography Challenge</p>
      </div>
      
      <QuizEngine />
    </main>
  );
}
