'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { getDoc, doc } from 'firebase/firestore';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase';
import { ADMIN_UID } from '@/lib/admin';

type AccessState = 'checking' | 'allowed' | 'denied' | 'error';

export default function AdminOnly({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { user, loading, loginWithGoogle } = useAuth();
  const [access, setAccess] = useState<AccessState>('checking');
  const [checkedUid, setCheckedUid] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || !user || user.isAnonymous || !isFirebaseConfigured()) return;
    const db = getFirebaseDb();
    if (!db) return;

    let active = true;
    void getDoc(doc(db, 'admins', user.uid)).then(snapshot => {
      if (active) {
        setCheckedUid(user.uid);
        setAccess(snapshot.exists() || user.uid === ADMIN_UID ? 'allowed' : 'denied');
      }
    }).catch(reason => {
      console.error('Admin access check failed:', reason);
      if (active) {
        setCheckedUid(user.uid);
        setError('Could not verify administrator access.');
        setAccess('error');
      }
    });
    return () => { active = false; };
  }, [loading, user]);

  const visibleAccess: AccessState = loading
    ? 'checking'
    : !user || user.isAnonymous
      ? 'denied'
      : !isFirebaseConfigured()
        ? 'error'
        : checkedUid !== user.uid
          ? 'checking'
          : access;
  const visibleError = !isFirebaseConfigured() ? 'Firebase is not configured.' : error;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <Link href="/admin" className="text-sm font-bold text-[#3186FF] hover:underline">← Admin dashboard</Link>
        {visibleAccess === 'checking' && (
          <div className="flex min-h-72 items-center justify-center" role="status" aria-label="Checking administrator access">
            <LoaderCircle className="h-7 w-7 animate-spin text-[#3186FF]" />
          </div>
        )}
        {visibleAccess === 'denied' && (
          <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
            <ShieldCheck className="h-10 w-10 text-[#3186FF]" />
            <h1 className="mt-5 text-3xl font-extrabold text-[#1E1E1E]">Admin access required</h1>
            <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/60">Sign in with an authorized Google account to view {title.toLowerCase()}.</p>
            {(!user || user.isAnonymous) && <button type="button" onClick={loginWithGoogle} className="btn-primary mt-6">Sign in with Google</button>}
          </section>
        )}
        {visibleAccess === 'error' && <p role="alert" className="mt-8 rounded-2xl bg-[#EA4335]/8 p-4 text-sm text-[#9F2C23]">{visibleError}</p>}
        {visibleAccess === 'allowed' && (
          <>
            <div className="mt-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#3186FF]">Content operations</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[#1E1E1E] sm:text-4xl">{title}</h1>
            </div>
            {children}
          </>
        )}
      </main>
    </div>
  );
}
