'use client';

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/account-exists-with-different-credential': 'This account already exists with a different sign-in method.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-not-found': 'No account matches that email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account already exists with this email address.',
  'auth/weak-password': 'Use a stronger password with at least 6 characters.',
  'auth/network-request-failed': 'Network connection failed. Please try again.',
};

function getAuthErrorMessage(error: unknown, fallback: string): string {
  const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : null;

  if (typeof errorCode === 'string' && AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }

  return fallback;
}

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
    } catch (error: unknown) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : null;

      if (errorCode === 'auth/popup-closed-by-user') {
        setError(null);
        return;
      }

      console.error('Error signing in with Google:', error);
      setError(getAuthErrorMessage(error, 'Google sign-in is unavailable. Check the Firebase provider and authorized domain.'));
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      console.error('Error signing in with email:', error);
      setError(getAuthErrorMessage(error, 'Unable to sign in with email and password.'));
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      console.error('Error creating account with email:', error);
      setError(getAuthErrorMessage(error, 'Unable to create a new account with this email.'));
      setLoading(false);
    }
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout };
}
