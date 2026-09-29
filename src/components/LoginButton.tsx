'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout } = useAuth();
  const [showEmailFlow, setShowEmailFlow] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-9 w-24 bg-[#1E1E1E]/10 animate-pulse rounded-full" />;
  }

  if (user) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#1E1E1E]/8 bg-white/60 px-2 py-1.5 shadow-sm backdrop-blur-sm sm:px-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-6 h-6 rounded-full ring-1 ring-[#3186FF]/30"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#3186FF]/15 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-[#3186FF]" />
            </div>
          )}
          <span className="max-w-20 truncate text-sm font-semibold text-[#1E1E1E] sm:max-w-32">
            {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Player'}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1E1E1E]/10 bg-white/70 text-[#1E1E1E]/50 transition-all hover:bg-[#EA4335]/8 hover:text-[#EA4335]"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {showEmailFlow ? (
        <form onSubmit={handleEmailSubmit} className="w-72 rounded-2xl border border-[#1E1E1E]/10 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setAuthMode('login')} className={`text-xs font-bold uppercase tracking-[0.12em] ${authMode === 'login' ? 'text-[#3186FF]' : 'text-[#1E1E1E]/45'}`}>
              Login
            </button>
            <button type="button" onClick={() => setAuthMode('signup')} className={`text-xs font-bold uppercase tracking-[0.12em] ${authMode === 'signup' ? 'text-[#3186FF]' : 'text-[#1E1E1E]/45'}`}>
              Sign up
            </button>
          </div>

          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]/45">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-[#1E1E1E]/10 bg-[#F7F8FA] px-3 py-2 text-sm text-[#1E1E1E] outline-none"
              required
            />
          </label>

          <label className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]/45">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              className="mt-1 w-full rounded-xl border border-[#1E1E1E]/10 bg-[#F7F8FA] px-3 py-2 text-sm text-[#1E1E1E] outline-none"
              required
              minLength={6}
            />
          </label>

          <button type="submit" disabled={submitting} className="btn-primary mt-3 w-full !py-2.5 !text-sm disabled:opacity-60">
            {submitting ? 'Please wait...' : authMode === 'login' ? 'Login with email' : 'Create account'}
          </button>

          <button type="button" onClick={() => setShowEmailFlow(false)} className="mt-2 text-center text-xs font-bold text-[#1E1E1E]/50">
            Close
          </button>
        </form>
      ) : (
        <>
          <button
            onClick={() => setShowEmailFlow(true)}
            className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            onClick={loginWithGoogle}
            className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5">
              <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.21-2.25H12v4.26h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.98-4.33 2.98-7.53Z"/>
              <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.08.95-3.38.95-2.6 0-4.8-1.76-5.58-4.13H.82v2.63A10 10 0 0 0 12 22Z"/>
              <path fill="#FBBC05" d="M6.42 20.84A6.1 6.1 0 0 1 6 17.9V15.3H2.76A10 10 0 0 0 2 12c0-1.63.39-3.17 1.08-4.53L6.42 10.1A5.9 5.9 0 0 1 6 12c0 1.08.26 2.12.72 3.05l-.3 5.79Z"/>
              <path fill="#EA4335" d="M12 3.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88A9.94 9.94 0 0 0 12 2a10 10 0 0 0-9.18 5.47l3.66 2.83A6 6 0 0 1 12 3.98Z"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}
      {error && (
        <p className="max-w-56 text-right text-xs text-[#EA4335]">{error}</p>
      )}
    </div>
  );
}
