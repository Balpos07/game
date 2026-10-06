import type { QuestionCategory } from '@/types/quiz';

export type TriviaLocation = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  scenery: string;
  category: QuestionCategory | 'all';
  requiredLevel: number;
  background: string;
  accent: string;
};

export const TRIVIA_LOCATIONS: TriviaLocation[] = [
  {
    id: 'lagos-mainland',
    name: 'Lagos Mainland',
    description: 'Street stories, Nigerian culture & everyday Naija knowledge.',
    emoji: '🏙️',
    scenery: '🚌  🏪  🌴',
    category: 'nigerian_culture',
    requiredLevel: 1,
    background: 'linear-gradient(135deg, #164E37, #28784F 60%, #E8A64B)',
    accent: '#28784F',
  },
  {
    id: 'tech-yard',
    name: 'Tech Yard',
    description: 'Big ideas, digital skills and the people shaping tomorrow.',
    emoji: '💻',
    scenery: '⚡  📱  🚀',
    category: 'technology',
    requiredLevel: 1,
    background: 'linear-gradient(135deg, #163C68, #287AB3 60%, #65C8D0)',
    accent: '#287AB3',
  },
  {
    id: 'open-road',
    name: 'Open Road',
    description: 'A lively mix of questions from every open trivia spot.',
    emoji: '🚌',
    scenery: '🛣️  🌅  🧭',
    category: 'all',
    requiredLevel: 2,
    background: 'linear-gradient(135deg, #7A3E17, #D58235 60%, #F0C36A)',
    accent: '#D58235',
  },
  {
    id: 'history-square',
    name: 'History Square',
    description: 'Discover the people, places and turning points of Nigeria.',
    emoji: '🏛️',
    scenery: '📜  🗿  🪘',
    category: 'history',
    requiredLevel: 3,
    background: 'linear-gradient(135deg, #402454, #765394 60%, #C69176)',
    accent: '#765394',
  },
];

export type DailyMission = {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
};

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'finish-a-round', title: 'Take a trip', description: 'Finish any trivia round.', rewardXp: 10 },
  { id: 'three-correct', title: 'Sharp mind', description: 'Get 3 or more answers correct in one round.', rewardXp: 15 },
  { id: 'naija-correct', title: 'Naija knowledge', description: 'Answer 2 Nigerian culture questions correctly.', rewardXp: 20 },
];

export type WeeklyEvent = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: QuestionCategory;
};

export const WEEKLY_EVENTS: WeeklyEvent[] = [
  {
    id: 'lagos-street-smarts',
    title: 'Lagos Street Smarts',
    description: 'A five-question spotlight on Nigerian culture and everyday knowledge.',
    emoji: '🚌',
    category: 'nigerian_culture',
  },
  {
    id: 'tech-hustle',
    title: 'Tech Hustle',
    description: 'Put your digital-world knowledge to the test.',
    emoji: '⚡',
    category: 'technology',
  },
  {
    id: 'stories-that-shaped-us',
    title: 'Stories That Shaped Us',
    description: 'A quick tour through Nigerian history and heritage.',
    emoji: '📜',
    category: 'history',
  },
];

export type StoryQuest = {
  id: string;
  title: string;
  location: string;
  description: string;
  emoji: string;
  category: QuestionCategory;
  requiredLevel: number;
};

export const STORY_QUESTS: StoryQuest[] = [
  {
    id: 'first-day-in-lagos',
    title: 'First Day in Lagos',
    location: 'Lagos Mainland',
    description: 'You have just arrived in the city. Find your bearings with five questions about Nigeria.',
    emoji: '🌆',
    category: 'nigerian_culture',
    requiredLevel: 1,
  },
  {
    id: 'build-something-new',
    title: 'Build Something New',
    location: 'Tech Yard',
    description: 'Meet the makers and solve a short challenge from the world of technology.',
    emoji: '🛠️',
    category: 'technology',
    requiredLevel: 2,
  },
  {
    id: 'stories-beneath-the-city',
    title: 'Stories Beneath the City',
    location: 'History Square',
    description: 'Follow the clues through the history and heritage behind the city.',
    emoji: '🗿',
    category: 'history',
    requiredLevel: 3,
  },
];

export function getWeeklyEvent(date: Date): { event: WeeklyEvent; weekKey: string } {
  const mondayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  mondayDate.setDate(mondayDate.getDate() - ((mondayDate.getDay() + 6) % 7));
  const epochMonday = Date.UTC(1970, 0, 5);
  const mondayUtc = Date.UTC(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate());
  const weekNumber = Math.floor((mondayUtc - epochMonday) / (7 * 24 * 60 * 60 * 1000));
  return {
    event: WEEKLY_EVENTS[((weekNumber % WEEKLY_EVENTS.length) + WEEKLY_EVENTS.length) % WEEKLY_EVENTS.length],
    weekKey: `${mondayDate.getFullYear()}-${String(mondayDate.getMonth() + 1).padStart(2, '0')}-${String(mondayDate.getDate()).padStart(2, '0')}`,
  };
}
