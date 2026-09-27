'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/useQuizStore';
import { useTimer } from '@/hooks/useTimer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Zap,
  SplitSquareHorizontal,
  PlusCircle,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ── GDG four colour palette per option index ────────────────────────────────
const GDG_COLORS = [
  { light: 'rgba(49,134,255,0.12)', border: 'rgba(49,134,255,0.35)', dark: '#3186FF', labelBg: '#3186FF' },
  { light: 'rgba(234,67,53,0.12)',  border: 'rgba(234,67,53,0.35)',  dark: '#EA4335', labelBg: '#EA4335' },
  { light: 'rgba(251,188,5,0.12)',  border: 'rgba(251,188,5,0.35)',  dark: '#FBBC05', labelBg: '#FBBC05' },
  { light: 'rgba(52,168,83,0.12)',  border: 'rgba(52,168,83,0.35)',  dark: '#34A853', labelBg: '#34A853' },
];

// ── Difficulty badge ─────────────────────────────────────────────────────────
const DIFFICULTY_STYLES: Record<string, string> = {
  easy:   'bg-[#34A853]/10 text-[#34A853] border-[#34A853]/25',
  medium: 'bg-[#FBBC05]/10 text-[#FBBC05] border-[#FBBC05]/25',
  hard:   'bg-[#EA4335]/10 text-[#EA4335] border-[#EA4335]/25',
};

// ── Timer circle ─────────────────────────────────────────────────────────────
function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const RADIUS = 20;
  const CIRC = 2 * Math.PI * RADIUS;
  const progress = timeLeft / total;
  const danger = timeLeft <= 5;

  return (
    <div className="relative flex items-center justify-center w-16 h-16 rounded-full glass-card shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24" cy="24" r={RADIUS}
          strokeWidth="3.5"
          stroke={danger ? 'rgba(234,67,53,0.18)' : 'rgba(49,134,255,0.15)'}
          fill="transparent"
        />
        <circle
          cx="24" cy="24" r={RADIUS}
          strokeWidth="3.5"
          stroke={danger ? '#EA4335' : '#3186FF'}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className={cn(
          'absolute text-base font-bold',
          danger ? 'text-[#EA4335] animate-pulse' : 'text-[#1E1E1E]',
        )}
      >
        {timeLeft}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function QuizEngine() {
  const {
    questions,
    currentQuestionIndex,
    submitAnswer,
    nextQuestion,
    status,
    score,
    currentStreak,
    lifelines,
    useFiftyFifty,
    useAddTime,
  } = useQuizStore();

  const currentQuestion = questions[currentQuestionIndex];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  const { playCorrect, playIncorrect, playTick } = useSoundEffects();

  const handleTimeExpire = useCallback(() => {
    if (!isAnswered) handleAnswer(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered]);

  const { timeLeft, startTimer, stopTimer, resetTimer, addTime } = useTimer(
    currentQuestion?.time_limit_seconds || 15,
    handleTimeExpire,
  );

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !isAnswered) playTick();
  }, [timeLeft, isAnswered, playTick]);

  useEffect(() => {
    if (status === 'playing' && currentQuestion) {
      resetTimer(currentQuestion.time_limit_seconds);
      startTimer();
      setSelectedOption(null);
      setIsAnswered(false);
      setEliminatedOptions([]);
    }
  }, [currentQuestionIndex, status, currentQuestion, resetTimer, startTimer]);

  const handleAnswer = useCallback(
    (index: number) => {
      if (isAnswered || eliminatedOptions.includes(index)) return;
      stopTimer();
      setSelectedOption(index);
      setIsAnswered(true);

      const correct = index === currentQuestion?.correct_option_index;
      if (correct) playCorrect(); else playIncorrect();

      if (currentQuestion) {
        submitAnswer(currentQuestion.id, index, timeLeft, currentQuestion.time_limit_seconds);
      }
    },
    [isAnswered, eliminatedOptions, stopTimer, currentQuestion, playCorrect, playIncorrect, submitAnswer, timeLeft],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const map: Record<string, number> = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2, '4': 3, d: 3 };
      const idx = map[e.key.toLowerCase()];
      if (idx !== undefined && !eliminatedOptions.includes(idx)) handleAnswer(idx);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAnswer, isAnswered, eliminatedOptions]);

  const handleFiftyFifty = () => {
    if (lifelines.fiftyFiftyUsed || isAnswered || !currentQuestion) return;
    useFiftyFifty();
    const wrong = [0, 1, 2, 3]
      .filter(i => i !== currentQuestion.correct_option_index)
      .sort(() => 0.5 - Math.random());
    setEliminatedOptions([wrong[0], wrong[1]]);
  };

  const handleAddTime = () => {
    if (lifelines.addTimeUsed || isAnswered) return;
    useAddTime();
    addTime(10);
  };

  if (status !== 'playing' || !currentQuestion) return null;

  const isCorrect = selectedOption === currentQuestion.correct_option_index;
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5" aria-live="polite">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Progress + score */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Question counter */}
          <div className="glass-card px-4 py-2 flex flex-col items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#1E1E1E]/40 uppercase tracking-widest leading-none mb-0.5">Q</span>
            <span className="text-lg font-bold text-[#1E1E1E] leading-none">
              {currentQuestionIndex + 1}
              <span className="text-[#1E1E1E]/30 font-medium">/{questions.length}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="devfest-progress">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #3186FF, #6D97FF)' }}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="glass-card px-4 py-2 flex flex-col items-center relative shrink-0">
            <span className="text-[10px] font-bold text-[#1E1E1E]/40 uppercase tracking-widest leading-none mb-0.5">Score</span>
            <span className="text-lg font-bold text-[#3186FF] leading-none">{score}</span>

            <AnimatePresence>
              {currentStreak >= 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2.5 -right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black text-white"
                  style={{
                    background: 'radial-gradient(85.98% 85.98% at 50% 17.07%, #FBBC05 52%, #FFA726 100%)',
                    boxShadow: '0 0 12px rgba(251,188,5,0.7)',
                  }}
                >
                  <Zap className="w-2.5 h-2.5 fill-white" />
                  {currentStreak >= 5 ? '1.5×' : '1.2×'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Timer */}
        <TimerRing timeLeft={timeLeft} total={currentQuestion.time_limit_seconds} />
      </div>

      {/* ── Question card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="glass-card p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden"
        >
          {/* Hint emoji watermark */}
          {currentQuestion.hint_emoji && (
            <div className="absolute -right-6 -bottom-10 text-[140px] opacity-[0.07] pointer-events-none select-none blur-sm">
              {currentQuestion.hint_emoji}
            </div>
          )}

          {/* Category + difficulty */}
          <div className="flex items-center gap-2 flex-wrap relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1E1E1E]/5 text-[#1E1E1E]/60 border border-[#1E1E1E]/8 capitalize">
              {currentQuestion.category.replace(/_/g, ' ')}
            </span>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border',
              DIFFICULTY_STYLES[currentQuestion.difficulty] ?? 'bg-[#1E1E1E]/5 text-[#1E1E1E]/50 border-[#1E1E1E]/10',
            )}>
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-xl md:text-2xl font-semibold text-[#1E1E1E] leading-snug relative z-10">
            {currentQuestion.question_text}
          </h2>

          {/* Options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
            {currentQuestion.options.map((option, idx) => {
              const gdg = GDG_COLORS[idx];
              const isSelected = selectedOption === idx;
              const isCorrectOption = currentQuestion.correct_option_index === idx;
              const isEliminated = eliminatedOptions.includes(idx);

              let style: React.CSSProperties = {
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(30,30,30,0.09)',
              };

              if (isEliminated) {
                style = { background: 'rgba(30,30,30,0.02)', border: '1px solid rgba(30,30,30,0.05)' };
              } else if (!isAnswered) {
                // default — show option color accent on hover (handled via className)
              } else {
                if (isCorrectOption) {
                  style = { background: 'rgba(52,168,83,0.1)', border: '1px solid rgba(52,168,83,0.35)', boxShadow: '0 0 16px rgba(52,168,83,0.18)' };
                } else if (isSelected) {
                  style = { background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.35)', boxShadow: '0 0 16px rgba(234,67,53,0.18)' };
                } else {
                  style = { background: 'rgba(30,30,30,0.02)', border: '1px solid rgba(30,30,30,0.05)', opacity: 0.5 };
                }
              }

              return (
                <motion.button
                  key={idx}
                  disabled={isAnswered || isEliminated}
                  whileHover={!isAnswered && !isEliminated ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!isAnswered && !isEliminated ? { scale: 0.97 } : {}}
                  onClick={() => handleAnswer(idx)}
                  className={cn(
                    'relative p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5',
                    isEliminated ? 'cursor-not-allowed' : isAnswered ? 'cursor-default' : 'cursor-pointer',
                  )}
                  style={style}
                >
                  {/* Label circle */}
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl font-bold text-sm shrink-0 text-white transition-colors"
                    style={{
                      background: isAnswered && isCorrectOption
                        ? '#34A853'
                        : isAnswered && isSelected && !isCorrectOption
                        ? '#EA4335'
                        : isEliminated
                        ? 'rgba(30,30,30,0.08)'
                        : gdg.labelBg,
                    }}
                  >
                    {OPTION_LABELS[idx]}
                  </div>

                  <span className={cn(
                    'font-medium text-sm md:text-base',
                    isEliminated ? 'line-through text-[#1E1E1E]/25' : 'text-[#1E1E1E]',
                  )}>
                    {option}
                  </span>

                  {/* Result icons */}
                  {isAnswered && isCorrectOption && (
                    <CheckCircle2 className="absolute right-4 text-[#34A853] w-5 h-5" />
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <XCircle className="absolute right-4 text-[#EA4335] w-5 h-5" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Lifelines ── */}
      <AnimatePresence>
        {!isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center justify-center gap-3"
          >
            <button
              onClick={handleFiftyFifty}
              disabled={lifelines.fiftyFiftyUsed}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all',
                lifelines.fiftyFiftyUsed
                  ? 'text-[#1E1E1E]/25 border-[#1E1E1E]/10 cursor-not-allowed bg-transparent'
                  : 'text-[#8a2be2] border-[#8a2be2]/25 hover:bg-[#8a2be2]/8 bg-white/60 shadow-sm',
              )}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              50/50
            </button>

            <button
              onClick={handleAddTime}
              disabled={lifelines.addTimeUsed}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all',
                lifelines.addTimeUsed
                  ? 'text-[#1E1E1E]/25 border-[#1E1E1E]/10 cursor-not-allowed bg-transparent'
                  : 'text-[#FBBC05] border-[#FBBC05]/25 hover:bg-[#FBBC05]/8 bg-white/60 shadow-sm',
              )}
            >
              <PlusCircle className="w-4 h-4" />
              +10s
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Explanation + Next ── */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {/* Explanation card */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: isCorrect ? 'rgba(52,168,83,0.07)' : 'rgba(234,67,53,0.07)',
                border: `1px solid ${isCorrect ? 'rgba(52,168,83,0.22)' : 'rgba(234,67,53,0.22)'}`,
              }}
            >
              <h3 className="font-bold text-[#1E1E1E] flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <><CheckCircle2 className="text-[#34A853] w-5 h-5" /> Correct!</>
                ) : (
                  <><XCircle className="text-[#EA4335] w-5 h-5" /> Incorrect</>
                )}
              </h3>
              <p className="text-[#1E1E1E]/70 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>

            {/* Next button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextQuestion}
              autoFocus
              className="btn-primary w-full !py-4 !text-base focus:outline-none focus-visible:ring-3 focus-visible:ring-[#3186FF]/50"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <span className="flex h-6 w-7 items-center justify-center rounded-full bg-white/25">
                <ChevronRight className="w-4 h-4" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
