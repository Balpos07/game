import Link from 'next/link';
import Header from '@/components/Header';
import OrganizerProfileContent from '@/components/OrganizerProfileContent';

export const metadata = {
  title: 'Organizers | DevN\'Visuals',
  description: 'Meet the DevN\'Visuals community organizers and find ways to contact the team.',
};

export default function OrganizersPage() {
  return <div className="min-h-screen"><Header /><main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16"><Link href="/community/next-session" className="text-sm font-bold text-[#3186FF]">Community / Next session / Organizers</Link><OrganizerProfileContent /></main></div>;
}
