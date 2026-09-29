'use client';

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  date: number;
  photoURL?: string;
  uid?: string;
};

type LeaderboardPeriod = 'all' | 'month' | 'week' | 'today';

const RANK_CONFIG = [
  { label: '🥇', color: '#FBBC05', bg: 'rgba(251,188,5,0.12)', border: 'rgba(251,188,5,0.25)' },
  { label: '🥈', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' },
  { label: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.25)' },
];

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { user } = useAuth();

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    const unsub = onSnapshot(
      collection(db, 'leaderboard'),
      snapshot => {
        setScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LeaderboardEntry[]);
        setError(false);
        setLoading(false);
      },
      err => {
        console.error('Leaderboard error:', err);
        setError(true);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const periodStart = (() => {
    const now = new Date();

    if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    if (period === 'week') return now.getTime() - (7 * 24 * 60 * 60 * 1000);
    return 0;
  })();
  const filteredScores = scores
    .filter(entry => entry.date >= periodStart)
    .sort((first, second) => second.score - first.score || second.date - first.date);
  const visibleScores = filteredScores.slice(0, 10);
  const currentUserRank = user?.uid
    ? filteredScores.findIndex(entry => entry.uid === user.uid) + 1
    : 0;
  const currentUserEntry = currentUserRank > 10 ? filteredScores[currentUserRank - 1] : null;

  return (
    <div className="glass-card mx-auto w-full max-w-lg p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(85.98% 85.98% at 50% 17.07%, #3186FF 52%, #6D97FF 76%, #A9A8FF 100%)',
          }}
        >
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-[#1E1E1E] text-lg leading-tight">Global Leaderboard</h2>
          <p className="text-xs text-[#1E1E1E]/50 font-medium">Top 10 scores by period</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-1 rounded-xl bg-[#1E1E1E]/5 p-1">
        {(['all', 'month', 'week', 'today'] as LeaderboardPeriod[]).map(option => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            className={`rounded-lg px-2 py-2 text-xs font-bold capitalize transition-colors ${period === option ? 'bg-white text-[#3186FF] shadow-sm' : 'text-[#1E1E1E]/45 hover:text-[#1E1E1E]'}`}
          >
            {option === 'all' ? 'All time' : option}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-[#1E1E1E]/5 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-center text-[#1E1E1E]/50 py-6 text-sm">
          Leaderboard unavailable right now.
        </p>
      )}

      {!loading && !error && filteredScores.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-[#1E1E1E]/50 text-sm font-medium">No scores yet. Be the first!</p>
        </div>
      )}

      {!loading && !error && filteredScores.length > 0 && (
        <div className="flex flex-col gap-2">
          {visibleScores.map((entry, idx) => {
            const rankCfg = RANK_CONFIG[idx];
            const isTop3 = idx < 3;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex items-center justify-between gap-2 rounded-2xl p-3 transition-all sm:gap-3 sm:p-3.5"
                style={
                  isTop3
                    ? {
                        background: rankCfg.bg,
                        border: `1px solid ${rankCfg.border}`,
                      }
                    : {
                        background: 'rgba(30,30,30,0.03)',
                        border: '1px solid rgba(30,30,30,0.06)',
                      }
                }
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  {/* Rank */}
                  <div className="flex w-6 shrink-0 justify-center sm:w-8">
                    {isTop3 ? (
                      <span className="text-xl leading-none">{rankCfg.label}</span>
                    ) : (
                      <span className="text-sm font-bold text-[#1E1E1E]/30">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  {entry.photoURL ? (
                    <img
                      src={entry.photoURL}
                      alt={entry.name}
                      className="w-8 h-8 rounded-full shrink-0"
                      style={isTop3 ? { boxShadow: `0 0 0 2px ${rankCfg.color}` } : {}}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#3186FF]/15 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#3186FF]" />
                    </div>
                  )}

                  {/* Name */}
                  <span
                    className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1E1E1E]"
                    title={entry.name}
                  >
                    {entry.name}
                  </span>
                </div>

                {/* Score */}
                <span
                  className="font-bold text-base shrink-0"
                  style={{ color: isTop3 ? rankCfg.color : '#3186FF' }}
                >
                  {entry.score.toLocaleString()}
                </span>
              </motion.div>
            );
          })}
          {currentUserEntry && currentUserRank > 10 && (
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-[#3186FF]/25 bg-[#3186FF]/8 p-3 text-sm">
              <span className="font-semibold text-[#1E1E1E]">Your rank: #{currentUserRank} ({currentUserEntry.name})</span>
              <span className="font-bold text-[#3186FF]">{currentUserEntry.score.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
