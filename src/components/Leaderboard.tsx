'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy, Medal, User } from 'lucide-react';
import { motion } from 'framer-motion';

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  date: number;
  photoURL?: string;
};

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LeaderboardEntry[];
        setScores(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-6 w-full max-w-lg mt-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 w-full max-w-lg mt-6 text-left">
      <h2 className="text-xl font-bold flex items-center justify-center gap-2 mb-4 text-slate-800">
        <Trophy className="w-5 h-5 text-amber-500" />
        Global Leaderboard
      </h2>

      {scores.length === 0 ? (
        <p className="text-center text-slate-500 py-4">No scores yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {scores.map((entry, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={entry.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {idx === 0 ? <Medal className="text-yellow-500 w-6 h-6" /> :
                   idx === 1 ? <Medal className="text-slate-400 w-6 h-6" /> :
                   idx === 2 ? <Medal className="text-amber-700 w-6 h-6" /> :
                   <span className="font-bold text-slate-400">#{idx + 1}</span>}
                </div>
                {entry.photoURL ? (
                  <img src={entry.photoURL} alt={entry.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <span className="font-semibold text-slate-700">{entry.name}</span>
              </div>
              <span className="font-bold text-[#3b82f6]">{entry.score.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
