'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, MessageCircle, Plus, Users } from 'lucide-react';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { CommunityContent, DEFAULT_COMMUNITY_CONTENT } from '@/types/community';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN';
const SESSION_DATE = process.env.NEXT_PUBLIC_NEXT_SESSION_DATE || '';

type Countdown = { days: number; hours: number; minutes: number; seconds: number } | null;

function getCountdown(date: string): Countdown {
  if (!date) return null;
  const difference = new Date(date).getTime() - Date.now();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function CommunityEngagement() {
  const [countdown, setCountdown] = useState<Countdown>(() => getCountdown(SESSION_DATE));
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [voteTotals, setVoteTotals] = useState<Record<string, number>>({});
  const [content, setContent] = useState<CommunityContent>(DEFAULT_COMMUNITY_CONTENT);
  const { user, loginWithGoogle, loading: authLoading } = useAuth();

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;

    return onSnapshot(doc(db, 'communityContent', 'current'), snapshot => {
      if (snapshot.exists()) setContent({ ...DEFAULT_COMMUNITY_CONTENT, ...snapshot.data() } as CommunityContent);
    });
  }, []);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;

    return onSnapshot(collection(db, 'polls/current/votes'), snapshot => {
      const totals: Record<string, number> = {};
      snapshot.docs.forEach(vote => {
        const optionId = vote.data().optionId as string;
        totals[optionId] = (totals[optionId] || 0) + 1;
      });
      setVoteTotals(totals);
      const ownVote = user ? snapshot.docs.find(vote => vote.id === user.uid) : null;
      if (ownVote) {
        setSelectedPoll(ownVote.data().optionId as string);
        setPollSubmitted(true);
      }
    }, error => console.error('Poll error:', error));
  }, [user]);

  useEffect(() => {
    if (!SESSION_DATE) return;
    const timer = window.setInterval(() => setCountdown(getCountdown(SESSION_DATE)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const calendarLink = useMemo(() => {
    if (!SESSION_DATE) return null;
    const start = new Date(SESSION_DATE);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const format = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=DevN%27Visuals%20Community%20Session&dates=${format(start)}/${format(end)}&details=Join%20the%20DevN%27Visuals%20community%20session.&location=Online%20or%20venue%20to%20be%20announced`;
  }, []);

  const submitPoll = async () => {
    if (!selectedPoll) return;
    if (!user || user.isAnonymous) {
      await loginWithGoogle();
      return;
    }

    const db = getFirebaseDb();
    if (!db) return;
    await setDoc(doc(db, 'polls', 'current', 'votes', user.uid), {
      optionId: selectedPoll,
      createdAt: serverTimestamp(),
    });
    setPollSubmitted(true);
  };

  const totalVotes = Object.values(voteTotals).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-16">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card overflow-hidden p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3186FF]/12 text-[#3186FF]"><Clock3 className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3186FF]">Next session</p><h2 className="mt-1 text-xl font-extrabold text-[#1E1E1E]">Keep the date close</h2></div>
          </div>
          {countdown ? (
            <div className="mt-8 grid grid-cols-4 gap-2">
              {Object.entries(countdown).map(([unit, value]) => <div key={unit} className="rounded-2xl bg-[#1E1E1E]/5 p-3 text-center"><p className="text-2xl font-extrabold text-[#1E1E1E]">{String(value).padStart(2, '0')}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]/45">{unit}</p></div>)}
            </div>
          ) : <p className="mt-7 rounded-2xl bg-[#FBBC05]/10 p-4 text-sm leading-6 text-[#1E1E1E]/65">The date is being confirmed. Join WhatsApp and we will send the announcement as soon as it is ready.</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle className="h-4 w-4" /> RSVP on WhatsApp</a>
            <a href="mailto:?subject=DevN%27Visuals%20community%20session&body=Remind%20me%20about%20the%20next%20DevN%27Visuals%20community%20session." className="btn-secondary"><MessageCircle className="h-4 w-4" /> Email reminder</a>
            {calendarLink ? <a href={calendarLink} target="_blank" rel="noreferrer" className="btn-secondary"><CalendarDays className="h-4 w-4" /> Add to calendar</a> : <span className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E]/10 px-4 py-3 text-sm font-bold text-[#1E1E1E]/35"><CalendarDays className="h-4 w-4" /> Calendar opens with date</span>}
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-[#34A853]" /><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">Question of the week</p></div>
          <h2 className="mt-4 text-xl font-extrabold text-[#1E1E1E]">{content.questionOfWeek}</h2>
          <div className="mt-5 space-y-2">
            {content.pollOptions.map(option => {
              const votes = voteTotals[option] || 0;
              const percentage = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
              return <label key={option} className={`block cursor-pointer rounded-xl border p-3 text-sm font-semibold transition-colors ${selectedPoll === option ? 'border-[#3186FF]/35 bg-[#3186FF]/8' : 'border-[#1E1E1E]/8 bg-white/45 hover:bg-white'}`}><span className="flex items-center gap-3"><input type="radio" name="topic" value={option} checked={selectedPoll === option} onChange={() => setSelectedPoll(option)} className="accent-[#3186FF]" />{option}<span className="ml-auto text-xs text-[#1E1E1E]/45">{votes} ({percentage}%)</span></span><span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#1E1E1E]/8"><span className="block h-full rounded-full bg-[#3186FF] transition-all" style={{ width: `${percentage}%` }} /></span></label>;
            })}
          </div>
          <button type="button" onClick={submitPoll} disabled={!selectedPoll || pollSubmitted || authLoading} className="btn-secondary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">{pollSubmitted ? <><Check className="h-4 w-4" /> Vote recorded</> : user ? 'Vote for a topic' : 'Sign in with Google to vote'}</button>
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EA4335]">Community archive</p><h2 className="mt-3 text-3xl font-extrabold text-[#1E1E1E] sm:text-4xl">The moments we are collecting.</h2></div><span className="text-sm text-[#1E1E1E]/50">Photos from each session will live here.</span></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#1E1E1E]/8 bg-[#1E1E1E]"><Image src="/dnv.png" alt="DevN'Visuals community gathering" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-xs font-bold text-white">Upcoming session</div></div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E1E1E]/15 bg-white/35 p-5 text-center"><Plus className="h-5 w-5 text-[#3186FF]" /><p className="mt-3 text-sm font-bold text-[#1E1E1E]">Next photo goes here</p><p className="mt-1 text-xs leading-5 text-[#1E1E1E]/50">Add highlights after the first gathering.</p></div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E1E1E]/15 bg-white/35 p-5 text-center"><MessageCircle className="h-5 w-5 text-[#34A853]" /><p className="mt-3 text-sm font-bold text-[#1E1E1E]">Share your moment</p><p className="mt-1 text-xs leading-5 text-[#1E1E1E]/50">Send community photos to the organizers.</p></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {['“A space for curious people to learn out loud.”', '“Good questions, practical ideas, real connections.”', '“Come for the topic. Stay for the people.”'].map((quote, index) => <div key={quote} className="glass-card p-5"><p className="text-lg font-bold leading-7 text-[#1E1E1E]">{quote}</p><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#1E1E1E]/40">Community voice {index + 1}</p></div>)}
      </section>
    </div>
  );
}
