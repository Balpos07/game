'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User, X, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, error, loginWithGoogle, loginWithEmail, signUpWithEmail, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-[#1E1E1E]/10" />;
  }

  if (user) {
    return (
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-[#1E1E1E]/8 bg-white/60 px-2 py-1.5 shadow-sm backdrop-blur-sm sm:px-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="h-6 w-6 rounded-full ring-1 ring-[#3186FF]/30"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3186FF]/15">
              <User className="h-3.5 w-3.5 text-[#3186FF]" />
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
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-secondary !px-4 !py-2 !text-sm"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1E1E1E]/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#1E1E1E]/10 bg-white p-5 shadow-[0_30px_90px_rgba(17,24,39,0.18)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3186FF]">Welcome</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#1E1E1E]">Sign in</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1E1E1E]/10 bg-[#1E1E1E]/3 text-[#1E1E1E]/60 transition-colors hover:bg-[#1E1E1E]/6"
                aria-label="Close sign-in dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#1E1E1E]/10 bg-[#1E1E1E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.21-2.25H12v4.26h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.98-4.33 2.98-7.53Z"/>
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.23-2.5c-.9.6-2.08.95-3.38.95-2.6 0-4.8-1.76-5.58-4.13H.82v2.63A10 10 0 0 0 12 22Z"/>
                <path fill="#FBBC05" d="M6.42 20.84A6.1 6.1 0 0 1 6 17.9V15.3H2.76A10 10 0 0 0 2 12c0-1.63.39-3.17 1.08-4.53L6.42 10.1A5.9 5.9 0 0 1 6 12c0 1.08.26 2.12.72 3.05l-.3 5.79Z"/>
                <path fill="#EA4335" d="M12 3.98c1.47 0 2.8.5 3.84 1.49l2.88-2.88A9.94 9.94 0 0 0 12 2a10 10 0 0 0-9.18 5.47l3.66 2.83A6 6 0 0 1 12 3.98Z"/>
              </svg>
              {googleLoading ? 'Opening Google...' : 'Continue with Google'}
            </button>

            <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E1E1E]/35">
              <span className="h-px flex-1 bg-[#1E1E1E]/10" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-[#1E1E1E]/10" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div className="flex items-center justify-between rounded-full border border-[#1E1E1E]/10 bg-[#F7F8FA] px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`text-xs font-bold uppercase tracking-[0.14em] ${authMode === 'login' ? 'text-[#3186FF]' : 'text-[#1E1E1E]/50'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`text-xs font-bold uppercase tracking-[0.14em] ${authMode === 'signup' ? 'text-[#3186FF]' : 'text-[#1E1E1E]/50'}`}
                >
                  Sign up
                </button>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Email</span>
                <div className="flex items-center gap-2 rounded-2xl border border-[#1E1E1E]/10 bg-[#F7F8FA] px-3 py-3">
                  <Mail className="h-4 w-4 text-[#1E1E1E]/35" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-0 bg-transparent text-sm text-[#1E1E1E] placeholder:text-[#1E1E1E]/35 focus:outline-none"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E1E1E]/45">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-[#1E1E1E]/10 bg-[#F7F8FA] px-3 py-3">
                  <Lock className="h-4 w-4 text-[#1E1E1E]/35" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border-0 bg-transparent text-sm text-[#1E1E1E] placeholder:text-[#1E1E1E]/35 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </label>

              {error && (
                <p className="rounded-xl border border-[#EA4335]/15 bg-[#EA4335]/5 px-3 py-2 text-xs text-[#EA4335]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3186FF] to-[#6D97FF] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(49,134,255,0.35)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Please wait...' : authMode === 'login' ? 'Login with email' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
