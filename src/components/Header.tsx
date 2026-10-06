'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoginButton from './LoginButton';
import { Menu, X } from 'lucide-react';

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
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        {/* Logo */}
        <Link href="/" aria-label="DevN'Visuals Trivia home" className="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-80 sm:gap-2.5">
          <Image src="/dnv-logo.png" width={420} height={419} alt="" className="h-[22px] w-auto sm:h-[26px]" />
          {/* <div className="flex flex-col leading-none">
            <span className="font-bold text-[#1E1E1E] text-sm md:text-base">DevN&apos;Visuals</span>
            <span className="text-[10px] font-medium text-[#1E1E1E]/50 uppercase tracking-widest">Trivia</span>
          </div> */}
        </Link>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/compete"
            className="text-sm font-medium text-[#1E1E1E]/70 hover:text-[#1E1E1E] transition-colors"
          >
            Compete
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium text-[#1E1E1E]/70 hover:text-[#1E1E1E] transition-colors"
          >
            Community
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-[#1E1E1E]/70 hover:text-[#1E1E1E] transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/"
            className="btn-primary !py-2.5 !px-5 !text-sm"
          >
            Play Now
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3186FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 5H19V11"/><path d="M19 5L5 19"/>
              </svg>
            </span>
          </Link>
          <LoginButton />
        </div>

        {/* Mobile: just login + burger */}
        <div className="flex shrink-0 items-center gap-2 sm:hidden">
          <LoginButton />
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1E1E1E]/10 bg-white/70 text-[#1E1E1E] transition-colors hover:bg-white"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div id="mobile-navigation" className="sm:hidden mx-4 mb-3 rounded-2xl border border-[#1E1E1E]/8 bg-white/90 backdrop-blur shadow-lg overflow-hidden">
          <div className="flex flex-col p-2 gap-1">
            <Link
              href="/compete"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#1E1E1E]/5"
            >
              Compete ↗
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#1E1E1E] hover:bg-[#1E1E1E]/5 transition-colors"
            >
              Community ↗
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-[#1E1E1E] transition-colors hover:bg-[#1E1E1E]/5"
            >
              Profile ↗
            </Link>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mx-2 my-1 text-sm"
            >
              Play Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
