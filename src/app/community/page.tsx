import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import CommunityEngagement from '@/components/CommunityEngagement';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3" y="3" width="4.2" height="14.2" rx="0.9" />
      <circle cx="5.1" cy="7.3" r="1.8" />
      <path d="M10 17.2V9.1h4.1v1.1h.1c.6-1.1 1.9-2.2 4-2.2 4.2 0 5 2.8 5 6.4v5.8h-4.2v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5H10Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.7 21v-7.6h2.6l.4-3.1h-3V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.2v3.1h3.1V21h3.4Z" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', handle: '@devnvisuals', href: 'https://www.instagram.com/devnvisuals/', icon: InstagramIcon },
  { label: 'LinkedIn', handle: 'DevN\'Visuals', href: 'https://www.linkedin.com/company/devnvisuals/', icon: LinkedInIcon },
  { label: 'Facebook', handle: 'DevN\'Visuals', href: 'https://www.facebook.com/devnvisuals/', icon: FacebookIcon },
];

const whatsappLink = 'https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN';

export const metadata = {
  title: 'Community | DevN\'Visuals',
  description: 'Meet the people, ideas, and conversations behind the next DevN\'Visuals community session.',
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Header />

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-24">
          <div className="animate-fade-in-up">
            <h1 className="max-w-xl text-5xl font-extrabold leading-[0.98] tracking-tight text-[#1E1E1E] sm:text-6xl lg:text-7xl">
              The next good conversation is almost here.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-[#1E1E1E]/65 sm:text-lg">
              DevN&apos;Visuals community sessions are where curious people bring their questions,
              share what they are building, and leave with a few new ideas to try.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary">
                <MessageCircle className="h-4 w-4" />
                Join us on WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link href="/" className="btn-secondary">
                Play the trivia
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in-up [animation-delay:120ms]">
            <div className="absolute -right-5 -top-5 z-10 hidden h-24 w-24 rounded-full border border-[#FBBC05]/30 bg-[#FBBC05]/15 sm:block" />
            <div className="relative overflow-hidden rounded-[2rem] border-8 border-white/70 bg-[#1E1E1E] shadow-[0_24px_70px_rgba(30,30,30,0.18)]">
              <Image
                src="/dnv.png"
                width={1080}
                height={1350}
                alt="A group of people connecting at a community gathering"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1E1E1E]/80 via-[#1E1E1E]/20 to-transparent p-6 pt-20 text-white">
                <p className="text-sm font-semibold">Bring your curiosity.</p>
                <p className="mt-1 text-xs text-white/70">Leave with people to build alongside.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-[#1E1E1E]/8 bg-white/90 px-4 py-3 shadow-xl backdrop-blur sm:-left-8">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3186FF]/12 text-[#3186FF]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1E1E1E]">Open to everyone</p>
                <p className="text-[11px] text-[#1E1E1E]/50">Learners, makers, and mentors</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#1E1E1E]/8 bg-white/45">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">What&apos;s next</p>
              <h2 className="mt-3 max-w-sm text-3xl font-extrabold leading-tight text-[#1E1E1E] sm:text-4xl">
                A room for better questions.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#1E1E1E]/60">
                The next session date and theme are coming soon. Follow along so you are the first to know when registration opens.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/community/next-session" className="glass-card group p-5 transition-transform hover:-translate-y-1 hover:bg-white">
                <CalendarDays className="h-5 w-5 text-[#EA4335]" />
                <div className="mt-8 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-[#1E1E1E]">Next session</h3>
                  <ArrowUpRight className="h-4 w-4 text-[#1E1E1E]/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/55">Date and topic announcement coming soon.</p>
                <span className="mt-4 block text-xs font-bold text-[#3186FF]">View session details</span>
              </Link>
              <div className="glass-card p-5">
                <MessageCircle className="h-5 w-5 text-[#34A853]" />
                <h3 className="mt-8 font-bold text-[#1E1E1E]">Stay in the loop</h3>
                <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/55">Join the WhatsApp conversation for updates and reminders.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Sessions', value: 'Monthly', detail: 'Fresh conversations and practical demos' },
              { label: 'Members', value: 'Growing', detail: 'Curious learners, makers, and builders' },
              { label: 'Focus', value: 'Practical', detail: 'Real lessons you can apply right away' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">{stat.label}</p>
                <p className="mt-3 text-3xl font-extrabold text-[#1E1E1E]">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/55">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[#1E1E1E]/8 bg-white/60 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#34A853]">Why join</p>
              <h3 className="mt-3 text-3xl font-extrabold text-[#1E1E1E]">A space for learning out loud.</h3>
              <div className="mt-6 space-y-4">
                {[
                  'Real-world conversations that move beyond theory.',
                  'Thoughtful people building in public and sharing honest lessons.',
                  'Opportunities to ask questions, meet peers, and grow together.',
                ].map(item => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-[#34A853]/5 p-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#34A853] text-[10px] font-bold text-white">✓</span>
                    <p className="text-sm leading-6 text-[#1E1E1E]/65">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#1E1E1E]/8 bg-[#3186FF]/5 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">What people gain</p>
              <div className="mt-6 space-y-4">
                {[
                  { title: 'Sharper thinking', text: 'Better questions and better problem framing.' },
                  { title: 'Career clarity', text: 'Practical insight for growth in the workplace.' },
                  { title: 'Meaningful connections', text: 'A welcoming peer network and new collaborations.' },
                ].map(item => (
                  <div key={item.title} className="rounded-2xl border border-[#3186FF]/10 bg-white/60 p-4">
                    <p className="text-base font-extrabold text-[#1E1E1E]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#1E1E1E]/60">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EA4335]">Find your people</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#1E1E1E] sm:text-4xl">Keep the conversation going.</h2>
            </div>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#34A853] transition-colors hover:text-[#277D3E]">
              Open WhatsApp <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {socialLinks.map(({ label, handle, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-[#1E1E1E]/8 bg-white/60 p-4 transition-transform hover:-translate-y-1 hover:bg-white">
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E1E1E]/5 text-[#1E1E1E] transition-colors group-hover:bg-[#3186FF] group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[#1E1E1E]">{label}</span>
                    <span className="block text-xs text-[#1E1E1E]/50">{handle}</span>
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#1E1E1E]/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24">
          <CommunityEngagement />
        </section>
      </main>
    </div>
  );
}
