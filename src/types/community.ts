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
    name: 'Oluwasusi Stephen Olayemi',
    bio: 'I am a Software Developer with years of experience building modern web and mobile applications. I am a Scientific Officer at NASRDA and CTO at Spurwiz. I am passionate about building practical digital solutions and fascinated by space, space technologies, satellite systems, and the possibilities of using technology to better understand and explore our world and beyond.',
    topic: 'The Things They Don\'t Teach You in Tech',
    photoURL: '',
    linkedin: '',
    instagram: '',
  },
  organizers: [
    { name: 'Ayomiposi BALOGUN', role: 'Technical Analyst', contact: '@iamayobalogun07', photoURL: '/organizers/Organizer-1.png' },
  ],
};
