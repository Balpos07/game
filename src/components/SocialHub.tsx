'use client';

import { useEffect, useState } from 'react';
import type { Question, QuestionCategory } from '@/types/quiz';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

type SocialScore = { name: string; score: number; correctAnswers: number; totalQuestions: number };

async function postCompetition(action: string, values: Record<string, unknown> = {}) {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new Error('Sign in with Google to use social challenges.');
  const token = await user.getIdToken();
  const response = await fetch('/api/competition', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...values }),
  });
  const data = await response.json() as { error?: string };
  if (!response.ok) throw new Error(data.error || 'The social challenge could not be completed.');
  return data;
}

export function SocialHub({
  questions,
  category,
  onStartChallenge,
}: {
  questions: Question[];
  category: QuestionCategory | 'all';
  onStartChallenge: (questions: Question[], challengeId: string, code: string, action: 'challenge_created' | 'challenge_joined') => void;
}) {
  const { user, loginWithGoogle } = useAuth();
  const [challengeCode, setChallengeCode] = useState('');
  const [crewCode, setCrewCode] = useState('');
  const [crewName, setCrewName] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [crewNameResult, setCrewNameResult] = useState('');
  const [crewScores, setCrewScores] = useState<SocialScore[] | null>(null);
  const pool = questions.filter(question => category === 'all' || question.category === category);

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage('');
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const createChallenge = () => runAction(async () => {
    if (pool.length < 5) throw new Error('At least five questions are needed for a friend challenge.');
    const selected = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    const result = await postCompetition('create-challenge', {
      questionIds: selected.map(question => question.id),
      category: category === 'all' ? 'mixed' : category,
    }) as { code: string; challengeId: string };
    setShareCode(result.code);
    onStartChallenge(selected, result.challengeId, result.code, 'challenge_created');
  });

  const joinChallenge = () => runAction(async () => {
    const result = await postCompetition('join-challenge', { code: challengeCode.trim() }) as {
      challengeId: string;
      questionIds: string[];
    };
    const selected = result.questionIds.map(id => questions.find(question => question.id === id));
    if (selected.some(question => !question)) throw new Error('This challenge includes questions that are no longer available.');
    setShareCode(challengeCode.trim().toUpperCase());
    onStartChallenge(selected as Question[], result.challengeId, challengeCode.trim().toUpperCase(), 'challenge_joined');
  });

  const createCrew = () => runAction(async () => {
    const result = await postCompetition('create-crew', { name: crewName }) as { code: string; name: string };
    setCrewCode(result.code);
    setCrewNameResult(result.name);
    setMessage(`Crew created. Share this invite code: ${result.code}`);
  });

  const joinCrew = () => runAction(async () => {
    const result = await postCompetition('join-crew', { code: crewCode.trim() }) as { name: string };
    setCrewNameResult(result.name);
    setMessage(`You joined ${result.name}.`);
  });

  const loadCrewScores = () => runAction(async () => {
    const result = await postCompetition('crew-board') as { crew: { name: string }; scores: SocialScore[] };
    setCrewNameResult(result.crew.name);
    setCrewScores(result.scores);
  });

  return (
    <section aria-labelledby="social-play-heading" className="mt-8 rounded-3xl border border-[#1E1E1E]/8 bg-white/80 p-5 shadow-sm sm:p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#3186FF]">Play together</p>
      <h2 id="social-play-heading" className="mt-1 text-xl font-extrabold text-[#1E1E1E]">Friends &amp; crews</h2>
      {!user || user.isAnonymous ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#3186FF]/5 p-4">
          <p className="text-sm text-[#1E1E1E]/65">Sign in with Google to create shareable challenges and join a crew.</p>
          <button type="button" onClick={loginWithGoogle} className="btn-primary">Sign in</button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1E1E1E]/8 p-4">
              <h3 className="font-bold text-[#1E1E1E]">Friend challenge</h3>
              <p className="mt-1 text-xs leading-5 text-[#1E1E1E]/55">Take the same five questions, then compare verified scores.</p>
              <button type="button" disabled={busy || pool.length < 5} onClick={() => void createChallenge()} className="btn-primary mt-3 w-full disabled:opacity-50">
                Create &amp; play
              </button>
              <form onSubmit={event => { event.preventDefault(); void joinChallenge(); }} className="mt-3 flex gap-2">
                <label className="sr-only" htmlFor="friend-challenge-code">Friend challenge code</label>
                <input id="friend-challenge-code" value={challengeCode} onChange={event => setChallengeCode(event.target.value.toUpperCase())} maxLength={16} placeholder="16-character code" className="min-w-0 flex-1 rounded-xl border border-[#1E1E1E]/15 px-3 py-2 text-sm" />
                <button type="submit" disabled={busy || challengeCode.trim().length !== 16} className="btn-secondary disabled:opacity-50">Join</button>
              </form>
              {shareCode && <p className="mt-3 break-all text-xs font-bold text-[#3186FF]">Challenge code: {shareCode}</p>}
            </div>

            <div className="rounded-2xl border border-[#1E1E1E]/8 p-4">
              <h3 className="font-bold text-[#1E1E1E]">Campus or crew</h3>
              <p className="mt-1 text-xs leading-5 text-[#1E1E1E]/55">Build a team of up to 100 players and compete on today&apos;s verified scores.</p>
              <form onSubmit={event => { event.preventDefault(); void createCrew(); }} className="mt-3 flex gap-2">
                <label className="sr-only" htmlFor="new-crew-name">New crew name</label>
                <input id="new-crew-name" value={crewName} onChange={event => setCrewName(event.target.value)} maxLength={40} minLength={3} placeholder="Name your crew" className="min-w-0 flex-1 rounded-xl border border-[#1E1E1E]/15 px-3 py-2 text-sm" />
                <button type="submit" disabled={busy || crewName.trim().length < 3} className="btn-secondary disabled:opacity-50">Create</button>
              </form>
              <form onSubmit={event => { event.preventDefault(); void joinCrew(); }} className="mt-2 flex gap-2">
                <label className="sr-only" htmlFor="crew-invite-code">Crew invite code</label>
                <input id="crew-invite-code" value={crewCode} onChange={event => setCrewCode(event.target.value.toUpperCase())} maxLength={16} placeholder="16-character invite code" className="min-w-0 flex-1 rounded-xl border border-[#1E1E1E]/15 px-3 py-2 text-sm" />
                <button type="submit" disabled={busy || crewCode.trim().length !== 16} className="btn-secondary disabled:opacity-50">Join</button>
              </form>
              <button type="button" onClick={() => void loadCrewScores()} disabled={busy} className="mt-3 text-sm font-bold text-[#3186FF] disabled:opacity-50">View crew leaderboard</button>
              {crewNameResult && <p className="mt-2 text-xs font-semibold text-[#1E1E1E]/65">{crewNameResult}</p>}
            </div>
          </div>
          {crewScores && (
            <div className="mt-4 rounded-2xl bg-[#1E1E1E]/4 p-4" aria-live="polite">
              <h3 className="font-bold text-[#1E1E1E]">Today&apos;s crew scores</h3>
              {crewScores.length ? crewScores.map((entry, index) => (
                <p key={`${entry.name}-${index}`} className="mt-2 flex justify-between gap-3 text-sm">
                  <span>{index + 1}. {entry.name} <span className="text-[#1E1E1E]/45">({entry.correctAnswers}/{entry.totalQuestions})</span></span>
                  <strong>{entry.score}</strong>
                </p>
              )) : <p className="mt-2 text-sm text-[#1E1E1E]/55">No verified crew scores yet today.</p>}
            </div>
          )}
        </>
      )}
      {message && <p role="status" className="mt-3 text-sm font-semibold text-[#1E1E1E]/70">{message}</p>}
    </section>
  );
}

export function ChallengeResults({
  challengeId,
  refreshToken,
}: {
  challengeId: string | null;
  refreshToken?: string;
}) {
  const { user } = useAuth();
  const [scores, setScores] = useState<SocialScore[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!challengeId || !user || user.isAnonymous) return;
    let active = true;
    void postCompetition('challenge-board', { challengeId }).then(result => {
      if (active) setScores((result as { scores: SocialScore[] }).scores);
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Challenge results unavailable.');
    });
    return () => { active = false; };
  }, [challengeId, user, refreshToken]);

  if (!challengeId) return null;
  return (
    <section className="w-full rounded-2xl border border-[#3186FF]/15 bg-[#3186FF]/5 p-4 text-left" aria-live="polite">
      <h2 className="font-extrabold text-[#1E1E1E]">Friend challenge results</h2>
      {error && <p className="mt-2 text-sm text-[#EA4335]">{error}</p>}
      {!scores && !error && <p className="mt-2 text-sm text-[#1E1E1E]/55">Loading challenge leaderboard…</p>}
      {scores?.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="mt-2 flex justify-between gap-3 text-sm">
          <span>{index + 1}. {entry.name} ({entry.correctAnswers}/{entry.totalQuestions})</span>
          <strong>{entry.score}</strong>
        </p>
      ))}
      {scores?.length === 0 && <p className="mt-2 text-sm text-[#1E1E1E]/55">No challenge scores submitted yet.</p>}
    </section>
  );
}
