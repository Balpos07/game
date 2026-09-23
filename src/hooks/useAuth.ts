'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => isFirebaseConfigured());
  const [error, setError] = useState<string | null>(() => (
    isFirebaseConfigured()
      ? null
      : 'Sign-in is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local.'
  ));

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Sign-in is unavailable. Check the Firebase Google provider and authorized domain.");
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, loading, error, loginWithGoogle, logout };
}
