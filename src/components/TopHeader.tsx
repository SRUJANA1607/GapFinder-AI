'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, Zap, Sun, Moon, GraduationCap, Users, User, LogOut, Loader2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function TopHeader() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refreshUser = async () => {
    const store = AppStore.getInstance();
    store.initStore();
    let currentUser = store.getUser();

    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const email = authUser.email || '';
        const name =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          (email ? email.split('@')[0] : 'Student');
        const role = authUser.user_metadata?.role || (currentUser?.role || 'student');

        if (!currentUser || currentUser.email !== email || currentUser.name !== name || currentUser.id !== authUser.id) {
          currentUser = {
            id: authUser.id,
            name,
            email,
            role,
            streakDays: currentUser?.streakDays || 1,
            lastActiveDate: new Date().toISOString(),
            xp: currentUser?.xp || 100,
            level: currentUser?.level || 1,
            badges: currentUser?.badges || [],
          };
          store.updateUser(currentUser);
        }
      }
    } catch {
      // Fall back to store
    }

    setUser(currentUser);
  };

  useEffect(() => {
    refreshUser();
    window.addEventListener('gapfinder_user_changed', refreshUser);
    return () => window.removeEventListener('gapfinder_user_changed', refreshUser);
  }, []);

  const isTeacher = user?.role === 'teacher';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setIsLoggingOut(false);
        alert(`Logout error: ${error.message}`);
        return;
      }
    } catch (e: unknown) {
      console.warn('Supabase sign out error:', e);
    }
    const store = AppStore.getInstance();
    store.switchRole('student');
    router.refresh();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Greeting & Active Role */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Link
          href="/profile"
          className="group flex items-center gap-1.5 py-1 px-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="View your profile"
          aria-label="View your profile"
        >
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {user?.name || (isTeacher ? 'Prof. Sarah Jenkins' : 'Alex Mercer')}
          </span>
          <span className="group-hover:scale-125 transition-transform">
            {isTeacher ? '👨‍🏫' : '👋'}
          </span>
        </Link>

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

      {/* Right Metrics: Role Pill Switcher, Streak/XP, Theme Toggle, Log Out */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Current Role Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
            isTeacher
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600/40 text-indigo-700 dark:text-indigo-300'
          }`}
        >
          {isTeacher ? (
            <>
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Teacher</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Student</span>
            </>
          )}
        </div>

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

        {/* Quick Profile Link */}
        <Link
          href="/profile"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition shadow-2xs text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          title="View and edit your profile"
          aria-label="View and edit your profile"
        >
          <User className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">Profile</span>
        </Link>

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

        {/* Prominent Log Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-2xs text-xs font-bold disabled:opacity-60"
          title="Sign out of your account"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
              <span className="hidden sm:inline">Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Log Out</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
