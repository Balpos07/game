import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CalendarDays, MessageCircle, Users } from 'lucide-react';
import Header from '@/components/Header';

const whatsappLink = 'https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN';

export const metadata = {
  title: 'Next Community Session | DevN\'Visuals',
  description: 'See the speaker, agenda, meeting details, and organizers for the next DevN\'Visuals community session.',
};

export default function NextSessionPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <Link href="/community" className="text-sm font-bold text-[#3186FF] transition-colors hover:text-[#1E1E1E]">
            Community / Next session
          </Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#EA4335]">Coming soon</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-[0.98] tracking-tight text-[#1E1E1E] sm:text-7xl">
            The next session is taking shape.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#1E1E1E]/65 sm:text-lg">
            We are preparing the next DevN&apos;Visuals gathering. The date, theme, and speaker will be announced here first, with the full details ready before registration opens.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" />
              Get updates on WhatsApp
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link href="/community" className="btn-secondary">Back to community</Link>
          </div>
        </div>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border-8 border-white/70 bg-[#1E1E1E] shadow-[0_24px_70px_rgba(30,30,30,0.16)] sm:min-h-[440px]">
            <Image src="/dnv.png" alt="DevN'Visuals community session" fill sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Save the idea</p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">A place to learn out loud.</h2>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">Session at a glance</p>
              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#EA4335]" />
                  <div><p className="text-sm font-bold">Date and time</p><p className="mt-1 text-sm text-[#1E1E1E]/55">Announcement coming soon</p></div>
                </div>
                <div className="flex gap-3">
                  <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#3186FF]" />
                  <div><p className="text-sm font-bold">Who it is for</p><p className="mt-1 text-sm text-[#1E1E1E]/55">Learners, makers, mentors, and the curious</p></div>
                </div>
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#34A853]" />
                  <div><p className="text-sm font-bold">Meeting format</p><p className="mt-1 text-sm text-[#1E1E1E]/55">Format and venue will be shared with the announcement</p></div>
                </div>
              </div>
            </div>
            <p className="mt-10 border-t border-[#1E1E1E]/8 pt-5 text-sm leading-6 text-[#1E1E1E]/55">Join the WhatsApp group to hear when these details go live.</p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">The people</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#1E1E1E] sm:text-4xl">Meet the voices behind the session.</h2>
            <p className="mt-5 text-sm leading-7 text-[#1E1E1E]/60">Speaker and organizer profiles will be added as soon as the lineup is confirmed.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/community/speakers/featured" className="glass-card group p-6 transition-transform hover:-translate-y-1 hover:bg-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3186FF]/12 text-xl font-extrabold text-[#3186FF]">S</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#3186FF]">Featured speaker</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">Oluwasusi Stephen Olayemi</h3>
              <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/55">The Things They Don&apos;t Teach You in Tech — workplace expectations, communication, teamwork, receiving feedback, deadlines, professionalism, and practical realities of navigating the tech workplace.</p>
              <span className="mt-5 block text-xs font-bold text-[#3186FF]">Open speaker profile ↗</span>
            </Link>
            <Link href="/community/organizers" className="glass-card group p-6 transition-transform hover:-translate-y-1 hover:bg-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34A853]/12 text-xl font-extrabold text-[#34A853]">D</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">Organizers</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">DevN&apos;Visuals community team</h3>
              <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/55">The hosts, moderators, and volunteers making space for better conversations.</p>
              <span className="mt-5 block text-xs font-bold text-[#34A853]">Meet the organizers ↗</span>
            </Link>
          </div>
        </section>

        <section className="mt-16 border-t border-[#1E1E1E]/8 pt-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EA4335]">01 / Welcome</p><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Meet the room, settle in, and connect with other attendees.</p></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FBBC05]">02 / Main conversation</p><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">A practical talk, story, or workshop led by the featured speaker.</p></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">03 / Open floor</p><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Questions, shared ideas, and the next connections to carry forward.</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}