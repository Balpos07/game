import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MessageCircle, Users } from 'lucide-react';
import Header from '@/components/Header';

const whatsappLink = 'https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN';
const eventLink = 'https://dnv-trivia.vercel.app';

export const metadata = {
  title: 'Next Community Session | DevN\'Visuals',
  description: 'The DevN\'Visuals community session: Things They Don\'t Teach You in Tech.',
};

export default function NextSessionPage() {
  return (
    <div className="min-h-screen bg-[#efefee] text-[#1E1E1E]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <Link href="/community" className="text-sm font-bold text-[#3186FF] transition-colors hover:text-[#1E1E1E]">
            Community / Next session
          </Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#EA4335]">Save the date</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.92] tracking-[-0.06em] text-[#1E1E1E] sm:text-7xl">
            Things They Don&apos;t Teach You in Tech
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#1E1E1E]/65 sm:text-lg">
            Join DevN&apos;Visuals for a practical conversation with Oluwasusi Stephen on growth, communication, feedback, and the lessons that rarely show up in tutorials.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" />
              Get updates on WhatsApp
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href={eventLink} target="_blank" rel="noreferrer" className="btn-secondary">
              More info
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <section className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#1E1E1E]/10 bg-[#efefef] p-5 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -left-28 top-5 h-80 w-[95%] rounded-[50%] border-[18px] border-[#d7d5d3]" style={{ transform: 'rotate(-12deg)' }} />
              <div className="absolute -right-20 -top-8 h-80 w-[85%] rounded-[50%] border-[18px] border-[#d7d5d3]" style={{ transform: 'rotate(16deg)' }} />
            </div>
            <div className="relative rounded-[1.8rem] border-[3px] border-[#1E1E1E] bg-[#ece8e4] p-4 shadow-[0_18px_30px_rgba(17,17,17,0.12)]">
              <div className="overflow-hidden rounded-[1.3rem] border-[3px] border-[#1E1E1E] bg-[radial-gradient(circle_at_30%_20%,#f4f4f4_0%,#cfcfcf_25%,#757575_62%,#1a1a1a_100%)] p-3">
                <div className="aspect-[4/5] rounded-[1rem] border-[2px] border-[#1E1E1E] bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.8),rgba(111,111,111,0.35)_20%,rgba(20,20,20,0.9)_70%)]" />
              </div>
              <div className="mt-4 text-center">
                <p className="text-2xl font-black tracking-[-0.05em] text-[#1E1E1E]">Oluwasusi Stephen</p>
                <p className="mt-1 text-sm font-medium text-[#1E1E1E]/70">Scientific Officer - NASRDA</p>
                <p className="text-sm font-medium text-[#1E1E1E]/70">CTO - Spurwiz</p>
              </div>
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">Session at a glance</p>
              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#EA4335]" />
                  <div>
                    <p className="text-sm font-bold">Date</p>
                    <p className="mt-1 text-sm text-[#1E1E1E]/55">October 30th 2026</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#3186FF]" />
                  <div>
                    <p className="text-sm font-bold">Location</p>
                    <p className="mt-1 text-sm text-[#1E1E1E]/55">X Space @devnvisuals</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#34A853]" />
                  <div>
                    <p className="text-sm font-bold">Format</p>
                    <p className="mt-1 text-sm text-[#1E1E1E]/55">An honest, practical community conversation.</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-10 border-t border-[#1E1E1E]/8 pt-5 text-sm leading-6 text-[#1E1E1E]/55">Follow X and Instagram for updates and reminders.</p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">The people</p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#1E1E1E] sm:text-4xl">Meet the voice behind the session.</h2>
            <p className="mt-5 text-sm leading-7 text-[#1E1E1E]/60">Oluwasusi Stephen brings a grounded perspective from software engineering, public service, and startup leadership.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/community/speakers/featured" className="glass-card group p-6 transition-transform hover:-translate-y-1 hover:bg-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3186FF]/12 text-xl font-extrabold text-[#3186FF]">S</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#3186FF]">Featured speaker</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">Oluwasusi Stephen</h3>
              <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/55">A practical look at what the tech journey doesn&apos;t teach you about real work, growth, and navigating expectations.</p>
              <span className="mt-5 block text-xs font-bold text-[#3186FF]">Open speaker profile ↗</span>
            </Link>
            <Link href="/community/organizers" className="glass-card group p-6 transition-transform hover:-translate-y-1 hover:bg-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34A853]/12 text-xl font-extrabold text-[#34A853]">D</div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">Organizers</p>
              <h3 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">DevN&apos;Visuals community team</h3>
              <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/55">Helping people learn, connect, and keep building with better questions and real conversations.</p>
              <span className="mt-5 block text-xs font-bold text-[#34A853]">Meet the organizers ↗</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}