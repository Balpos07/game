'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  date: number;
  photoURL?: string;
};

const RANK_CONFIG = [
  { label: '🥇', color: '#FBBC05', bg: 'rgba(251,188,5,0.12)', border: 'rgba(251,188,5,0.25)' },
  { label: '🥈', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)' },
  { label: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.25)' },
];

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) { setLoading(false); return; }

    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
    const unsub = onSnapshot(
      q,
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

  return (
    <div className="glass-card p-6 md:p-8 w-full max-w-lg mx-auto">
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
          <p className="text-xs text-[#1E1E1E]/50 font-medium">Top 10 all-time scores</p>
        </div>
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

      {!loading && !error && scores.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-[#1E1E1E]/50 text-sm font-medium">No scores yet. Be the first!</p>
        </div>
      )}

      {!loading && !error && scores.length > 0 && (
        <div className="flex flex-col gap-2">
          {scores.map((entry, idx) => {
            const rankCfg = RANK_CONFIG[idx];
            const isTop3 = idx < 3;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex items-center justify-between p-3.5 rounded-2xl transition-all"
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
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 flex justify-center shrink-0">
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
                      style={isTop3 ? { ringColor: rankCfg.color } : {}}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#3186FF]/15 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#3186FF]" />
                    </div>
                  )}

                  {/* Name */}
                  <span
                    className="font-semibold text-sm text-[#1E1E1E] truncate max-w-32"
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
        </div>
      )}
    </div>
  );
}
