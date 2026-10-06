'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Radio, Trophy, Users } from 'lucide-react';
import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import { SocialHub } from '@/components/SocialHub';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useQuizStore } from '@/store/useQuizStore';
import { trackGameEvent } from '@/lib/gameEvents';

export default function CompetePage() {
  const router = useRouter();
  const { questions, ready } = useQuestionBank();
  const startQuiz = useQuizStore(state => state.startQuiz);
  const setCompetition = useQuizStore(state => state.setCompetition);

  const startChallenge = (
    challengeQuestions: typeof questions,
    challengeId: string,
    code: string,
    action: 'challenge_created' | 'challenge_joined',
  ) => {
    startQuiz(challengeQuestions);
    setCompetition({ challengeId, shareCode: code });
    const category = challengeQuestions[0]?.category ?? 'mixed';
    trackGameEvent(action, category);
    trackGameEvent('round_started', category);
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <section className="africa-hero rounded-[2rem] px-5 py-8 text-white shadow-[0_20px_60px_rgba(48,40,68,0.16)] sm:px-8 sm:py-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B8F4C8]">The social side of trivia</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold sm:text-5xl">Compete together.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                Challenge a friend, rally your campus crew, or climb the verified global rankings.
              </p>
            </div>
            <a href="#social-challenges-heading" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#433653] transition hover:bg-white/90">
              Start a challenge <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <Users className="h-5 w-5 text-[#B8F4C8]" />
              <p className="mt-3 font-bold">Friend challenges</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Same five questions, verified scores.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <Trophy className="h-5 w-5 text-[#F7D86A]" />
              <p className="mt-3 font-bold">Campus &amp; crew boards</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Create a crew or join with an invite code.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <Radio className="h-5 w-5 text-[#9DE7DE]" />
              <p className="mt-3 font-bold">Live multiplayer</p>
              <p className="mt-1 text-xs leading-5 text-white/65">Coming next. Friend challenges are asynchronous for now.</p>
            </div>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="social-challenges-heading">
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#3186FF]">Find your people</p>
              <h2 id="social-challenges-heading" className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Challenges &amp; crews</h2>
            </div>
            {ready ? (
              <SocialHub
                questions={questions}
                category="all"
                onStartChallenge={startChallenge}
              />
            ) : (
              <div className="glass-card h-72 animate-pulse" aria-label="Loading challenge questions" />
            )}
          </section>
          <section aria-labelledby="global-rankings-heading">
            <div className="mb-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#3186FF]">Play fair, rise up</p>
              <h2 id="global-rankings-heading" className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Global rankings</h2>
            </div>
            <Leaderboard />
          </section>
        </div>
        <p className="mt-7 text-center text-xs leading-5 text-[#1E1E1E]/50">
          Leaderboard points are recalculated from your submitted answers on our server. Prize or high-stakes use requires additional anti-cheat review.
        </p>
      </main>
    </div>
  );
}
