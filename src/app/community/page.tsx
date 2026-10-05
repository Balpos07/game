import {
  ArrowUpRight,
  CalendarDays,
  MessageCircle,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';

const socialLinks = [
  { label: 'X', handle: '@devnvisuals', href: 'https://x.com/devnvisuals' },
  { label: 'Instagram', handle: '@devnvisuals', href: 'https://www.instagram.com/devnvisuals/' },
];

const eventLink = 'https://dnv-trivia.vercel.app';
const whatsappLink = 'https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN';

export const metadata = {
  title: 'Community | DevN\'Visuals',
  description: 'The next DevN\'Visuals community session: Things They Don\'t Teach You in Tech.',
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#efefee] text-[#1E1E1E]">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#1E1E1E]/10 bg-[#efefef] p-5 shadow-[0_16px_50px_rgba(17,17,17,0.08)] sm:p-8 lg:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -left-32 top-16 h-80 w-[90%] rounded-[50%] border-[18px] border-[#d7d5d3]" style={{ transform: 'rotate(-10deg)' }} />
            <div className="absolute -right-20 -top-10 h-80 w-[85%] rounded-[50%] border-[18px] border-[#d7d5d3]" style={{ transform: 'rotate(18deg)' }} />
            <div className="absolute -bottom-16 left-10 h-72 w-[90%] rounded-[50%] border-[18px] border-[#d7d5d3]" style={{ transform: 'rotate(-8deg)' }} />
          </div>

          <div className="relative">
            <div className="text-3xl font-black tracking-[-0.08em] text-[#1E1E1E] sm:text-4xl">DevN&apos;Visuals</div>

            <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.12fr_0.88fr]">
              <div>
                <h1 className="max-w-[8ch] text-5xl font-black leading-[0.82] tracking-[-0.06em] text-[#1E1E1E] sm:text-6xl lg:text-[7rem]">
                  Things
                  <span className="block text-[#1E1E1E]/90">They</span>
                  <span className="block text-[#1E1E1E]/80">Don&apos;t</span>
                  <span className="mt-2 block w-full max-w-[80%] rounded-r-lg bg-[#111111] px-3 py-1 text-[#f5f5f5]">Teach</span>
                  <span className="mt-2 block text-[#1E1E1E]">You in</span>
                  <span className="mt-2 block text-[#1E1E1E]">Tech</span>
                </h1>
                <div className="mt-4 h-1.5 w-full max-w-[24rem] bg-[#a361ff]" />
              </div>

              <div className="mx-auto w-full max-w-[430px]">
                <div className="rounded-[2rem] border-[3px] border-[#1E1E1E] bg-[#ece8e4] p-4 shadow-[0_20px_30px_rgba(17,17,17,0.12)]">
                  <div className="overflow-hidden rounded-[1.4rem] border-[3px] border-[#1E1E1E] bg-[radial-gradient(circle_at_30%_20%,#f4f4f4_0%,#cfcfcf_25%,#757575_62%,#1a1a1a_100%)] p-3">
                    <div className="aspect-[4/5] rounded-[1rem] border-[2px] border-[#1E1E1E] bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.8),rgba(111,111,111,0.35)_20%,rgba(20,20,20,0.9)_70%)]" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#1E1E1E]/15 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#1E1E1E] bg-[#f7f1ee] text-[10px] font-black">@</span>
                      <span className="text-sm font-bold text-[#1E1E1E]">Corisic</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#1E1E1E]/55">Speaker</span>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-2xl font-black tracking-[-0.05em] text-[#1E1E1E]">Oluwasusi Stephen</p>
                  <p className="mt-1 text-sm font-medium text-[#1E1E1E]/70">Scientific Officer - NASRDA</p>
                  <p className="text-sm font-medium text-[#1E1E1E]/70">CTO - Spurwiz</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-5 border-t border-[#1E1E1E]/20 pt-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="rounded-2xl bg-[#1E1E1E] p-4 text-white shadow-[0_20px_40px_rgba(17,17,17,0.2)] sm:min-w-[260px]">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Save the Date</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.05em]">October 30th 2026</p>
              </div>

              <div className="flex flex-col gap-3 text-sm font-semibold text-[#1E1E1E] sm:flex-row sm:flex-wrap">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E]/15 bg-white/50 px-3 py-2 transition-colors hover:bg-white"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#1E1E1E]/65">{link.handle}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex items-center gap-3 text-sm font-semibold text-[#1E1E1E]">
                <CalendarDays className="h-5 w-5 text-[#1E1E1E]" />
                <span>Location: X Space @devnvisuals</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary">
                  <MessageCircle className="h-4 w-4" />
                  Join WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={eventLink} target="_blank" rel="noreferrer" className="btn-secondary">
                  More info:
                  <span className="font-black">dnv-trivia.vercel.app</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Speaker', value: 'Oluwasusi Stephen', detail: 'Practical insight from a real-world tech career.' },
            { label: 'Topic', value: 'Things They Don\'t Teach You in Tech', detail: 'Lessons on navigating the workplace, feedback, and growth.' },
            { label: 'Community', value: 'DevN\'Visuals', detail: 'A room for curious learners, builders, and mentors.' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">{stat.label}</p>
              <h2 className="mt-3 text-xl font-extrabold text-[#1E1E1E]">{stat.value}</h2>
              <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/60">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 flex flex-col gap-4 rounded-[2rem] border border-[#1E1E1E]/10 bg-white/60 p-6 shadow-[0_10px_30px_rgba(17,17,17,0.04)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#EA4335]">Why join</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#1E1E1E] p-5 text-white">
              <Users className="h-6 w-6 text-[#FBBC05]" />
              <h3 className="mt-4 text-xl font-extrabold">Learn from lived experience</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">A grounded conversation about the real challenges people face in tech.</p>
            </div>
            <div className="rounded-2xl border border-[#1E1E1E]/10 bg-[#f7f7f7] p-5">
              <MessageCircle className="h-6 w-6 text-[#34A853]" />
              <h3 className="mt-4 text-xl font-extrabold">Ask better questions</h3>
              <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/60">Bring your curiosity and leave with ideas you can apply immediately.</p>
            </div>
            <div className="rounded-2xl border border-[#1E1E1E]/10 bg-[#f7f7f7] p-5">
              <ArrowUpRight className="h-6 w-6 text-[#3186FF]" />
              <h3 className="mt-4 text-xl font-extrabold">Keep growing</h3>
              <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/60">Build stronger habits for learning, feedback, and long-term career growth.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
