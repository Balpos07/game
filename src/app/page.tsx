'use client';

import React, { useEffect } from 'react';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import { Question } from '@/types/quiz';
import { Trophy } from 'lucide-react';

const DEMO_QUESTIONS: Question[] = [
  {
    id: '1',
    category: 'code_and_dev',
    difficulty: 'easy',
    question_text: 'Which array method adds an element to the end of an array in JavaScript?',
    code_snippet: 'const arr = [1, 2, 3];\n// Add 4 to the end',
    options: ['arr.unshift(4)', 'arr.push(4)', 'arr.pop()', 'arr.concat(4)'],
    correct_option_index: 1,
    explanation: 'The push() method adds one or more elements to the end of an array and returns the new length of the array.',
    time_limit_seconds: 15,
  },
  {
    id: '2',
    category: 'design_and_ui',
    difficulty: 'medium',
    question_text: 'In CSS Grid, which property is used to define the size of columns?',
    options: ['grid-template-rows', 'grid-auto-flow', 'grid-template-columns', 'grid-column-gap'],
    correct_option_index: 2,
    explanation: 'The grid-template-columns property specifies the line names and track sizing functions of the grid columns.',
    time_limit_seconds: 15,
  },
  {
    id: '3',
    category: 'code_and_dev',
    difficulty: 'hard',
    question_text: 'What will the following React code log to the console when clicked?',
    code_snippet: 'const [count, setCount] = useState(0);\n\nconst handleClick = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n  console.log(count);\n};',
    options: ['0', '1', '3', 'undefined'],
    correct_option_index: 0,
    explanation: 'React state updates are asynchronous and batched. The console.log runs before the state actually updates in the next render cycle, so it logs the current state which is 0.',
    time_limit_seconds: 20,
  }
];

export default function Home() {
  const { startQuiz, status, score, correctAnswersCount, questions, resetQuiz } = useQuizStore();

  useEffect(() => {
    // Only start if not already playing or finished
    if (status === 'idle') {
      startQuiz(DEMO_QUESTIONS);
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
            onClick={() => { resetQuiz(); startQuiz(DEMO_QUESTIONS); }}
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
          TechPulse Trivia
        </h1>
        <p className="text-slate-400 mt-2">Daily Challenge #42</p>
      </div>
      
      <QuizEngine />
    </main>
  );
}
