'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  UploadCloud,
  FileQuestion,
  BarChart3,
  CalendarCheck,
  Bot,
  Flame,
  Zap,
  Key,
  RotateCcw,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import ApiKeyModal from './ApiKeyModal';
import StreakCelebration from './StreakCelebration';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakAwardedXp, setStreakAwardedXp] = useState(0);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    const currentUser = store.getUser();
    setUser(currentUser);
    setHasApiKey(!!store.getApiKey());

    // Check daily streak
    const result = store.recordDailyActivity();
    if (result.streakIncreased) {
      setUser(store.getUser());
      setStreakAwardedXp(result.xpAwarded);
      setShowStreakModal(true);
    }
  }, []);

  const handleResetDemo = () => {
    if (confirm('Reset to standard preloaded Operating Systems demo dataset for judging evaluation?')) {
      const store = AppStore.getInstance();
      store.resetToDemo();
      window.location.reload();
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/upload', label: 'Upload Materials', icon: UploadCloud },
    { href: '/topics', label: 'Topic Map', icon: Compass },
    { href: '/quiz', label: 'Diagnostic Quiz', icon: FileQuestion },
    { href: '/gap-report', label: 'Gap Report', icon: Sparkles },
    { href: '/revision-plan', label: 'Revision Plan', icon: CalendarCheck },
    { href: '/assistant', label: 'Explain-This-Topic', icon: Bot },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  GapFinder <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-400 -mt-1 tracking-wide">
                  Academic Diagnostic Engine
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Gamification & Tools */}
          <div className="flex items-center gap-3">
            {/* Revision Streak Pill */}
            {user && (
              <div
                onClick={() => setShowStreakModal(true)}
                className="cursor-pointer flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300 shadow-sm hover:scale-105 transition"
                title="Your consecutive daily study streak"
              >
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                <span>{user.streakDays} Day Streak</span>
              </div>
            )}

            {/* Level & XP Pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>Lvl {user.level}</span>
                <span className="text-[10px] text-indigo-400">({user.xp} XP)</span>
              </div>
            )}

            {/* Gemini API Key Button */}
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                hasApiKey
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{hasApiKey ? 'Gemini 1.5 Active' : 'API Key'}</span>
            </button>

            {/* Reset Demo Course for Judges */}
            <button
              onClick={handleResetDemo}
              className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset to pre-loaded Operating Systems Course (Demo Evaluation)"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden xl:inline">Reset Demo</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeySaved={(k) => setHasApiKey(!!k)}
      />

      {/* Streak Celebration Popup */}
      {user && (
        <StreakCelebration
          show={showStreakModal}
          streakDays={user.streakDays}
          xpEarned={streakAwardedXp}
          onClose={() => setShowStreakModal(false)}
        />
      )}
    </>
  );
}
