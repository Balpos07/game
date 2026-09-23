'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function LoginButton() {
  const { user, loading, error, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-24 bg-slate-200 animate-pulse rounded-full"></div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
          ) : (
            <User className="w-5 h-5 text-slate-500" />
          )}
          <span className="text-sm font-semibold text-slate-700">{user.displayName?.split(' ')[0] || 'Player'}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={loginWithGoogle}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-semibold transition-all shadow-md active:scale-95"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>
      {error && <p className="max-w-72 text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
