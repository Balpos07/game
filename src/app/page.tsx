'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import { TECH_TRIVIA_QUESTIONS } from '@/data/questions';
import type { DifficultyLevel, Question, QuestionCategory } from '@/types/quiz';
import { Trophy, Share2, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import confetti from 'canvas-confetti';
import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

function DnvWordMark() {
  return (
    <h1 className="max-w-full px-2 text-center text-3xl font-bold leading-tight text-[#1E1E1E] select-none sm:text-4xl md:px-0 md:text-5xl">
      DN&apos;V  Trivia!
    </h1>
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
  const { startQuiz, status, score, correctAnswersCount, questions, answers, bestStreak, resetQuiz } =
    useQuizStore();
  const currentAccuracy = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;
  const { playFinished } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [scoreSaveState, setScoreSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [scoreSaveError, setScoreSaveError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [dailyChallenge, setDailyChallenge] = useState(false);
  const [quizQuestionBank, setQuizQuestionBank] = useState(TECH_TRIVIA_QUESTIONS);
  const [questionBankReady, setQuestionBankReady] = useState(false);
  const scoreSaveStarted = useRef(false);

  const shuffleQuestions = (items: Question[], seed?: string) => {
    const shuffled = [...items];
    let seedValue = seed ? [...seed].reduce((total, character) => total + character.charCodeAt(0), 0) : Math.random() * 1000;
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      const swapIndex = Math.floor((seedValue / 233280) * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) {
      const timeoutId = setTimeout(() => setQuestionBankReady(true), 0);
      return () => clearTimeout(timeoutId);
    }
    return onSnapshot(collection(db, 'questions'), snapshot => {
      const remoteQuestions = snapshot.docs.map(item => ({ id: item.id, ...item.data() })) as Question[];
      const mergedQuestions = new Map(TECH_TRIVIA_QUESTIONS.map(question => [question.id, question]));
      remoteQuestions.forEach(question => mergedQuestions.set(question.id, question));
      setQuizQuestionBank([...mergedQuestions.values()]);
      setQuestionBankReady(true);
    }, error => {
      console.error('Question bank error:', error);
      setQuestionBankReady(true);
    });
  }, []);

  const startSelectedQuiz = () => {
    if (!questionBankReady) return;
    const filteredQuestions = quizQuestionBank.filter(question => (
      (selectedCategory === 'all' || question.category === selectedCategory) &&
      (selectedDifficulty === 'all' || question.difficulty === selectedDifficulty)
    ));
    const dateSeed = new Date().toISOString().slice(0, 10);
    const quizQuestions = dailyChallenge
      ? shuffleQuestions(filteredQuestions, dateSeed).slice(0, 5)
      : shuffleQuestions(filteredQuestions);
    startQuiz(quizQuestions.length > 0 ? quizQuestions : quizQuestionBank);
  };

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'finished') {
      playFinished();

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
  }, [status, startQuiz, playFinished]);

  useEffect(() => {
    if (status !== 'finished' || authLoading || scoreSaveStarted.current) return;

    scoreSaveStarted.current = true;
    setScoreSaveState('saving');
    setScoreSaveError(null);

    const saveScore = async () => {
      const db = getFirebaseDb();
      if (!db) throw new Error('Score saving is not configured.');
      if (!user || user.isAnonymous) throw new Error('Please sign in with Google to save your score.');

      await addDoc(collection(db, 'leaderboard'), {
        uid: user.uid,
        name: user.displayName || 'Google Player',
        photoURL: user.photoURL,
        score,
        correctAnswers: correctAnswersCount,
        totalQuestions: questions.length,
        date: Date.now(),
      });
    };

    saveScore()
      .then(() => {
        setScoreSaveState('saved');
      })
      .catch((error: unknown) => {
        console.error('Error saving score:', error);
        setScoreSaveState('error');
        setScoreSaveError(error instanceof Error ? error.message : 'Unable to save this score.');
      });
  }, [status, authLoading, user, score, correctAnswersCount, questions.length]);

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
      const text = generateShareText();
      const card = await new Promise<File>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to create result card.'));
          return;
        }
        context.fillStyle = '#FCF4F4';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#3186FF';
        context.fillRect(0, 0, 18, canvas.height);
        context.fillStyle = '#1E1E1E';
        context.font = '700 42px sans-serif';
        context.fillText("DevN'Visuals Trivia", 72, 92);
        context.font = '700 112px sans-serif';
        context.fillStyle = '#3186FF';
        context.fillText(String(score), 72, 250);
        context.font = '600 26px sans-serif';
        context.fillStyle = '#1E1E1E';
        context.fillText('POINTS', 76, 292);
        context.fillStyle = '#34A853';
        context.fillText(`${correctAnswersCount}/${questions.length} correct`, 72, 380);
        context.fillStyle = '#1E1E1E';
        context.font = '600 24px sans-serif';
        context.fillText(`${percentage}% accuracy`, 72, 425);
        answers.forEach((answer, index) => {
          context.fillStyle = answer.isCorrect ? '#34A853' : '#EA4335';
          context.beginPath();
          context.roundRect(700 + (index % 5) * 82, 180 + Math.floor(index / 5) * 82, 54, 54, 12);
          context.fill();
          context.fillStyle = '#FFFFFF';
          context.font = '700 26px sans-serif';
          context.fillText(answer.isCorrect ? '✓' : '×', 716 + (index % 5) * 82, 217 + Math.floor(index / 5) * 82);
        });
        canvas.toBlob(blob => blob ? resolve(new File([blob], 'dnv-trivia-result.png', { type: 'image/png' })) : reject(new Error('Unable to export result card.')), 'image/png');
      });
      if (navigator.share) {
        if (navigator.canShare?.({ files: [card] })) await navigator.share({ title: "DevN'Visuals Trivia result", text, files: [card] });
        else await navigator.share({ title: "DevN'Visuals Trivia result", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
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
  const achievements = [
    { label: 'First finish', unlocked: questions.length > 0 },
    { label: 'Accuracy ace', unlocked: percentage >= 80 },
    { label: 'Streak master', unlocked: bestStreak >= 3 },
    { label: 'Perfect run', unlocked: correctAnswersCount === questions.length && questions.length > 0 },
  ];

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

              <div className="w-full text-left">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Achievements</p>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map(achievement => (
                    <div key={achievement.label} className={`rounded-xl border p-3 text-xs font-bold ${achievement.unlocked ? 'border-[#FBBC05]/30 bg-[#FBBC05]/10 text-[#1E1E1E]' : 'border-[#1E1E1E]/8 bg-[#1E1E1E]/3 text-[#1E1E1E]/30'}`}>
                      <Sparkles className={`mb-1 h-3.5 w-3.5 ${achievement.unlocked ? 'text-[#FBBC05]' : 'text-[#1E1E1E]/25'}`} />
                      {achievement.label}
                    </div>
                  ))}
                </div>
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

              <button
                type="button"
                onClick={() => setShowReview(value => !value)}
                className="text-sm font-bold text-[#3186FF] transition-colors hover:text-[#1E1E1E]"
              >
                {showReview ? 'Hide answer review' : 'Review answers'}
              </button>

              {showReview && (
                <div className="w-full space-y-3 text-left">
                  {answers.map((answer, index) => {
                    const question = questions.find(item => item.id === answer.questionId);
                    if (!question) return null;
                    return (
                      <div key={answer.questionId} className="rounded-2xl border border-[#1E1E1E]/8 bg-white/55 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-[#1E1E1E]">{index + 1}. {question.question_text}</p>
                          <span className={answer.isCorrect ? 'text-[#34A853]' : 'text-[#EA4335]'}>{answer.isCorrect ? '✓' : '✗'}</span>
                        </div>
                        <p className="mt-2 text-xs text-[#1E1E1E]/55">Your answer: {question.options[answer.selectedOptionIndex] || 'No answer'}</p>
                        <p className="mt-2 text-xs leading-5 text-[#1E1E1E]/65">{question.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}

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
                  onClick={() => {
                    resetQuiz();
                    setScoreSaveState('idle');
                    setScoreSaveError(null);
                    scoreSaveStarted.current = false;
                    startSelectedQuiz();
                  }}
                  className="btn-secondary w-full !py-3.5 !text-base"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play again
                </button>
              </div>

              <p className={`text-sm ${scoreSaveState === 'error' ? 'text-[#EA4335]' : 'text-[#1E1E1E]/50'}`}>
                {scoreSaveState === 'saving' && 'Saving your score...'}
                {scoreSaveState === 'saved' && `Score saved${user ? ` for ${user.displayName || 'you'}` : ' to the leaderboard'}!`}
                {scoreSaveState === 'error' && (scoreSaveError || 'Your score could not be saved. Please try again.')}
              </p>
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
        <div className="relative mb-8 w-full max-w-3xl text-center sm:mb-10">
          {/* Floating decoration */}
          <FloatingChip style={{ top: '-10px', left: '0', animationDelay: '0s' }}>
            <span className="hidden animate-float sm:inline-block">💡</span>
          </FloatingChip>
          <FloatingChip style={{ top: '8px', right: '4px', animationDelay: '0.8s' }}>
            <span className="hidden animate-float-rev sm:inline-block">🏆</span>
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

            <p className="max-w-md px-2 font-medium text-[#1E1E1E]/60 sm:px-0">
              Test your tech and design knowledge and compete for the top spot on the leaderboard.
            </p>
          </motion.div>
        </div>

        {status === 'idle' && authLoading && (
          <div className="mb-8 h-12 w-full max-w-xs animate-pulse rounded-full bg-[#1E1E1E]/10" />
        )}

        {status === 'idle' && !authLoading && (!user || user.isAnonymous) && (
          <button
            onClick={loginWithGoogle}
            className="btn-primary mb-8 !py-3.5 !px-8 !text-base"
          >
            Sign in with Google to play
            <ArrowIcon />
          </button>
        )}

        {status === 'idle' && !authLoading && user && !user.isAnonymous && (
          <div className="mb-8 w-full max-w-xl rounded-3xl border border-[#1E1E1E]/8 bg-white/50 p-4 shadow-sm backdrop-blur sm:p-5">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#1E1E1E]/8 bg-[#3186FF]/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E1E1E]/45">Best streak</p>
                <p className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{bestStreak}</p>
              </div>
              <div className="rounded-2xl border border-[#1E1E1E]/8 bg-[#34A853]/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E1E1E]/45">Accuracy</p>
                <p className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">{currentAccuracy}%</p>
              </div>
              <div className="rounded-2xl border border-[#1E1E1E]/8 bg-[#FBBC05]/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E1E1E]/45">Daily</p>
                <p className="mt-2 text-lg font-extrabold text-[#1E1E1E]">{dailyChallenge ? 'On' : 'Off'}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-left text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/50">
                Category
                <select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value as QuestionCategory | 'all')} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[#1E1E1E] outline-none">
                  <option value="all">All categories</option>
                  <option value="world_capitals">World capitals</option>
                  <option value="geography">Geography</option>
                  <option value="landmarks">Landmarks</option>
                  <option value="history">History</option>
                  <option value="technology">Technology</option>
                </select>
              </label>
              <label className="text-left text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/50">
                Difficulty
                <select value={selectedDifficulty} onChange={event => setSelectedDifficulty(event.target.value as DifficultyLevel | 'all')} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[#1E1E1E] outline-none">
                  <option value="all">All levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
            <label className="mt-3 flex items-center gap-3 rounded-xl border border-[#3186FF]/15 bg-[#3186FF]/5 p-3 text-sm font-semibold text-[#1E1E1E]">
              <input type="checkbox" checked={dailyChallenge} onChange={event => setDailyChallenge(event.target.checked)} className="h-4 w-4 accent-[#3186FF]" />
              Daily challenge: five questions, one attempt
            </label>
            <button disabled={!questionBankReady} onClick={startSelectedQuiz} className="btn-primary mt-4 w-full !py-3.5 !text-base disabled:cursor-wait disabled:opacity-50">
              {questionBankReady ? 'Start Trivia' : 'Loading question bank...'}
              <ArrowIcon />
            </button>
          </div>
        )}

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
