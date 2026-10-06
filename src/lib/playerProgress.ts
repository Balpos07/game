export const PLAYER_PROGRESS_KEY = 'dnv-trivia-player-progress';
export const XP_PER_LEVEL = 250;
export const XP_PER_CORRECT_ANSWER = 5;
export const XP_ROUND_COMPLETION_BONUS = 10;
export const XP_PERFECT_ROUND_BONUS = 15;
export const PLAYER_AVATARS = ['🇳🇬', '🦁', '⚽', '🎧', '🎮', '🌟'] as const;

export type PlayerProgress = {
  xp: number;
  gamesPlayed: number;
  bestAccuracy: number;
  bestStreak: number;
  avatar: string;
  currentDailyStreak: number;
  bestDailyStreak: number;
  lastPlayedDate: string;
  dailyMissionDate: string;
  completedDailyMissionIds: string[];
  completedStoryQuestIds: string[];
  completedEventId: string;
  completedEventWeek: string;
};

export type RunType = 'standard' | 'daily' | 'event' | 'story';

export type RoundAnswer = { questionId: string; isCorrect: boolean };
export type RoundQuestion = { id: string; category: string };

export const DEFAULT_PLAYER_PROGRESS: PlayerProgress = {
  xp: 0,
  gamesPlayed: 0,
  bestAccuracy: 0,
  bestStreak: 0,
  avatar: PLAYER_AVATARS[0],
  currentDailyStreak: 0,
  bestDailyStreak: 0,
  lastPlayedDate: '',
  dailyMissionDate: '',
  completedDailyMissionIds: [],
  completedStoryQuestIds: [],
  completedEventId: '',
  completedEventWeek: '',
};

export function parsePlayerProgress(value: unknown): PlayerProgress {
  if (!value || typeof value !== 'object') throw new Error('Saved player progress is not an object.');
  const progress = value as Partial<PlayerProgress>;
  const currentDailyStreak = progress.currentDailyStreak ?? 0;
  const bestDailyStreak = progress.bestDailyStreak ?? 0;
  const lastPlayedDate = progress.lastPlayedDate ?? '';
  const dailyMissionDate = progress.dailyMissionDate ?? '';
  const completedDailyMissionIds = progress.completedDailyMissionIds ?? [];
  const completedStoryQuestIds = progress.completedStoryQuestIds ?? [];
  const completedEventId = progress.completedEventId ?? '';
  const completedEventWeek = progress.completedEventWeek ?? '';
  if (
    typeof progress.xp !== 'number' || !Number.isFinite(progress.xp) || progress.xp < 0 ||
    typeof progress.gamesPlayed !== 'number' || !Number.isFinite(progress.gamesPlayed) || progress.gamesPlayed < 0 ||
    typeof progress.bestAccuracy !== 'number' || !Number.isFinite(progress.bestAccuracy) || progress.bestAccuracy < 0 || progress.bestAccuracy > 100 ||
    typeof progress.bestStreak !== 'number' || !Number.isFinite(progress.bestStreak) || progress.bestStreak < 0 ||
    typeof progress.avatar !== 'string' || !PLAYER_AVATARS.includes(progress.avatar as typeof PLAYER_AVATARS[number]) ||
    typeof currentDailyStreak !== 'number' || !Number.isFinite(currentDailyStreak) || currentDailyStreak < 0 ||
    typeof bestDailyStreak !== 'number' || !Number.isFinite(bestDailyStreak) || bestDailyStreak < 0 ||
    typeof lastPlayedDate !== 'string' ||
    typeof dailyMissionDate !== 'string' ||
    !Array.isArray(completedDailyMissionIds) || !completedDailyMissionIds.every(id => typeof id === 'string') ||
    !Array.isArray(completedStoryQuestIds) || !completedStoryQuestIds.every(id => typeof id === 'string') ||
    typeof completedEventId !== 'string' ||
    typeof completedEventWeek !== 'string'
  ) {
    throw new Error('Saved player progress contains invalid values.');
  }
  return {
    xp: progress.xp,
    gamesPlayed: progress.gamesPlayed,
    bestAccuracy: progress.bestAccuracy,
    bestStreak: progress.bestStreak,
    avatar: progress.avatar,
    currentDailyStreak,
    bestDailyStreak,
    lastPlayedDate,
    dailyMissionDate,
    completedDailyMissionIds,
    completedStoryQuestIds,
    completedEventId,
    completedEventWeek,
  };
}

export function mergePlayerProgress(local: PlayerProgress, account: PlayerProgress): PlayerProgress {
  const latest = local.lastPlayedDate > account.lastPlayedDate ? local : account;
  const dailyProgress = local.dailyMissionDate > account.dailyMissionDate ? local
    : account.dailyMissionDate > local.dailyMissionDate ? account
      : {
          ...account,
          completedDailyMissionIds: [...new Set([
            ...local.completedDailyMissionIds,
            ...account.completedDailyMissionIds,
          ])],
        };
  const eventProgress = local.completedEventWeek > account.completedEventWeek ? local : account;
  return {
    xp: Math.max(local.xp, account.xp),
    gamesPlayed: Math.max(local.gamesPlayed, account.gamesPlayed),
    bestAccuracy: Math.max(local.bestAccuracy, account.bestAccuracy),
    bestStreak: Math.max(local.bestStreak, account.bestStreak),
    avatar: account.avatar,
    currentDailyStreak: latest.currentDailyStreak,
    bestDailyStreak: Math.max(local.bestDailyStreak, account.bestDailyStreak),
    lastPlayedDate: latest.lastPlayedDate,
    dailyMissionDate: dailyProgress.dailyMissionDate,
    completedDailyMissionIds: dailyProgress.completedDailyMissionIds,
    completedStoryQuestIds: [...new Set([
      ...local.completedStoryQuestIds,
      ...account.completedStoryQuestIds,
    ])],
    completedEventId: eventProgress.completedEventId,
    completedEventWeek: eventProgress.completedEventWeek,
  };
}

export function calculateRoundXp(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  const accuracy = correctAnswers / totalQuestions;
  return (
    correctAnswers * XP_PER_CORRECT_ANSWER +
    XP_ROUND_COMPLETION_BONUS +
    (accuracy === 1 ? XP_PERFECT_ROUND_BONUS : 0)
  );
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPreviousLocalDateKey(date: Date): string {
  const previousDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  return getLocalDateKey(previousDate);
}

export function getWeekKey(date: Date): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return getLocalDateKey(monday);
}

export function calculateRoundRewards(
  progress: PlayerProgress,
  run: {
    type: RunType;
    id: string;
    weekKey: string;
    today: string;
    previousDay: string;
    correctAnswers: number;
    totalQuestions: number;
    bestQuestionStreak: number;
    answers: RoundAnswer[];
    questions: RoundQuestion[];
  },
): {
  progress: PlayerProgress;
  xpEarned: number;
  completedMissionIds: string[];
  completedStoryQuest: boolean;
  completedEvent: boolean;
} {
  const accuracy = run.totalQuestions > 0 ? run.correctAnswers / run.totalQuestions : 0;
  const questionsById = new Map(run.questions.map(question => [question.id, question]));
  const correctNaijaAnswers = run.answers.filter(answer => (
    answer.isCorrect && questionsById.get(answer.questionId)?.category === 'nigerian_culture'
  )).length;
  const missionConditions: Record<string, boolean> = {
    'finish-a-round': run.totalQuestions > 0,
    'three-correct': run.correctAnswers >= 3,
    'naija-correct': correctNaijaAnswers >= 2,
    'daily-five': run.type === 'daily' && run.totalQuestions === 5,
  };
  const currentMissionIds = progress.dailyMissionDate === run.today
    ? progress.completedDailyMissionIds
    : [];
  const newlyCompletedMissionIds = Object.entries(missionConditions)
    .filter(([id, complete]) => complete && !currentMissionIds.includes(id))
    .map(([id]) => id);
  const missionRewards: Record<string, number> = {
    'finish-a-round': 10,
    'three-correct': 15,
    'naija-correct': 20,
    'daily-five': 10,
  };
  const isStoryQuestComplete = run.type === 'story' && accuracy >= 0.6
    && !progress.completedStoryQuestIds.includes(run.id);
  const isEventComplete = run.type === 'event'
    && !(progress.completedEventWeek === run.weekKey && progress.completedEventId === run.id);
  const playStreak = progress.lastPlayedDate === run.today
    ? progress.currentDailyStreak
    : progress.lastPlayedDate === run.previousDay
      ? progress.currentDailyStreak + 1
      : 1;
  const streakBonus = progress.lastPlayedDate !== run.today && playStreak === 3 ? 10 : 0;
  const missionXp = newlyCompletedMissionIds.reduce((total, id) => total + (missionRewards[id] ?? 0), 0);
  const storyXp = isStoryQuestComplete ? 25 : 0;
  const eventXp = isEventComplete ? 20 : 0;
  const xpEarned = calculateRoundXp(run.correctAnswers, run.totalQuestions)
    + missionXp + storyXp + eventXp + streakBonus;

  return {
    progress: {
      ...progress,
      xp: progress.xp + xpEarned,
      gamesPlayed: progress.gamesPlayed + 1,
      bestAccuracy: Math.max(progress.bestAccuracy, Math.round(accuracy * 100)),
      bestStreak: Math.max(progress.bestStreak, run.bestQuestionStreak),
      currentDailyStreak: playStreak,
      bestDailyStreak: Math.max(progress.bestDailyStreak, playStreak),
      lastPlayedDate: run.today,
      dailyMissionDate: run.today,
      completedDailyMissionIds: [...new Set([...currentMissionIds, ...newlyCompletedMissionIds])],
      completedStoryQuestIds: isStoryQuestComplete
        ? [...new Set([...progress.completedStoryQuestIds, run.id])]
        : progress.completedStoryQuestIds,
      completedEventId: isEventComplete ? run.id : progress.completedEventId,
      completedEventWeek: isEventComplete ? run.weekKey : progress.completedEventWeek,
    },
    xpEarned,
    completedMissionIds: [...new Set([...currentMissionIds, ...newlyCompletedMissionIds])],
    completedStoryQuest: isStoryQuestComplete,
    completedEvent: isEventComplete,
  };
}
