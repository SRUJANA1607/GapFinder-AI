'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Sun, Moon, GraduationCap, Users } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';

export default function TopHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshUser = () => {
    const store = AppStore.getInstance();
    store.initStore();
    setUser(store.getUser());
  };

  useEffect(() => {
    refreshUser();
    window.addEventListener('gapfinder_user_changed', refreshUser);
    return () => window.removeEventListener('gapfinder_user_changed', refreshUser);
  }, []);

  const isTeacher = user?.role === 'teacher';

  const handleRoleToggle = () => {
    const store = AppStore.getInstance();
    if (isTeacher) {
      store.switchRole('student');
      router.push('/dashboard');
    } else {
      store.switchRole('teacher');
      router.push('/teacher');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Greeting & Active Role */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>{user?.name || (isTeacher ? 'Prof. Sarah Jenkins' : 'Alex Mercer')}</span>
          <span>{isTeacher ? '👨‍🏫' : '👋'}</span>
        </h2>

        <span
          className={`hidden md:inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
            isTeacher
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          {isTeacher ? 'CS301 (Section A) • 48 Students' : 'Course: CS301 Operating Systems'}
        </span>
      </div>

      {/* Right Metrics: Role Pill Switcher, Streak/XP, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Role Switcher Pill in Top Bar */}
        <button
          type="button"
          onClick={handleRoleToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition shadow-2xs border ${
            isTeacher
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 hover:scale-105'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600/40 text-indigo-700 dark:text-indigo-300 hover:scale-105'
          }`}
          title={`Currently in ${isTeacher ? 'Teacher' : 'Student'} mode. Click to switch to ${isTeacher ? 'Student' : 'Teacher'} mode.`}
        >
          {isTeacher ? (
            <>
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Teacher Mode</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Student Mode</span>
            </>
          )}
        </button>

        {/* Streak Pill */}
        <Link
          href={isTeacher ? '/teacher' : '/dashboard'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-2xs hover:scale-105 transition"
          title="Daily Activity Streak"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
          <span className="hidden sm:inline">{user?.streakDays || 4} Day Streak</span>
          <span className="sm:hidden">{user?.streakDays || 4}d</span>
        </Link>

        {/* XP Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span>Lvl {user?.level || 1}</span>
          <span className="text-[10px] text-indigo-500 font-normal">({user?.xp || 0} XP)</span>
        </div>

        {/* 1-Click Theme Toggle Button */}
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
