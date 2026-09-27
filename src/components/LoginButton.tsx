'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, error, loginWithGoogle, logout } = useAuth();

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
            {user.displayName?.split(' ')[0] || 'Player'}
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
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={loginWithGoogle}
        className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </button>
      {error && (
        <p className="text-xs text-[#EA4335] max-w-56 text-right">{error}</p>
      )}
    </div>
  );
}
