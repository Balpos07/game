'use client';

import React, { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import { Menu, X } from 'lucide-react';

// Four-color GDG dot logo
function GdgIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {/* Simplified GDG dots: Blue, Red, Yellow, Green */}
      <circle cx="18" cy="10" r="6.5" fill="#3186FF" />
      <circle cx="26" cy="22" r="6.5" fill="#EA4335" />
      <circle cx="10" cy="22" r="6.5" fill="#FBBC05" />
      <circle cx="18" cy="30" r="5" fill="#34A853" />
    </svg>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#1E1E1E]/8 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <a href="/" aria-label="DevFest Ilorin 2026 Trivia home" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <GdgIcon size={34} />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[#1E1E1E] text-sm md:text-base">DevFest Ilorin</span>
            <span className="text-[10px] font-medium text-[#1E1E1E]/50 uppercase tracking-widest">Trivia 2026</span>
          </div>
        </a>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="https://devfestilorin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#1E1E1E]/70 hover:text-[#1E1E1E] transition-colors"
          >
            devfestilorin.com
          </a>
          <a
            href="https://gdg.community.dev/events/details/google-gdg-ilorin-presents-devfest-ilorin-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-2.5 !px-5 !text-sm"
          >
            Get Tickets
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3186FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 5H19V11"/><path d="M19 5L5 19"/>
              </svg>
            </span>
          </a>
          <LoginButton />
        </div>

        {/* Mobile: just login + burger */}
        <div className="flex sm:hidden items-center gap-3">
          <LoginButton />
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1E1E1E]/10 bg-white/70 text-[#1E1E1E] transition-colors hover:bg-white"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden mx-4 mb-3 rounded-2xl border border-[#1E1E1E]/8 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
          <div className="flex flex-col p-2 gap-1">
            <a
              href="https://devfestilorin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#1E1E1E] hover:bg-[#1E1E1E]/5 transition-colors"
            >
              devfestilorin.com ↗
            </a>
            <a
              href="https://gdg.community.dev/events/details/google-gdg-ilorin-presents-devfest-ilorin-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mx-2 my-1 text-sm"
            >
              Get Tickets
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
