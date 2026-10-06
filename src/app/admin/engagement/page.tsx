'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';
import AdminOnly from '@/components/AdminOnly';
import { getFirebaseDb } from '@/lib/firebase';

type GameEvent = {
  uid: string;
  eventType: 'round_started' | 'round_completed' | 'challenge_created' | 'challenge_joined';
  category: string;
  dateKey: string;
  createdAt: number;
};

function dayDifference(first: string, second: string) {
  return Math.round((Date.parse(`${second}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86_400_000);
}

export default function EngagementPage() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const db = getFirebaseDb();

  useEffect(() => {
    if (!db) return;
    return onSnapshot(query(collection(db, 'gameEvents'), orderBy('createdAt', 'desc'), limit(1000)), snapshot => {
      setEvents(snapshot.docs.map(item => item.data() as GameEvent));
      setError('');
      setLoading(false);
    }, reason => {
      console.error('Engagement events loading failed:', reason);
      setError('Could not load engagement events.');
      setLoading(false);
    });
  }, [db]);

  const metrics = useMemo(() => {
    const startEvents = events.filter(event => event.eventType === 'round_started');
    const activePlayers = new Set(startEvents.map(event => event.uid));
    const datesByPlayer = new Map<string, Set<string>>();
    startEvents.forEach(event => {
      const dates = datesByPlayer.get(event.uid) ?? new Set<string>();
      dates.add(event.dateKey);
      datesByPlayer.set(event.uid, dates);
    });
    const returningPlayers = [...datesByPlayer.values()].filter(dates => dates.size > 1).length;

    const challengeEvents = events.filter(event => event.eventType === 'challenge_created' || event.eventType === 'challenge_joined');
    const cohorts = new Map<string, { type: string; category: string; players: Set<string>; returned: Set<string> }>();
    challengeEvents.forEach(event => {
      const key = `${event.eventType}:${event.category}`;
      const cohort = cohorts.get(key) ?? {
        type: event.eventType === 'challenge_created' ? 'Created' : 'Joined',
        category: event.category,
        players: new Set<string>(),
        returned: new Set<string>(),
      };
      cohort.players.add(`${event.uid}:${event.dateKey}`);
      const returnedWithinAWeek = startEvents.some(start => (
        start.uid === event.uid
        && dayDifference(event.dateKey, start.dateKey) >= 1
        && dayDifference(event.dateKey, start.dateKey) <= 7
      ));
      if (returnedWithinAWeek) cohort.returned.add(`${event.uid}:${event.dateKey}`);
      cohorts.set(key, cohort);
    });

    return {
      activePlayers: activePlayers.size,
      returningPlayers,
      returnRate: activePlayers.size ? Math.round((returningPlayers / activePlayers.size) * 100) : 0,
      cohorts: [...cohorts.values()].sort((a, b) => a.category.localeCompare(b.category) || a.type.localeCompare(b.type)),
    };
  }, [events]);

  return (
    <AdminOnly title="Player engagement">
      <section className="mt-7">
        <p className="mb-4 text-sm leading-6 text-[#1E1E1E]/55">Engagement is estimated from up to the latest 1,000 signed-in gameplay events. A challenge return means the player starts another round 1–7 days after creating or joining a challenge.</p>
        {(error || !db) && <p role="alert" className="mb-4 rounded-xl bg-[#EA4335]/8 p-3 text-sm text-[#9F2C23]">{error || 'Firebase is not configured.'}</p>}
        {loading && <div className="flex min-h-40 items-center justify-center" role="status"><LoaderCircle className="h-6 w-6 animate-spin text-[#3186FF]" /></div>}
        {!loading && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="glass-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Active players</p><p className="mt-2 text-3xl font-extrabold text-[#1E1E1E]">{metrics.activePlayers}</p></article>
              <article className="glass-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Returned on another day</p><p className="mt-2 text-3xl font-extrabold text-[#1E1E1E]">{metrics.returningPlayers}</p></article>
              <article className="glass-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Repeat play rate</p><p className="mt-2 text-3xl font-extrabold text-[#1E1E1E]">{metrics.returnRate}%</p></article>
            </div>
            <div className="glass-card mt-5 overflow-hidden p-4 sm:p-6">
              <h2 className="font-extrabold text-[#1E1E1E]">Challenge return rate by category</h2>
              {metrics.cohorts.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[460px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-[#1E1E1E]/45"><tr><th className="pb-3">Challenge</th><th className="pb-3">Category</th><th className="pb-3">Players</th><th className="pb-3">Returned</th><th className="pb-3">Rate</th></tr></thead>
                    <tbody>{metrics.cohorts.map(cohort => {
                      const rate = cohort.players.size ? Math.round((cohort.returned.size / cohort.players.size) * 100) : 0;
                      return <tr key={`${cohort.type}-${cohort.category}`} className="border-t border-[#1E1E1E]/6"><td className="py-3 font-semibold">{cohort.type}</td><td className="py-3 capitalize">{cohort.category.replaceAll('_', ' ')}</td><td className="py-3">{cohort.players.size}</td><td className="py-3">{cohort.returned.size}</td><td className="py-3 font-bold text-[#3186FF]">{rate}%</td></tr>;
                    })}</tbody>
                  </table>
                </div>
              ) : <p className="mt-3 text-sm text-[#1E1E1E]/55">Challenge return data will appear as signed-in players create and join challenges.</p>}
            </div>
          </>
        )}
      </section>
    </AdminOnly>
  );
}
