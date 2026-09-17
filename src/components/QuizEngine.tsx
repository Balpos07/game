'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/useQuizStore';
import { useTimer } from '@/hooks/useTimer';
import { CheckCircle2, XCircle, Clock, Trophy, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Simple utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizEngine() {
  const { questions, currentQuestionIndex, submitAnswer, nextQuestion, status, score } = useQuizStore();
  const currentQuestion = questions[currentQuestionIndex];
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleTimeExpire = () => {
    if (!isAnswered) {
      handleAnswer(-1); // -1 indicates timeout/no answer
    }
  };

  const { timeLeft, startTimer, stopTimer, resetTimer } = useTimer(
    currentQuestion?.time_limit_seconds || 15,
    handleTimeExpire
  );

  useEffect(() => {
    if (status === 'playing' && currentQuestion) {
      resetTimer(currentQuestion.time_limit_seconds);
      startTimer();
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [currentQuestionIndex, status, currentQuestion, resetTimer, startTimer]);

  if (status !== 'playing' || !currentQuestion) {
    return null;
  }

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    stopTimer();
    setSelectedOption(index);
    setIsAnswered(true);
    submitAnswer(currentQuestion.id, index, timeLeft, currentQuestion.time_limit_seconds);
  };

  const isCorrect = selectedOption === currentQuestion.correct_option_index;
  
  // Timer visual progress (circular approximation via strokeDashoffset)
  const timerProgress = timeLeft / currentQuestion.time_limit_seconds;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Question</span>
            <span className="text-xl font-bold text-slate-50">{currentQuestionIndex + 1} <span className="text-slate-500">/ {questions.length}</span></span>
          </div>
          
          <div className="glass-panel px-4 py-2 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Score</span>
            <span className="text-xl font-bold text-[#00f2fe]">{score}</span>
          </div>
        </div>

        {/* Circular Timer */}
        <div className="relative flex items-center justify-center w-16 h-16 glass-panel rounded-full shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              className="text-white/10"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="24"
              cy="24"
            />
            <motion.circle
              className={cn(
                "transition-colors duration-300",
                timeLeft <= 5 ? "text-[#ef4444]" : "text-[#00f2fe]"
              )}
              strokeWidth="4"
              strokeDasharray="125.6" /* 2 * pi * r (20) */
              strokeDashoffset={125.6 * (1 - timerProgress)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="20"
              cx="24"
              cy="24"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: 125.6 * (1 - timerProgress) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-lg font-bold",
              timeLeft <= 5 ? "text-[#ef4444]" : "text-slate-50"
            )}>{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-panel p-8 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
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

        <h2 className="text-2xl font-semibold leading-relaxed">
          {currentQuestion.question_text}
        </h2>

        {currentQuestion.code_snippet && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 overflow-x-auto font-mono text-sm text-[#00f2fe]">
            <pre>{currentQuestion.code_snippet}</pre>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOption = currentQuestion.correct_option_index === idx;
            
            let buttonStateStyles = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20";
            
            if (isAnswered) {
              if (isCorrectOption) {
                buttonStateStyles = "bg-[#10b981]/20 border-[#10b981]/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              } else if (isSelected && !isCorrectOption) {
                buttonStateStyles = "bg-[#ef4444]/20 border-[#ef4444]/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
              } else {
                buttonStateStyles = "bg-white/5 border-white/5 opacity-50";
              }
            }

            return (
              <motion.button
                key={idx}
                disabled={isAnswered}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
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
                <span className="font-medium text-slate-200">{option}</span>
                
                {/* Result Icons */}
                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="absolute right-4 text-[#10b981] w-6 h-6" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="absolute right-4 text-[#ef4444] w-6 h-6" />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Post-Answer Explanation Toast */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <div className={cn(
              "p-6 rounded-2xl border backdrop-blur-md shadow-lg",
              isCorrect ? "bg-[#10b981]/10 border-[#10b981]/30" : "bg-[#ef4444]/10 border-[#ef4444]/30"
            )}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                {isCorrect ? (
                  <><CheckCircle2 className="text-[#10b981]" /> Excellent!</>
                ) : (
                  <><XCircle className="text-[#ef4444]" /> Incorrect</>
                )}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextQuestion}
              className="glass-panel border-[#00f2fe]/50 bg-[#00f2fe]/10 text-[#00f2fe] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors hover:bg-[#00f2fe]/20"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
