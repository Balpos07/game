'use client';

import React, { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import { GEOGRAPHY_QUESTIONS } from '@/data/questions';
import { Trophy, Share2, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import confetti from 'canvas-confetti';
import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

// ── GDG four-color word mark ──────────────────────────────────────────────────
function DnvWordMark() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-3xl md:text-5xl font-bold leading-none select-none text-[#1E1E1E]">
      <span>Dev</span>
      <span>N</span>
      <span>&apos;</span>
      <span>Visuals</span>
      <span>·</span>
      <span>Trivia</span>
      <span>!</span>
    </div>
  );
}

// ── Floating emoji chip ───────────────────────────────────────────────────────
function FloatingChip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute pointer-events-none select-none text-2xl md:text-3xl opacity-70"
      style={style}
    >
      {children}
    </div>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-4xl md:text-5xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-[#1E1E1E]/50">{label}</span>
    </div>
  );
}

// ── Arrow icon (matches DevFest pill buttons) ─────────────────────────────────
function ArrowIcon({ color = '#3186FF' }: { color?: string }) {
  return (
    <span className="flex h-5.5 w-7 items-center justify-center rounded-full bg-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 5H19V11"/><path d="M19 5L5 19"/>
      </svg>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const { startQuiz, status, score, correctAnswersCount, questions, answers, resetQuiz } =
    useQuizStore();
  const { playFinished } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [scoreSaved, setScoreSaved] = useState(false);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      startQuiz(GEOGRAPHY_QUESTIONS);
    }

    if (status === 'finished') {
      playFinished();

      const db = getFirebaseDb();
      if (!authLoading && user && db && !scoreSaved) {
        addDoc(collection(db, 'leaderboard'), {
          uid: user.uid,
          name: user.displayName || 'Guest Player',
          photoURL: user.photoURL,
          score,
          correctAnswers: correctAnswersCount,
          totalQuestions: questions.length,
          date: Date.now(),
        })
          .then(() => setScoreSaved(true))
          .catch(err => console.error('Error saving score:', err));
      }

      // Confetti burst
      const duration = 3500;
      const end = Date.now() + duration;
      const colors = ['#3186FF', '#EA4335', '#FBBC05', '#34A853', '#A9A8FF'];

      const frame = () => {
        const left = end - Date.now();
        if (left <= 0) return;
        const count = 45 * (left / duration);
        confetti({ particleCount: count, angle: 55, spread: 65, origin: { x: 0 }, colors });
        confetti({ particleCount: count, angle: 125, spread: 65, origin: { x: 1 }, colors });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [status, startQuiz, playFinished, user, authLoading, score, scoreSaved, correctAnswersCount, questions.length]);

  // ── Share ──────────────────────────────────────────────────────────────────
  const generateShareText = () => {
    const header = `🏆 DevN'Visuals Trivia\nScore: ${score} (${correctAnswersCount}/${questions.length} correct)\n`;
    let grid = '';
    answers.forEach((ans, idx) => {
      grid += ans.isCorrect ? '🟦' : '🟥';
      if ((idx + 1) % 5 === 0) grid += '\n';
    });
    return `${header}\n${grid}\nPlay at: devnvisuals.com`;
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: noop
    }
  };

  const percentage = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
  const emoji = percentage >= 80 ? '🎉' : percentage >= 50 ? '💪' : '📚';
  const tagline =
    percentage >= 80 ? 'Outstanding performance!' :
    percentage >= 50 ? 'Solid effort!' :
    'Keep learning!';

  // ── Results screen ─────────────────────────────────────────────────────────
  if (status === 'finished') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-start px-4 py-12 gap-8">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="glass-card p-8 md:p-12 flex flex-col items-center gap-6 w-full max-w-lg text-center"
            >
              {/* Trophy burst */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse-ring"
                  style={{ background: 'radial-gradient(85.98% 85.98% at 50% 17.07%, #3186FF 52%, #6D97FF 76%, #A9A8FF 100%)' }}>
                  <Trophy className="w-9 h-9 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-[#1E1E1E]">Quiz Complete! {emoji}</h1>
                <p className="text-[#1E1E1E]/60 font-medium">{tagline}</p>
              </div>

              {/* Scores */}
              <div className="flex items-center justify-center gap-10 py-4 w-full border-y border-[#1E1E1E]/6">
                <ScoreRing value={score.toString()} label="Score" color="#3186FF" />
                <div className="w-px h-10 bg-[#1E1E1E]/10" />
                <ScoreRing value={`${correctAnswersCount}/${questions.length}`} label="Correct" color="#34A853" />
                <div className="w-px h-10 bg-[#1E1E1E]/10" />
                <ScoreRing value={`${percentage}%`} label="Accuracy" color="#FBBC05" />
              </div>

              {/* Answer grid */}
              <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                {answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      ans.isCorrect
                        ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/25'
                        : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/25'
                    }`}
                    title={`Q${idx + 1}: ${ans.isCorrect ? 'Correct' : 'Wrong'}`}
                  >
                    {ans.isCorrect ? '✓' : '✗'}
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleShare}
                  className="btn-primary w-full !py-3.5 !text-base"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied to clipboard!' : 'Share results'}
                  {!copied && <ArrowIcon />}
                </button>

                <button
                  onClick={() => { resetQuiz(); setScoreSaved(false); startQuiz(GEOGRAPHY_QUESTIONS); }}
                  className="btn-secondary w-full !py-3.5 !text-base"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play again
                </button>
              </div>

              {!user && (
                <p className="text-sm text-[#1E1E1E]/50">
                  Sign in to save your score to the leaderboard ↑
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Leaderboard */}
          <Leaderboard />
        </main>
      </div>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        {/* Hero header */}
        <div className="relative w-full max-w-3xl text-center mb-10">
          {/* Floating decoration */}
          <FloatingChip style={{ top: '-10px', left: '0', animationDelay: '0s' }} >
            <span className="animate-float inline-block">💡</span>
          </FloatingChip>
          <FloatingChip style={{ top: '8px', right: '4px', animationDelay: '0.8s' }}>
            <span className="animate-float-rev inline-block">🏆</span>
          </FloatingChip>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            {/* GDG event chip */}
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#3186FF]/20 shadow-sm">
              <span className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full bg-[#3186FF]" />
                <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                <span className="w-2 h-2 rounded-full bg-[#34A853]" />
              </span>
              <span className="text-xs font-bold text-[#1E1E1E]/70 uppercase tracking-wider">DevN&apos;Visuals</span>
            </div> */}

            <DnvWordMark />

            <p className="text-[#1E1E1E]/60 font-medium max-w-md">
              Test your tech and design knowledge and compete for the top spot on the leaderboard.
            </p>
          </motion.div>
        </div>

        {/* Quiz engine */}
        <QuizEngine />

        {/* Leaderboard below */}
        <div className="w-full max-w-3xl mt-12">
          <Leaderboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-[#1E1E1E]/40 border-t border-[#1E1E1E]/6">
        <p>
          Made with ❤️ by{' '}
          <a href="#" className="underline hover:text-[#3186FF] transition-colors">
            DevN&apos;Visuals
          </a>
        </p>
      </footer>
    </div>
  );
}
