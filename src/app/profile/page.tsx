'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { Award, ArrowLeft, BarChart3, LoaderCircle, Save, User } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { XP_PER_LEVEL } from '@/lib/playerProgress';
import { getFirebaseDb } from '@/lib/firebase';

type ProfileForm = { displayName: string; photoURL: string };
type ScoreRecord = { uid?: string; score?: number; correctAnswers?: number; totalQuestions?: number };

export default function ProfilePage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const { progress, error: progressError, cloudConnected } = usePlayerProgress(
    user && !user.isAnonymous ? user.uid : null,
    authLoading,
  );
  const [form, setForm] = useState<ProfileForm>({ displayName: '', photoURL: '' });
  const [games, setGames] = useState<ScoreRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDb();
    if (!db) return;
    getDoc(doc(db, 'profiles', user.uid)).then(snapshot => {
      const profile = snapshot.data();
      setForm({ displayName: profile?.displayName || user.displayName || '', photoURL: profile?.photoURL || user.photoURL || '' });
    });
    return onSnapshot(collection(db, 'leaderboard'), snapshot => {
      setGames(snapshot.docs.map(item => item.data() as ScoreRecord).filter(item => item.uid === user.uid));
    });
  }, [user]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || user.isAnonymous) return;
    const db = getFirebaseDb();
    if (!db) return;
    setSaving(true);
    await setDoc(doc(db, 'profiles', user.uid), { ...form, uid: user.uid, updatedAt: Date.now() }, { merge: true });
    setMessage('Profile updated.');
    setSaving(false);
  };

  if (authLoading) return <div className="min-h-screen"><Header /><div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-[#3186FF]" /></div></div>;
  if (!user || user.isAnonymous) return <div className="min-h-screen"><Header /><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center"><User className="h-10 w-10 text-[#3186FF]" /><h1 className="mt-5 text-3xl font-extrabold text-[#1E1E1E]">Your player profile</h1><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Sign in with Google to manage your profile and see your trivia history.</p><button onClick={loginWithGoogle} className="btn-primary mt-6">Sign in with Google</button></main></div>;

  const totalCorrect = games.reduce((sum, game) => sum + (game.correctAnswers || 0), 0);
  const totalQuestions = games.reduce((sum, game) => sum + (game.totalQuestions || 0), 0);
  const bestScore = games.reduce((best, game) => Math.max(best, game.score || 0), 0);
  const averageScore = games.length ? Math.round(games.reduce((sum, game) => sum + (game.score || 0), 0) / games.length) : 0;
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const badges = [
    ['First game', games.length >= 1],
    ['High scorer', bestScore >= 1000],
    ['Accuracy ace', accuracy >= 80],
    ['Regular', games.length >= 5],
  ];

  return (
    <div className="min-h-screen"><Header /><main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#3186FF]"><ArrowLeft className="h-4 w-4" /> Back to trivia</Link><div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">Player profile</p><h1 className="mt-2 text-4xl font-extrabold text-[#1E1E1E] sm:text-6xl">Your progress, in one place.</h1></div>
      <section className="mt-10 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <form onSubmit={saveProfile} className="glass-card p-6 sm:p-8"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-[#3186FF]/12 text-2xl font-extrabold text-[#3186FF]">{form.photoURL ? <img src={form.photoURL} alt="Profile" className="h-full w-full object-cover" /> : (form.displayName || user.email || 'P').charAt(0).toUpperCase()}</div><h2 className="mt-6 text-xl font-extrabold text-[#1E1E1E]">Profile details</h2><label className="mt-5 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Display name<input value={form.displayName} onChange={event => setForm({ ...form, displayName: event.target.value })} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none" /></label><label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Photo URL<input type="url" value={form.photoURL} onChange={event => setForm({ ...form, photoURL: event.target.value })} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none" /></label><button disabled={saving} className="btn-primary mt-5 w-full disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save profile'}</button>{message && <p className="mt-3 text-sm text-[#34A853]">{message}</p>}</form>
        <div><div className="grid gap-3 sm:grid-cols-2"><div className="glass-card p-5"><BarChart3 className="h-5 w-5 text-[#3186FF]" /><p className="mt-6 text-3xl font-extrabold text-[#1E1E1E]">{progress.gamesPlayed || games.length}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Games played</p></div><div className="glass-card p-5"><Award className="h-5 w-5 text-[#FBBC05]" /><p className="mt-6 text-3xl font-extrabold text-[#1E1E1E]">{bestScore}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Best score</p></div><div className="glass-card p-5"><p className="text-2xl font-extrabold text-[#34A853]">{accuracy}%</p><p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Accuracy</p></div><div className="glass-card p-5"><p className="text-2xl font-extrabold text-[#EA4335]">{averageScore}</p><p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Average score</p></div></div><div className="glass-card mt-4 p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3186FF]">Achievements</p><div className="mt-4 grid grid-cols-2 gap-2">{badges.map(([label, unlocked]) => <div key={label as string} className={`rounded-xl border p-3 text-sm font-bold ${unlocked ? 'border-[#FBBC05]/30 bg-[#FBBC05]/10 text-[#1E1E1E]' : 'border-[#1E1E1E]/8 text-[#1E1E1E]/30'}`}>{label as string}</div>)}</div></div></div>
      </section>
      <section className="glass-card mt-4 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">Trivia explorer</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">Level {Math.floor(progress.xp / XP_PER_LEVEL) + 1}</h2>
          </div>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#34A853]/10 text-3xl">{progress.avatar}</span>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm font-bold text-[#1E1E1E]">
          <span>{progress.xp.toLocaleString()} XP</span>
          <span className="text-[#1E1E1E]/50">{progress.xp % XP_PER_LEVEL}/{XP_PER_LEVEL} to next level</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1E1E1E]/8" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={progress.xp % XP_PER_LEVEL}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#34A853] to-[#85D99B]" style={{ width: `${((progress.xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100}%` }} />
        </div>
        <p className="mt-4 text-sm text-[#1E1E1E]/60">
          {cloudConnected ? 'Your explorer progress is synced to your account.' : 'Progress syncs when your account connection is ready.'}
        </p>
        {progressError && <p role="status" className="mt-2 text-sm text-[#EA4335]">{progressError}</p>}
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            { title: 'Lagos Mainland', level: 1 },
            { title: 'Open Road', level: 2 },
            { title: 'History Square', level: 3 },
          ].map(location => {
            const unlocked = Math.floor(progress.xp / XP_PER_LEVEL) + 1 >= location.level;
            return <div key={location.title} className={`rounded-xl border p-3 text-sm font-bold ${unlocked ? 'border-[#34A853]/20 bg-[#34A853]/5 text-[#277D3E]' : 'border-[#1E1E1E]/8 text-[#1E1E1E]/40'}`}>
              {unlocked ? '✓ ' : '🔒 '}{location.title}{!unlocked && <span className="block pt-1 text-xs font-medium">Unlock at level {location.level}</span>}
            </div>;
          })}
        </div>
      </section>
      <section className="glass-card mt-4 p-6"><h2 className="text-xl font-extrabold text-[#1E1E1E]">Recent scores</h2><div className="mt-4 space-y-2">{games.length === 0 ? <p className="text-sm text-[#1E1E1E]/55">Complete your first game to see it here.</p> : games.slice(-10).reverse().map((game, index) => <div key={`${game.score}-${index}`} className="flex items-center justify-between rounded-xl bg-[#1E1E1E]/4 p-3 text-sm"><span className="text-[#1E1E1E]/60">{game.correctAnswers || 0}/{game.totalQuestions || 0} correct</span><span className="font-bold text-[#3186FF]">{game.score || 0} points</span></div>)}</div></section>
    </main></div>
  );
}
