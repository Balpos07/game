'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { ArrowLeft, LoaderCircle, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, X } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseDb } from '@/lib/firebase';
import type { DifficultyLevel, Question, QuestionCategory } from '@/types/quiz';
import { CommunityContent, DEFAULT_COMMUNITY_CONTENT } from '@/types/community';
import { DEFAULT_TRIVIA_QUESTIONS } from '@/data/questions';
import { ADMIN_UID } from '@/lib/admin';

const emptyForm = {
  category: 'technology' as QuestionCategory,
  difficulty: 'easy' as DifficultyLevel,
  question_text: '',
  options: ['', '', '', ''],
  correct_option_index: 0,
  explanation: '',
  time_limit_seconds: 15,
};

export default function AdminPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [firebaseQuestionIds, setFirebaseQuestionIds] = useState<Set<string>>(new Set());
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [replacingQuestions, setReplacingQuestions] = useState(false);
  const [message, setMessage] = useState('');
  const [communityContent, setCommunityContent] = useState<CommunityContent>(DEFAULT_COMMUNITY_CONTENT);
  const [organizersText, setOrganizersText] = useState('');
  const [contentType, setContentType] = useState<'speaker' | 'organizer'>('speaker');

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        setIsAdmin(false);
        return;
      }
      const db = getFirebaseDb();
      if (!db) {
        setCheckingAccess(false);
        return;
      }
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      setIsAdmin(adminDoc.exists() || user.uid === ADMIN_UID);
      setCheckingAccess(false);
    };
    if (!authLoading) void checkAccess();
  }, [authLoading, user]);

  useEffect(() => {
    if (!isAdmin) return;
    const db = getFirebaseDb();
    if (!db) return;
    getDoc(doc(db, 'communityContent', 'current')).then(snapshot => {
      if (!snapshot.exists()) return;
      const saved = { ...DEFAULT_COMMUNITY_CONTENT, ...snapshot.data() } as CommunityContent;
      setCommunityContent(saved);
      setOrganizersText(saved.organizers.map(organizer => `${organizer.name} | ${organizer.role} | ${organizer.contact}`).join('\n'));
    });
    return onSnapshot(collection(db, 'questions'), snapshot => {
      const firebaseQuestions = snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as Question);
      const questionBank = new Map(DEFAULT_TRIVIA_QUESTIONS.map(question => [question.id, question]));
      firebaseQuestions.forEach(question => questionBank.set(question.id, question));
      setQuestions([...questionBank.values()]);
      setFirebaseQuestionIds(new Set(firebaseQuestions.map(question => question.id)));
    });
  }, [isAdmin]);

  const saveCommunityContent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const db = getFirebaseDb();
    if (!db) return;
    const organizers = organizersText.split('\n').map(line => {
      const [name = '', role = '', contact = ''] = line.split('|').map(value => value.trim());
      return { name, role, contact };
    }).filter(organizer => organizer.name);
    await setDoc(doc(db, 'communityContent', 'current'), { ...communityContent, organizers }, { merge: true });
    setMessage('Community content updated in Firebase.');
  };

  const saveQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.question_text.trim() || form.options.some(option => !option.trim()) || !form.explanation.trim()) {
      setMessage('Complete the question, all four options, and explanation.');
      return;
    }
    const db = getFirebaseDb();
    if (!db) return;
    setSaving(true);
    setMessage('');
    try {
      const questionId = editingQuestionId || crypto.randomUUID();
      await setDoc(doc(db, 'questions', questionId), {
        ...form,
        id: questionId,
        options: form.options.map(option => option.trim()),
        question_text: form.question_text.trim(),
        explanation: form.explanation.trim(),
      });
      setForm(emptyForm);
      setEditingQuestionId(null);
      setMessage(editingQuestionId ? 'Question updated. New games will use the corrected question.' : 'Question added to Firebase.');
    } catch (error) {
      console.error('Question save failed:', error);
      setMessage('Could not save the question. Check your permissions.');
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setForm({
      category: question.category,
      difficulty: question.difficulty,
      question_text: question.question_text,
      options: [...question.options],
      correct_option_index: question.correct_option_index,
      explanation: question.explanation,
      time_limit_seconds: question.time_limit_seconds,
    });
    setMessage('');
    document.getElementById('question-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setForm(emptyForm);
    setMessage('');
  };

  const removeQuestion = async (questionId: string) => {
    const db = getFirebaseDb();
    if (!db || !window.confirm('Delete this question?')) return;
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      setMessage('Question deleted from Firebase.');
    } catch (error) {
      console.error('Question deletion failed:', error);
      setMessage('Could not delete the question. Check your permissions.');
    }
  };

  const replaceQuestionBank = async () => {
    if (!window.confirm(`Replace every question in Firebase with the ${DEFAULT_TRIVIA_QUESTIONS.length} starter trivia questions? This cannot be undone.`)) return;

    const db = getFirebaseDb();
    if (!db) {
      setMessage('Firebase is not configured.');
      return;
    }

    setReplacingQuestions(true);
    setMessage('');
    try {
      const questionSnapshot = await getDocs(collection(db, 'questions'));
      const questionIds = new Set(DEFAULT_TRIVIA_QUESTIONS.map(question => question.id));
      const oldQuestionCount = questionSnapshot.docs.filter(question => !questionIds.has(question.id)).length;
      if (oldQuestionCount + DEFAULT_TRIVIA_QUESTIONS.length > 500) {
        throw new Error('The Firebase question collection is too large to replace in a single batch.');
      }

      const batch = writeBatch(db);
      questionSnapshot.docs.forEach(question => {
        if (!questionIds.has(question.id)) batch.delete(question.ref);
      });
      DEFAULT_TRIVIA_QUESTIONS.forEach(question => {
        batch.set(doc(db, 'questions', question.id), question);
      });
      await batch.commit();
      setMessage(`Firebase question bank replaced with all ${DEFAULT_TRIVIA_QUESTIONS.length} starter trivia questions.`);
    } catch (error) {
      console.error('Question bank replacement failed:', error);
      setMessage(error instanceof Error ? error.message : 'Could not replace the Firebase question bank.');
    } finally {
      setReplacingQuestions(false);
    }
  };

  if (authLoading || checkingAccess) {
    return <div className="min-h-screen"><Header /><div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-[#3186FF]" /></div></div>;
  }

  if (!user) {
    return <div className="min-h-screen"><Header /><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center"><ShieldCheck className="h-10 w-10 text-[#3186FF]" /><h1 className="mt-5 text-3xl font-extrabold text-[#1E1E1E]">Admin sign-in required</h1><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Sign in with your Google account to access the content dashboard.</p><button onClick={loginWithGoogle} className="btn-primary mt-6">Sign in with Google</button></main></div>;
  }

  if (!isAdmin) {
    return <div className="min-h-screen"><Header /><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center"><ShieldCheck className="h-10 w-10 text-[#EA4335]" /><h1 className="mt-5 text-3xl font-extrabold text-[#1E1E1E]">Access not granted</h1><p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Your Google account is signed in, but it is not listed as an administrator.</p><Link href="/" className="btn-secondary mt-6">Return home</Link></main></div>;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#3186FF]"><ArrowLeft className="h-4 w-4" /> Back to trivia</Link>
        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">Firebase content studio</p><h1 className="mt-2 text-4xl font-extrabold text-[#1E1E1E] sm:text-6xl">Admin dashboard</h1></div><span className="rounded-full bg-[#34A853]/10 px-3 py-2 text-xs font-bold text-[#277D3E]">Admin access confirmed</span></div>
        <nav aria-label="Admin tools" className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/reports" className="rounded-2xl border border-[#1E1E1E]/8 bg-white/75 p-4 transition hover:border-[#3186FF]/30 hover:shadow-sm"><span className="font-extrabold text-[#1E1E1E]">Review question reports</span><span className="mt-1 block text-xs leading-5 text-[#1E1E1E]/55">Triage player-submitted issues and close resolved reports.</span></Link>
          <Link href="/admin/engagement" className="rounded-2xl border border-[#1E1E1E]/8 bg-white/75 p-4 transition hover:border-[#3186FF]/30 hover:shadow-sm"><span className="font-extrabold text-[#1E1E1E]">Player engagement</span><span className="mt-1 block text-xs leading-5 text-[#1E1E1E]/55">See repeat play and challenge return rates by question category.</span></Link>
        </nav>
        <section className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <form id="question-editor" onSubmit={saveQuestion} className="glass-card scroll-mt-24 p-6 sm:p-8">
            <div className="flex items-center gap-3">{editingQuestionId ? <Pencil className="h-5 w-5 text-[#3186FF]" /> : <Plus className="h-5 w-5 text-[#3186FF]" />}<h2 className="text-xl font-extrabold text-[#1E1E1E]">{editingQuestionId ? 'Edit reported question' : 'Add a question'}</h2></div>
            <textarea required value={form.question_text} onChange={event => setForm({ ...form, question_text: event.target.value })} placeholder="Question text" className="mt-6 min-h-24 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm outline-none" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as QuestionCategory })} className="rounded-xl border border-[#1E1E1E]/10 bg-white p-3 text-sm"><option value="nigerian_culture">Nigerian culture</option><option value="geography">Geography</option><option value="world_capitals">World capitals</option><option value="landmarks">Landmarks</option><option value="history">History</option><option value="technology">Technology</option></select><select value={form.difficulty} onChange={event => setForm({ ...form, difficulty: event.target.value as DifficultyLevel })} className="rounded-xl border border-[#1E1E1E]/10 bg-white p-3 text-sm"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
            <div className="mt-3 space-y-2">{form.options.map((option, index) => <input key={index} required value={option} onChange={event => setForm({ ...form, options: form.options.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm outline-none" />)}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><select value={form.correct_option_index} onChange={event => setForm({ ...form, correct_option_index: Number(event.target.value) })} className="rounded-xl border border-[#1E1E1E]/10 bg-white p-3 text-sm"><option value={0}>Correct: A</option><option value={1}>Correct: B</option><option value={2}>Correct: C</option><option value={3}>Correct: D</option></select><input type="number" min={5} max={60} value={form.time_limit_seconds} onChange={event => setForm({ ...form, time_limit_seconds: Number(event.target.value) })} className="rounded-xl border border-[#1E1E1E]/10 bg-white p-3 text-sm" /></div>
            <textarea required value={form.explanation} onChange={event => setForm({ ...form, explanation: event.target.value })} placeholder="Answer explanation" className="mt-3 min-h-20 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm outline-none" />
            <button disabled={saving} className="btn-primary mt-4 w-full disabled:opacity-50">{saving ? 'Saving...' : editingQuestionId ? 'Save question correction' : 'Add question'}</button>
            {editingQuestionId && <button type="button" onClick={cancelQuestionEdit} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#1E1E1E]/10 px-4 py-2.5 text-sm font-bold text-[#1E1E1E]/65"><X className="h-4 w-4" /> Cancel editing</button>}
            {message && <p className="mt-3 text-sm text-[#1E1E1E]/60">{message}</p>}
          </form>

          <section className="glass-card p-6 sm:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">Live collection</p><h2 className="mt-2 text-xl font-extrabold text-[#1E1E1E]">Playable questions</h2></div><span className="rounded-full bg-[#3186FF]/10 px-3 py-2 text-xs font-bold text-[#3186FF]">{questions.length} total</span></div><button type="button" onClick={replaceQuestionBank} disabled={replacingQuestions || saving} className="btn-secondary mt-5 w-full justify-center disabled:cursor-wait disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${replacingQuestions ? 'animate-spin' : ''}`} />{replacingQuestions ? 'Replacing questions...' : `Replace with all ${DEFAULT_TRIVIA_QUESTIONS.length} starter questions`}</button><p className="mt-2 text-xs leading-5 text-[#1E1E1E]/50">This removes the existing Firebase question set and installs the starter technology, Nigerian culture, and Nigerian history questions.</p><div className="mt-6 space-y-3">{questions.map(question => <div id={`question-${question.id}`} key={question.id} className="scroll-mt-24 flex items-start justify-between gap-4 rounded-xl border border-[#1E1E1E]/8 bg-white/50 p-4"><div className="min-w-0"><p className="text-sm font-bold text-[#1E1E1E]">{question.question_text}</p><p className="mt-1 text-xs capitalize text-[#1E1E1E]/50">{question.category.replace('_', ' ')} · {question.difficulty}{firebaseQuestionIds.has(question.id) ? '' : ' · local question'}</p></div><div className="flex shrink-0 items-center gap-1"><button type="button" title="Edit question" aria-label={`Edit question: ${question.question_text}`} onClick={() => editQuestion(question)} className="rounded-full p-2 text-[#3186FF] transition-colors hover:bg-[#3186FF]/10"><Pencil className="h-4 w-4" /></button><button type="button" title={firebaseQuestionIds.has(question.id) ? 'Delete question' : 'Local question cannot be deleted here'} aria-label={`Delete question: ${question.question_text}`} disabled={!firebaseQuestionIds.has(question.id)} onClick={() => removeQuestion(question.id)} className="rounded-full p-2 text-[#EA4335] transition-colors hover:bg-[#EA4335]/10 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div></div>)}</div></section>
        </section>

        <form onSubmit={saveCommunityContent} className="glass-card mt-4 p-6 sm:p-8">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#EA4335]">Community content</p><h2 className="mt-2 text-2xl font-extrabold text-[#1E1E1E]">Weekly prompt, speaker, and organizers</h2></div>
          <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Question of the week<textarea value={communityContent.questionOfWeek} onChange={event => setCommunityContent({ ...communityContent, questionOfWeek: event.target.value })} className="mt-2 min-h-20 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none" /></label>
          <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Poll options, one per line<textarea value={communityContent.pollOptions.join('\n')} onChange={event => setCommunityContent({ ...communityContent, pollOptions: event.target.value.split('\n').map(value => value.trim()).filter(Boolean) })} className="mt-2 min-h-24 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none" /></label>
          <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">I am adding<select value={contentType} onChange={event => setContentType(event.target.value as 'speaker' | 'organizer')} className="mt-2 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none"><option value="speaker">A speaker</option><option value="organizer">An organizer</option></select></label>
          {contentType === 'speaker' && <><div className="mt-6 grid gap-3 sm:grid-cols-2"><input value={communityContent.speaker.name} onChange={event => setCommunityContent({ ...communityContent, speaker: { ...communityContent.speaker, name: event.target.value } })} placeholder="Speaker name" className="rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm" /><input value={communityContent.speaker.topic} onChange={event => setCommunityContent({ ...communityContent, speaker: { ...communityContent.speaker, topic: event.target.value } })} placeholder="Speaker topic" className="rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm" /><input value={communityContent.speaker.photoURL} onChange={event => setCommunityContent({ ...communityContent, speaker: { ...communityContent.speaker, photoURL: event.target.value } })} placeholder="Speaker photo URL" className="rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm" /><input value={communityContent.speaker.linkedin} onChange={event => setCommunityContent({ ...communityContent, speaker: { ...communityContent.speaker, linkedin: event.target.value } })} placeholder="LinkedIn URL" className="rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm" /></div><textarea value={communityContent.speaker.bio} onChange={event => setCommunityContent({ ...communityContent, speaker: { ...communityContent.speaker, bio: event.target.value } })} placeholder="Speaker bio" className="mt-3 min-h-24 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm" /></>}
          {contentType === 'organizer' && <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-[#1E1E1E]/45">Organizers, one per line: Name | Role | Contact<textarea value={organizersText} onChange={event => setOrganizersText(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-[#1E1E1E]/10 bg-white/70 p-3 text-sm normal-case tracking-normal outline-none" /></label>}
          <button className="btn-primary mt-5">Save community content</button>
        </form>
      </main>
    </div>
  );
}
