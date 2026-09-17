'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/useQuizStore';
import { useTimer } from '@/hooks/useTimer';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { CheckCircle2, XCircle, Clock, ChevronRight, Zap, SplitSquareHorizontal, PlusCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizEngine() {
  const { 
    questions, currentQuestionIndex, submitAnswer, nextQuestion, 
    status, score, currentStreak, lifelines, useFiftyFifty, useAddTime 
  } = useQuizStore();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);

  const { playCorrect, playIncorrect, playTick } = useSoundEffects();

  const handleTimeExpire = useCallback(() => {
    if (!isAnswered) {
      handleAnswer(-1);
    }
  }, [isAnswered]);

  const { timeLeft, startTimer, stopTimer, resetTimer, addTime } = useTimer(
    currentQuestion?.time_limit_seconds || 15,
    handleTimeExpire
  );

  // Play tick sound when time is running out
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !isAnswered) {
      playTick();
    }
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

  const handleAnswer = useCallback((index: number) => {
    if (isAnswered || eliminatedOptions.includes(index)) return;
    
    stopTimer();
    setSelectedOption(index);
    setIsAnswered(true);
    
    const isCorrect = index === currentQuestion?.correct_option_index;
    if (isCorrect) playCorrect();
    else playIncorrect();

    if (currentQuestion) {
      submitAnswer(currentQuestion.id, index, timeLeft, currentQuestion.time_limit_seconds);
    }
  }, [isAnswered, eliminatedOptions, stopTimer, currentQuestion, playCorrect, playIncorrect, submitAnswer, timeLeft]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const key = e.key.toLowerCase();
      let selectedIdx = -1;
      
      if (key === '1' || key === 'a') selectedIdx = 0;
      else if (key === '2' || key === 'b') selectedIdx = 1;
      else if (key === '3' || key === 'c') selectedIdx = 2;
      else if (key === '4' || key === 'd') selectedIdx = 3;

      if (selectedIdx !== -1 && !eliminatedOptions.includes(selectedIdx)) {
        handleAnswer(selectedIdx);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer, isAnswered, eliminatedOptions]);

  const handleFiftyFifty = () => {
    if (lifelines.fiftyFiftyUsed || isAnswered || !currentQuestion) return;
    useFiftyFifty();
    
    // Pick 2 wrong answers to eliminate
    const wrongIndices = [0, 1, 2, 3].filter(i => i !== currentQuestion.correct_option_index);
    // Shuffle and pick 2
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    setEliminatedOptions([shuffled[0], shuffled[1]]);
  };

  const handleAddTime = () => {
    if (lifelines.addTimeUsed || isAnswered) return;
    useAddTime();
    addTime(10);
  };

  if (status !== 'playing' || !currentQuestion) {
    return null;
  }

  const isCorrect = selectedOption === currentQuestion.correct_option_index;
  const timerProgress = timeLeft / currentQuestion.time_limit_seconds;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 relative" aria-live="polite">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Question</span>
            <span className="text-xl font-bold text-slate-50">{currentQuestionIndex + 1} <span className="text-slate-500">/ {questions.length}</span></span>
          </div>
          
          <div className="glass-panel px-4 py-2 flex flex-col items-center justify-center relative">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Score</span>
            <span className="text-xl font-bold text-[#00f2fe]">{score}</span>
            
            {/* Combo Badge */}
            <AnimatePresence>
              {currentStreak >= 3 && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 fill-slate-950" /> {currentStreak >= 5 ? '1.5x' : '1.2x'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Circular Timer */}
        <div className="relative flex items-center justify-center w-16 h-16 glass-panel rounded-full shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle className="text-white/10" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
            <motion.circle
              className={cn("transition-colors duration-300", timeLeft <= 5 ? "text-[#ef4444]" : "text-[#00f2fe]")}
              strokeWidth="4"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 * (1 - timerProgress)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="24"
              cy="24"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-bold", timeLeft <= 5 ? "text-[#ef4444] animate-pulse" : "text-slate-50")}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-panel p-8 flex flex-col gap-6 relative overflow-hidden"
      >
        {/* Background Hint Emoji */}
        {currentQuestion.hint_emoji && (
          <div className="absolute -right-8 -bottom-12 text-[150px] opacity-10 pointer-events-none select-none blur-[2px]">
            {currentQuestion.hint_emoji}
          </div>
        )}

        <div className="flex items-center gap-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-300 capitalize border border-white/5">
            {currentQuestion.category.replace(/_/g, ' ')}
          </span>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
            currentQuestion.difficulty === 'easy' && "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30",
            currentQuestion.difficulty === 'medium' && "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
            currentQuestion.difficulty === 'hard' && "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30"
          )}>
            {currentQuestion.difficulty}
          </span>
        </div>

        <h2 className="text-2xl font-semibold leading-relaxed relative z-10">
          {currentQuestion.question_text}
        </h2>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 relative z-10">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = currentQuestion.correct_option_index === idx;
            const isEliminated = eliminatedOptions.includes(idx);
            
            let buttonStateStyles = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer";
            
            if (isEliminated) {
              buttonStateStyles = "bg-transparent border-white/5 opacity-20 cursor-not-allowed grayscale";
            } else if (isAnswered) {
              buttonStateStyles = "cursor-default ";
              if (isCorrectOption) {
                buttonStateStyles += "bg-[#10b981]/20 border-[#10b981]/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              } else if (isSelected && !isCorrectOption) {
                buttonStateStyles += "bg-[#ef4444]/20 border-[#ef4444]/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
              } else {
                buttonStateStyles += "bg-white/5 border-white/5 opacity-50";
              }
            }

            return (
              <motion.button
                key={idx}
                disabled={isAnswered || isEliminated}
                whileHover={!isAnswered && !isEliminated ? { scale: 1.02 } : {}}
                whileTap={!isAnswered && !isEliminated ? { scale: 0.98 } : {}}
                onClick={() => handleAnswer(idx)}
                className={cn(
                  "relative p-4 rounded-xl border text-left transition-all duration-300 flex items-center gap-4",
                  buttonStateStyles
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0",
                  isAnswered && isCorrectOption ? "bg-[#10b981] text-white" :
                  isAnswered && isSelected && !isCorrectOption ? "bg-[#ef4444] text-white" :
                  "bg-white/10 text-slate-300"
                )}>
                  {OPTION_LABELS[idx]}
                </div>
                <span className={cn("font-medium", isEliminated ? "line-through text-slate-500" : "text-slate-200")}>
                  {option}
                </span>
                
                {/* Result Icons */}
                {isAnswered && isCorrectOption && <CheckCircle2 className="absolute right-4 text-[#10b981] w-6 h-6" />}
                {isAnswered && isSelected && !isCorrectOption && <XCircle className="absolute right-4 text-[#ef4444] w-6 h-6" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Lifelines UI */}
      <AnimatePresence>
        {!isAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-4 mt-2"
          >
            <button 
              onClick={handleFiftyFifty}
              disabled={lifelines.fiftyFiftyUsed}
              className={cn(
                "px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 border transition-all",
                lifelines.fiftyFiftyUsed ? "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed" : "bg-[#8a2be2]/10 text-[#8a2be2] border-[#8a2be2]/30 hover:bg-[#8a2be2]/20"
              )}
            >
              <SplitSquareHorizontal className="w-4 h-4" /> 50/50
            </button>
            <button 
              onClick={handleAddTime}
              disabled={lifelines.addTimeUsed}
              className={cn(
                "px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 border transition-all",
                lifelines.addTimeUsed ? "bg-white/5 text-slate-500 border-white/5 cursor-not-allowed" : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30 hover:bg-[#f59e0b]/20"
              )}
            >
              <PlusCircle className="w-4 h-4" /> +10s
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Answer Explanation Toast */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="flex flex-col gap-4 overflow-hidden mt-4"
          >
            <div className={cn(
              "p-6 rounded-2xl border backdrop-blur-md shadow-lg",
              isCorrect ? "bg-[#10b981]/10 border-[#10b981]/30" : "bg-[#ef4444]/10 border-[#ef4444]/30"
            )}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                {isCorrect ? <><CheckCircle2 className="text-[#10b981]" /> Excellent!</> : <><XCircle className="text-[#ef4444]" /> Incorrect</>}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextQuestion}
              className="glass-panel border-[#00f2fe]/50 bg-[#00f2fe]/10 text-[#00f2fe] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors hover:bg-[#00f2fe]/20 focus:outline-none focus:ring-2 focus:ring-[#00f2fe]"
              autoFocus
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question (Press Enter)'}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
