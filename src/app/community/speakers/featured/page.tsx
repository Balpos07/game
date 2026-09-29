import Link from 'next/link';
import Header from '@/components/Header';
import SpeakerProfileContent from '@/components/SpeakerProfileContent';

export const metadata = {
  title: 'Featured Speaker | DevN\'Visuals',
  description: 'Speaker profile for the next DevN\'Visuals community session.',
};

export default function FeaturedSpeakerPage() {
  return <div className="min-h-screen"><Header /><main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16"><Link href="/community/next-session" className="text-sm font-bold text-[#3186FF]">Community / Next session / Speaker</Link><SpeakerProfileContent /></main></div>;
}
