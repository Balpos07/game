'use client';

import React, { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import { GEOGRAPHY_QUESTIONS } from '@/data/questions';
import { Trophy, Share2, Check } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import confetti from 'canvas-confetti';
import LoginButton from '@/components/LoginButton';
import Leaderboard from '@/components/Leaderboard';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const { startQuiz, status, score, correctAnswersCount, questions, answers, resetQuiz } = useQuizStore();
  const { playFinished } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    // Only start if not already playing or finished
    if (status === 'idle') {
      startQuiz(GEOGRAPHY_QUESTIONS);
    }
    if (status === 'finished') {
      playFinished();
      
      // Save score to Firestore
      if (user && !scoreSaved) {
        addDoc(collection(db, 'leaderboard'), {
          uid: user.uid,
          name: user.displayName || 'Anonymous Player',
          photoURL: user.photoURL,
          score,
          correctAnswers: correctAnswersCount,
          totalQuestions: questions.length,
          date: Date.now()
        }).catch(err => console.error("Error saving score:", err));
        setScoreSaved(true);
      }

      // Trigger cinematic confetti cannon
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.1, y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.9, y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [status, startQuiz, playFinished, user, score, scoreSaved, correctAnswersCount, questions.length]);

  const generateShareText = () => {
    const header = `🌍 World Explorer Trivia\nScore: ${score} 🥇 (${correctAnswersCount}/${questions.length})\n`;
    
    // Generate emoji grid (5 per row)
    let grid = '';
    answers.forEach((ans, idx) => {
      grid += ans.isCorrect ? '🟩' : '🟥';
      if ((idx + 1) % 5 === 0) grid += '\n';
    });
    
    return `${header}\n${grid}\nPlay at: localhost:3000`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (status === 'finished') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header with Login Button */}
        <div className="absolute top-4 right-4 z-50">
          <LoginButton />
        </div>

        <div className="glass-panel p-10 flex flex-col items-center gap-6 max-w-lg w-full text-center bg-white shadow-xl">
          <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center border border-amber-200">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Quiz Complete!</h1>
          
          <div className="flex gap-8 my-6">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#3b82f6]">{score}</span>
              <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total Score</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-[#10b981]">{correctAnswersCount}/{questions.length}</span>
              <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Correct</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleShare}
              className="w-full glass-panel border-[#8a2be2]/20 bg-[#8a2be2]/10 text-[#8a2be2] font-bold text-lg py-4 flex items-center justify-center gap-2 hover:bg-[#8a2be2]/20 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              {copied ? 'Copied to Clipboard!' : 'Share Results'}
            </button>

            <button 
              onClick={() => { resetQuiz(); setScoreSaved(false); startQuiz(GEOGRAPHY_QUESTIONS); }}
              className="w-full bg-[#3b82f6] text-white font-bold text-lg py-4 rounded-xl hover:bg-[#2563eb] transition-colors shadow-md"
            >
              Play Again
            </button>
          </div>
        </div>

        {!user && (
          <div className="mt-4 text-slate-500 text-sm flex items-center gap-2">
            Want to save your score? <span className="font-semibold text-slate-700">Sign in using the button in the top right.</span>
          </div>
        )}

        {/* Global Leaderboard */}
        <Leaderboard />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col pt-16">
      {/* Header with Login Button */}
      <div className="absolute top-4 right-4 z-50">
        <LoginButton />
      </div>

      <div className="max-w-5xl mx-auto w-full mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          World Explorer Trivia
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Geography Challenge</p>
      </div>
      
      <QuizEngine />
    </main>
  );
}
