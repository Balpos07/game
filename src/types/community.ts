export interface CommunitySpeaker {
  name: string;
  bio: string;
  topic: string;
  photoURL: string;
  linkedin: string;
  instagram: string;
}

export interface CommunityOrganizer {
  name: string;
  role: string;
  contact: string;
  photoURL?: string;
}

export interface CommunityContent {
  questionOfWeek: string;
  pollOptions: string[];
  speaker: CommunitySpeaker;
  organizers: CommunityOrganizer[];
}

export const DEFAULT_COMMUNITY_CONTENT: CommunityContent = {
  questionOfWeek: 'What should we unpack together next?',
  pollOptions: ['Design systems', 'AI and the web', 'Building in public', 'Career stories'],
  speaker: {
    name: 'Oluwasusi Stephen',
    bio: 'Scientific Officer - NASRDA / CTO - Spurwiz',
    topic: 'Things They Don\'t Teach You in Tech',
    photoURL: '',
    linkedin: 'https://www.linkedin.com/company/devnvisuals/',
    instagram: 'https://www.instagram.com/devnvisuals/',
  },
  organizers: [
    { name: 'Ayomiposi BALOGUN', role: 'Technical Analyst', contact: '@iamayobalogun07', photoURL: '/organizers/Organizer-1.png' },
  ],
};
