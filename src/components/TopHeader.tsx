'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';

export default function TopHeader() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setUser(store.getUser());
  }, []);

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>{user?.name || 'Alex Mercer'}</span>
          <span className="text-amber-500">👋</span>
        </h2>
        <span className="hidden md:inline-flex rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
          Course: CS301 Operating Systems
        </span>
      </div>

      {/* Right Metrics: Streak, XP, Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Streak Pill */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs hover:scale-105 transition"
          title="Daily Study Streak"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{user?.streakDays || 1} Day Streak</span>
        </Link>

        {/* XP Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span>Lvl {user?.level || 1}</span>
          <span className="text-[10px] text-indigo-500 font-normal">({user?.xp || 0} XP)</span>
        </div>

        {/* 1-Click Theme Toggle Button with explicit title and icon */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs text-xs font-semibold"
          title={`Click to switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
