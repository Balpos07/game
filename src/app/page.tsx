'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/store/useQuizStore';
import QuizEngine from '@/components/QuizEngine';
import type { DifficultyLevel, Question, QuestionCategory } from '@/types/quiz';
import { Trophy, Share2, Check, Sparkles, RotateCcw, LockKeyhole, MapPin } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import confetti from 'canvas-confetti';
import { ChallengeResults } from '@/components/SocialHub';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';

import { useQuestionBank } from '@/hooks/useQuestionBank';
import { trackGameEvent } from '@/lib/gameEvents';
import {
  calculateRoundRewards,
  calculateRoundXp,
  getLocalDateKey,
  getPreviousLocalDateKey,
  PLAYER_AVATARS,
  XP_PER_LEVEL,
  type RunType,
} from '@/lib/playerProgress';
import { DAILY_MISSIONS, getWeeklyEvent, STORY_QUESTS, TRIVIA_LOCATIONS } from '@/lib/gameContent';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const rawText = await response.text();
  if (!rawText.trim()) {
    if (!response.ok) throw new Error(fallbackMessage);
    return {} as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    if (!response.ok) throw new Error(fallbackMessage);
    throw new Error('The server returned an unexpected response.');
  }
}

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
  const { startQuiz, status, score, correctAnswersCount, questions, answers, bestStreak, resetQuiz, competition } =
    useQuizStore();
  const { playFinished } = useSoundEffects();
  const [copied, setCopied] = useState(false);
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const { progress: playerProgress, setProgress: setPlayerProgress, ready: playerProgressReady, error: progressError, cloudConnected } =
    usePlayerProgress(user && !user.isAnonymous ? user.uid : null, authLoading);
  const [scoreSaveState, setScoreSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [scoreSaveError, setScoreSaveError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('nigerian_culture');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [dailyChallenge, setDailyChallenge] = useState(false);
  const [activeRun, setActiveRun] = useState<{ type: RunType; id: string }>({ type: 'standard', id: '' });
  const [completedRunXp, setCompletedRunXp] = useState<number | null>(null);
  const [dateKey, setDateKey] = useState('');
  const { questions: quizQuestionBank, ready: questionBankReady } = useQuestionBank();
  const scoreSaveStarted = useRef(false);
  const progressAwarded = useRef(false);
  const finishEffectsStarted = useRef(false);
  const playerLevel = Math.floor(playerProgress.xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = playerProgress.xp % XP_PER_LEVEL;
  const todayKey = dateKey || getLocalDateKey(new Date());
  const previousDayKey = getPreviousLocalDateKey(new Date(`${todayKey}T12:00:00`));
  const currentWeeklyEvent = getWeeklyEvent(new Date(`${todayKey}T12:00:00`));
  const dailyMissionsComplete = playerProgress.dailyMissionDate === todayKey
    ? playerProgress.completedDailyMissionIds
    : [];
  const lastPlayedWasYesterday = playerProgress.lastPlayedDate === previousDayKey;
  const visibleDailyStreak = playerProgress.lastPlayedDate === todayKey || lastPlayedWasYesterday
    ? playerProgress.currentDailyStreak
    : 0;
  const nextStoryQuest = STORY_QUESTS.find((quest, index) => (
    !playerProgress.completedStoryQuestIds.includes(quest.id) &&
    playerLevel >= quest.requiredLevel &&
    (index === 0 || playerProgress.completedStoryQuestIds.includes(STORY_QUESTS[index - 1].id))
  ));
  const completedEventThisWeek = playerProgress.completedEventWeek === currentWeeklyEvent.weekKey
    && playerProgress.completedEventId === currentWeeklyEvent.event.id;
  const runContext = useRef({
    playerProgress,
    activeRun,
    weekKey: currentWeeklyEvent.weekKey,
    today: todayKey,
    questions,
    answers,
    correctAnswersCount,
    bestStreak,
  });
  useEffect(() => {
    runContext.current = {
      playerProgress,
      activeRun,
      weekKey: currentWeeklyEvent.weekKey,
      today: todayKey,
      questions,
      answers,
      correctAnswersCount,
      bestStreak,
    };
  }, [playerProgress, activeRun, currentWeeklyEvent.weekKey, todayKey, questions, answers, correctAnswersCount, bestStreak]);
  const selectedLocation = TRIVIA_LOCATIONS.find(location => location.category === selectedCategory);
  const selectedQuestionCount = quizQuestionBank.filter(question => (
    (selectedCategory === 'all' || question.category === selectedCategory) &&
    (selectedDifficulty === 'all' || question.difficulty === selectedDifficulty)
  )).length;
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

  const startSelectedQuiz = () => {
    if (!questionBankReady || !playerProgressReady) return;
    if (!TRIVIA_LOCATIONS.some(location => location.category === selectedCategory && playerLevel >= location.requiredLevel)) return;
    const filteredQuestions = quizQuestionBank.filter(question => (
      (selectedCategory === 'all' || question.category === selectedCategory) &&
      (selectedDifficulty === 'all' || question.difficulty === selectedDifficulty)
    ));
    const dateSeed = todayKey;
    const quizQuestions = dailyChallenge
      ? shuffleQuestions(filteredQuestions, `${dateSeed}:${selectedCategory}`).slice(0, 5)
      : shuffleQuestions(filteredQuestions);
    if (quizQuestions.length > 0) {
      progressAwarded.current = false;
      finishEffectsStarted.current = false;
      setCompletedRunXp(null);
      setActiveRun(dailyChallenge ? { type: 'daily', id: dateSeed } : { type: 'standard', id: '' });
      trackGameEvent('round_started', selectedCategory);
      startQuiz(quizQuestions);
    }
  };

  const startSpecialRun = (category: QuestionCategory, type: Exclude<RunType, 'standard'>, id: string, seed: string) => {
    if (!questionBankReady || !playerProgressReady) return;
    const matchingQuestions = quizQuestionBank.filter(question => question.category === category);
    const selectedQuestions = shuffleQuestions(matchingQuestions, seed).slice(0, 5);
    if (selectedQuestions.length === 0) return;
    progressAwarded.current = false;
    finishEffectsStarted.current = false;
    setCompletedRunXp(null);
    setDailyChallenge(false);
    setSelectedCategory(category);
    setActiveRun({ type, id });
    trackGameEvent('round_started', category);
    startQuiz(selectedQuestions);
  };

  const replayCurrentRun = () => {
    if (activeRun.type === 'event') {
      startSpecialRun(currentWeeklyEvent.event.category, 'event', activeRun.id, currentWeeklyEvent.weekKey);
      return;
    }
    if (activeRun.type === 'story') {
      const quest = STORY_QUESTS.find(item => item.id === activeRun.id);
      if (quest) startSpecialRun(quest.category, 'story', quest.id, `${todayKey}:${quest.id}`);
      return;
    }
    startSelectedQuiz();
  };

  useEffect(() => {
    const updateDate = () => setDateKey(getLocalDateKey(new Date()));
    const timeoutId = window.setTimeout(updateDate, 0);
    const intervalId = window.setInterval(updateDate, 60_000);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'finished' && !finishEffectsStarted.current) {
      finishEffectsStarted.current = true;
      if (playerProgressReady && !progressAwarded.current) {
        progressAwarded.current = true;
        const run = runContext.current;
        const rewards = calculateRoundRewards(run.playerProgress, {
          ...run.activeRun,
          weekKey: run.weekKey,
          today: run.today,
          previousDay: getPreviousLocalDateKey(new Date()),
          correctAnswers: run.correctAnswersCount,
          totalQuestions: run.questions.length,
          bestQuestionStreak: run.bestStreak,
          answers: run.answers,
          questions: run.questions,
        });
        setCompletedRunXp(rewards.xpEarned);
        setPlayerProgress(rewards.progress);
      }
      playFinished();
      trackGameEvent('round_completed', runContext.current.questions[0]?.category || 'mixed');

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
  }, [status, startQuiz, playFinished, playerProgressReady, setPlayerProgress]);

  useEffect(() => {
    if (status !== 'finished' || authLoading || scoreSaveStarted.current || !user || user.isAnonymous) return;

    scoreSaveStarted.current = true;
    setScoreSaveState('saving');
    setScoreSaveError(null);

    const saveScore = async () => {
      const currentUser = getFirebaseAuth()?.currentUser;
      if (!currentUser) throw new Error('Sign in again to submit your verified score.');
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          answers: answers.map(answer => ({
            questionId: answer.questionId,
            selectedOptionIndex: answer.selectedOptionIndex,
          })),
          ...(competition?.challengeId ? { challengeId: competition.challengeId } : {}),
        }),
      });
      const result = await readJsonResponse<{ error?: string }>(response, 'Unable to submit this score.');
      if (!response.ok) throw new Error(result.error || 'Unable to submit this score.');
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
  }, [status, authLoading, user, answers, competition?.challengeId]);

  // ── Share ──────────────────────────────────────────────────────────────────
  const generateShareText = () => {
    const header = `🏆 DN'V Naija Trivia\nScore: ${score} (${correctAnswersCount}/${questions.length} correct)\n`;
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
        context.fillText("DN'V Naija Trivia", 72, 92);
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
  const xpEarnedThisRound = completedRunXp ?? calculateRoundXp(correctAnswersCount, questions.length);
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

        <main className="flex w-full flex-1 flex-col items-center justify-start gap-8 px-4 py-8 sm:px-6 md:px-8 md:py-12">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="glass-card flex w-full max-w-7xl flex-col items-center gap-6 p-5 text-center sm:p-8 md:p-12"
            >
              {/* Trophy burst */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse-ring"
                  style={{ background: 'radial-gradient(85.98% 85.98% at 50% 17.07%, #3186FF 52%, #6D97FF 76%, #A9A8FF 100%)' }}>
                  <Trophy className="w-9 h-9 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-[#1E1E1E]">Challenge complete! {emoji}</h1>
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

              <div className="flex w-full items-start gap-3 rounded-2xl border border-[#34A853]/20 bg-[#34A853]/8 p-4 text-left">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl">{playerProgress.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-extrabold text-[#1E1E1E]">+{xpEarnedThisRound} explorer XP</p>
                  <p className="mt-0.5 break-words text-xs leading-5 text-[#1E1E1E]/55">
                    Level {playerLevel} · {xpIntoLevel}/{XP_PER_LEVEL} XP to your next level
                  </p>
                  <p className="mt-1 break-words text-xs font-semibold text-[#277D3E]">
                    {activeRun.type === 'story' && percentage >= 60 && 'Story chapter complete! +25 XP included.'}
                    {activeRun.type === 'story' && percentage < 60 && 'Get 60% or more to complete this story chapter.'}
                    {activeRun.type === 'event' && 'Weekly spotlight rewards included when earned.'}
                    {activeRun.type !== 'story' && activeRun.type !== 'event' && 'Daily mission and streak rewards included when earned.'}
                  </p>
                </div>
                <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#34A853]" aria-hidden="true" />
              </div>

              {(competition?.challengeId || competition?.shareCode) && (
                <div className="grid w-full min-w-0 gap-3 text-left md:grid-cols-2">
                  <ChallengeResults challengeId={competition?.challengeId ?? null} refreshToken={scoreSaveState} />
                  {competition?.shareCode && (
                    <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-[#3186FF]/15 bg-[#3186FF]/5 p-4">
                      <span className="text-sm font-semibold leading-6 text-[#1E1E1E]/65">Invite a friend to this same round with code</span>
                      <strong className="mt-1 break-all font-extrabold tracking-wider text-[#3186FF]">{competition.shareCode}</strong>
                    </div>
                  )}
                </div>
              )}

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
                    replayCurrentRun();
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
                {scoreSaveState === 'idle' && user && !user.isAnonymous && 'Your score is ready to save.'}
                {scoreSaveState === 'idle' && (!user || user.isAnonymous) && 'Nice run! Sign in if you want your score on the leaderboard.'}
              </p>
              {scoreSaveState === 'idle' && isFirebaseConfigured() && (!user || user.isAnonymous) && (
                <button type="button" onClick={loginWithGoogle} className="text-sm font-bold text-[#3186FF] transition-colors hover:text-[#1E1E1E]">
                  Sign in to save your score
                </button>
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    );
  }

  // ── Game screen ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 md:px-8 md:py-12">
        {/* Hero header */}
        <div className="relative mb-8 w-full max-w-7xl text-center sm:mb-10">
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
            Explore the city, take on daily missions, and see how long you can keep your trivia streak alive.
            </p>
          </motion.div>
        </div>

        {status === 'idle' && (
        <section className="mb-8 w-full max-w-7xl overflow-hidden rounded-[2rem] border border-[#1E1E1E]/8 bg-white/70 shadow-[0_20px_60px_rgba(30,30,30,0.08)] backdrop-blur-xl">
          <div className="africa-hero px-6 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute -right-6 -top-12 h-44 w-44 rounded-full border-[24px] border-white/5" />
            <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-[#34A853]/20 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B8F4C8]">Naija knowledge, your way</p>
              <h2 className="mt-2 max-w-3xl text-2xl font-extrabold leading-tight sm:text-3xl">Pick a challenge. Show what you know.</h2>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/85">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">🇳🇬 Nigerian culture</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">⚡ Quick rounds</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">🏆 Live leaderboard</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6 rounded-2xl border border-[#1E1E1E]/8 bg-white/80 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#34A853]/10 text-3xl" aria-label={`Your avatar: ${playerProgress.avatar}`}>
                  {playerProgress.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold text-[#1E1E1E]">Level {playerLevel} explorer</p>
                    <p className="shrink-0 text-xs font-bold text-[#3186FF]">{playerProgress.xp.toLocaleString()} XP</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1E1E1E]/8" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpIntoLevel}>
                    <div className="h-full rounded-full bg-gradient-to-r from-[#34A853] to-[#85D99B] transition-all" style={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#1E1E1E]/50">{XP_PER_LEVEL - xpIntoLevel} XP to level {playerLevel + 1}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Choose your avatar</span>
                {PLAYER_AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    aria-label={`Choose ${avatar} avatar`}
                    aria-pressed={playerProgress.avatar === avatar}
                    disabled={!playerProgressReady}
                    onClick={() => setPlayerProgress(progress => ({ ...progress, avatar }))}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition disabled:cursor-wait disabled:opacity-50 ${playerProgress.avatar === avatar ? 'border-[#3186FF] bg-[#3186FF]/10 ring-2 ring-[#3186FF]/20' : 'border-[#1E1E1E]/8 bg-white hover:bg-[#1E1E1E]/5'}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Explore the map</p>
                <h3 className="mt-1 text-lg font-extrabold text-[#1E1E1E]">Choose a trivia spot</h3>
              </div>
              <span className="text-xs font-semibold text-[#1E1E1E]/45">Earn XP to unlock more</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {TRIVIA_LOCATIONS.map(location => {
                const locked = playerLevel < location.requiredLevel;
                const questionCount = quizQuestionBank.filter(question => (
                  location.category === 'all' || question.category === location.category
                )).length;
                const selected = selectedCategory === location.category;
                const unavailable = !locked && questionBankReady && questionCount === 0;
                return (
                  <button
                    key={location.name}
                    type="button"
                    disabled={locked || unavailable}
                    onClick={() => setSelectedCategory(location.category)}
                    aria-pressed={selected}
                    className={`relative flex min-h-36 flex-col items-start overflow-hidden rounded-2xl border p-4 pt-14 text-left transition ${selected ? 'border-[#3186FF]/50 bg-[#3186FF]/8 ring-2 ring-[#3186FF]/15' : locked ? 'cursor-not-allowed border-[#1E1E1E]/6 bg-[#1E1E1E]/3 opacity-65' : 'border-[#1E1E1E]/8 bg-white/80 hover:-translate-y-0.5 hover:border-[#34A853]/35 hover:shadow-md'}`}
                  >
                    <span className="absolute inset-x-0 top-0 h-11" style={{ background: location.background }} aria-hidden="true" />
                    <span className="absolute left-4 top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-xl backdrop-blur-sm" aria-hidden="true">{location.emoji}</span>
                    <span className="absolute right-4 top-3 text-xs font-bold tracking-wider text-white/90" aria-hidden="true">{location.scenery}</span>
                    <span className="relative z-10 min-w-0">
                      <span className="flex items-center gap-1.5 font-extrabold text-[#1E1E1E]">
                        {location.name}
                        {locked && <LockKeyhole className="h-3.5 w-3.5 text-[#1E1E1E]/40" />}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#1E1E1E]/55">{locked ? `Unlock at level ${location.requiredLevel}` : unavailable ? 'New questions coming soon' : location.description}</span>
                      {!locked && !unavailable && <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-[#34A853]">{questionCount} questions</span>}
                    </span>
                    {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-[#3186FF]" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section aria-labelledby="daily-missions-heading" className="rounded-2xl border border-[#1E1E1E]/8 bg-[#FFFCF4] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#A96B0C]">Fresh every day</p>
                    <h4 id="daily-missions-heading" className="mt-1 text-lg font-extrabold text-[#1E1E1E]">Today’s missions</h4>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                    <p className="text-lg font-extrabold text-[#1E1E1E]">🔥 {visibleDailyStreak}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]/45">day streak · best {playerProgress.bestDailyStreak}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {DAILY_MISSIONS.map(mission => {
                    const complete = dailyMissionsComplete.includes(mission.id);
                    return (
                      <div key={mission.id} className={`flex items-center gap-3 rounded-xl border p-3 ${complete ? 'border-[#34A853]/20 bg-[#34A853]/6' : 'border-[#1E1E1E]/6 bg-white/75'}`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${complete ? 'bg-[#34A853] text-white' : 'bg-[#1E1E1E]/5 text-[#1E1E1E]/35'}`} aria-hidden="true">
                          {complete ? '✓' : '○'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm font-bold ${complete ? 'text-[#277D3E]' : 'text-[#1E1E1E]'}`}>{mission.title}</span>
                          <span className="mt-0.5 block text-xs text-[#1E1E1E]/55">{mission.description}</span>
                        </span>
                        <span className="shrink-0 text-xs font-extrabold text-[#A96B0C]">+{mission.rewardXp} XP</span>
                      </div>
                    );
                  })}
                  <div className={`flex items-center gap-3 rounded-xl border p-3 ${dailyMissionsComplete.includes('daily-five') ? 'border-[#34A853]/20 bg-[#34A853]/6' : 'border-[#1E1E1E]/6 bg-white/75'}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${dailyMissionsComplete.includes('daily-five') ? 'bg-[#34A853] text-white' : 'bg-[#1E1E1E]/5 text-[#1E1E1E]/35'}`} aria-hidden="true">
                      {dailyMissionsComplete.includes('daily-five') ? '✓' : '○'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#1E1E1E]">Daily five</span>
                      <span className="mt-0.5 block text-xs text-[#1E1E1E]/55">Finish today’s five-question challenge.</span>
                    </span>
                    <span className="shrink-0 text-xs font-extrabold text-[#A96B0C]">+10 XP</span>
                  </div>
                </div>
              </section>

              <section aria-labelledby="weekly-event-heading" className="relative overflow-hidden rounded-2xl p-5 text-white sm:p-6" style={{ background: currentWeeklyEvent.event.category === 'technology' ? 'linear-gradient(145deg, #133C64, #247FB6 65%, #6BC7C5)' : currentWeeklyEvent.event.category === 'history' ? 'linear-gradient(145deg, #402454, #765394 65%, #C69176)' : 'linear-gradient(145deg, #164E37, #28784F 65%, #E8A64B)' }}>
                <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full border-[22px] border-white/10" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">This week’s spotlight</p>
                      <h4 id="weekly-event-heading" className="mt-1 text-xl font-extrabold">{currentWeeklyEvent.event.title}</h4>
                    </div>
                    <span className="text-3xl" aria-hidden="true">{currentWeeklyEvent.event.emoji}</span>
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">{currentWeeklyEvent.event.description}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold">
                      {completedEventThisWeek ? 'Completed this week ✓' : '5 questions · +20 event XP'}
                    </span>
                    <span className="text-[11px] font-semibold text-white/70">New event every Monday</span>
                  </div>
                  <button
                    type="button"
                    disabled={!questionBankReady || !playerProgressReady || quizQuestionBank.filter(question => question.category === currentWeeklyEvent.event.category).length < 5}
                    onClick={() => startSpecialRun(currentWeeklyEvent.event.category, 'event', currentWeeklyEvent.event.id, currentWeeklyEvent.weekKey)}
                    className="mt-4 w-full rounded-xl border border-white/25 bg-white px-4 py-3 text-sm font-extrabold text-[#1E1E1E] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {completedEventThisWeek ? 'Play spotlight again' : 'Enter weekly event'}
                  </button>
                </div>
              </section>
            </div>

            <section aria-labelledby="story-quests-heading" className="mt-4 rounded-2xl border border-[#1E1E1E]/8 bg-[#F7F5FC] p-4 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#765394]">A story in short chapters</p>
                  <h4 id="story-quests-heading" className="mt-1 text-lg font-extrabold text-[#1E1E1E]">Your Lagos journey</h4>
                </div>
                <span className="text-xs font-semibold text-[#1E1E1E]/50">{playerProgress.completedStoryQuestIds.length}/{STORY_QUESTS.length} chapters complete</span>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {STORY_QUESTS.map((quest, index) => {
                  const complete = playerProgress.completedStoryQuestIds.includes(quest.id);
                  const previousComplete = index === 0 || playerProgress.completedStoryQuestIds.includes(STORY_QUESTS[index - 1].id);
                  const locked = !complete && (!previousComplete || playerLevel < quest.requiredLevel);
                  const questionCount = quizQuestionBank.filter(question => question.category === quest.category).length;
                  return (
                    <article key={quest.id} className={`rounded-xl border p-4 ${complete ? 'border-[#34A853]/25 bg-white' : locked ? 'border-[#1E1E1E]/6 bg-white/55 opacity-70' : 'border-[#765394]/20 bg-white'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl" aria-hidden="true">{quest.emoji}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#765394]">Chapter {index + 1}</span>
                      </div>
                      <h5 className="mt-3 font-extrabold text-[#1E1E1E]">{quest.title}</h5>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#765394]">{quest.location}</p>
                      <p className="mt-2 min-h-12 text-xs leading-5 text-[#1E1E1E]/55">{quest.description}</p>
                      <button
                        type="button"
                        disabled={locked || !questionBankReady || !playerProgressReady || questionCount < 5}
                        onClick={() => startSpecialRun(quest.category, 'story', quest.id, `${todayKey}:${quest.id}`)}
                        className="mt-3 w-full rounded-lg border border-[#765394]/20 bg-[#765394]/8 px-3 py-2 text-xs font-extrabold text-[#53366B] transition hover:bg-[#765394]/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {complete ? 'Replay chapter' : locked ? `Unlock at level ${quest.requiredLevel}` : 'Play chapter'}
                      </button>
                    </article>
                  );
                })}
              </div>
              {nextStoryQuest && (
                <p className="mt-3 text-xs font-semibold text-[#765394]">
                  Next up: {nextStoryQuest.title} · Earn at least 60% to complete a chapter and earn 25 XP.
                </p>
              )}
            </section>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-left text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/50">
                Pick a level
                <select value={selectedDifficulty} onChange={event => setSelectedDifficulty(event.target.value as DifficultyLevel | 'all')} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white px-3 py-3 text-sm font-semibold normal-case tracking-normal text-[#1E1E1E] outline-none focus:border-[#3186FF]/50 focus:ring-2 focus:ring-[#3186FF]/15">
                  <option value="all">Any difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <div className="flex items-end rounded-xl border border-[#1E1E1E]/8 bg-white/60 px-3 py-3 text-sm font-semibold text-[#1E1E1E]/65">
                <MapPin className="mr-2 h-4 w-4 shrink-0 text-[#34A853]" />
                {selectedLocation?.name || 'Choose a location'}
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[#FBBC05]/30 bg-[#FBBC05]/10 p-4 text-sm font-semibold text-[#1E1E1E]">
              <input type="checkbox" checked={dailyChallenge} onChange={event => setDailyChallenge(event.target.checked)} className="h-4 w-4 accent-[#3186FF]" />
              <span className="flex-1">Daily challenge <span className="block pt-0.5 text-xs font-medium text-[#1E1E1E]/55">Five questions, refreshed each day</span></span>
              <span aria-hidden="true" className="text-2xl">🌞</span>
            </label>

            <button disabled={!playerProgressReady || !questionBankReady || selectedQuestionCount === 0 || (dailyChallenge && selectedQuestionCount < 5)} onClick={startSelectedQuiz} className="btn-primary mt-4 w-full !py-4 !text-base disabled:cursor-wait disabled:opacity-50">
              {!questionBankReady ? 'Loading questions...' : dailyChallenge && selectedQuestionCount < 5 ? 'Choose a selection with 5 questions' : selectedQuestionCount === 0 ? 'No questions for this selection' : dailyChallenge ? 'Start today’s challenge' : 'Start playing'}
              <ArrowIcon />
            </button>
            <p className="mt-3 text-center text-xs text-[#1E1E1E]/50">
              {selectedQuestionCount} questions available · Finish a round to earn XP
            </p>
            {user && !user.isAnonymous && cloudConnected && (
              <p className="mt-2 text-center text-xs font-semibold text-[#277D3E]">Progress synced to your account.</p>
            )}
            {(!user || user.isAnonymous) && isFirebaseConfigured() && (
              <button type="button" onClick={loginWithGoogle} className="mt-3 block w-full text-center text-xs font-bold text-[#3186FF] hover:underline">
                Sign in to sync progress between devices
              </button>
            )}
            {progressError && <p role="status" className="mt-2 text-center text-xs text-[#EA4335]">{progressError}</p>}
            <Link href="/compete" className="mt-5 flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[#3186FF]/20 bg-[#3186FF]/5 px-4 py-3 text-sm font-bold text-[#1E1E1E] transition hover:bg-[#3186FF]/10">
              <span>Want to play with friends or join a crew?</span>
              <span className="shrink-0 text-[#3186FF]">Explore competition →</span>
            </Link>
            <div className="mt-5 border-t border-[#1E1E1E]/8 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Explorer badges</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: 'First trip', unlocked: playerProgress.gamesPlayed >= 1 },
                  { label: 'Quick learner', unlocked: playerProgress.bestAccuracy >= 80 },
                  { label: 'Streak starter', unlocked: playerProgress.bestStreak >= 3 },
                ].map(badge => (
                  <span key={badge.label} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${badge.unlocked ? 'border-[#FBBC05]/35 bg-[#FBBC05]/10 text-[#725000]' : 'border-[#1E1E1E]/8 bg-white/60 text-[#1E1E1E]/35'}`}>
                    {badge.unlocked ? '🏅 ' : '🔒 '}{badge.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Quiz engine */}
        <QuizEngine />

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


