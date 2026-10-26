'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  UploadCloud,
  Compass,
  FileQuestion,
  Sparkles,
  CalendarCheck,
  Bot,
  Sun,
  Moon,
  Key,
  RotateCcw,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  Users,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import ApiKeyModal from './ApiKeyModal';
import StreakCelebration from './StreakCelebration';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshUser = () => {
    const store = AppStore.getInstance();
    store.initStore();
    setUser(store.getUser());
    setHasApiKey(!!store.getApiKey());
  };

  useEffect(() => {
    refreshUser();
    window.addEventListener('gapfinder_user_changed', refreshUser);
    return () => window.removeEventListener('gapfinder_user_changed', refreshUser);
  }, []);

  const handleResetDemo = () => {
    if (confirm('Reset to standard preloaded Operating Systems demo dataset for judging evaluation?')) {
      const store = AppStore.getInstance();
      store.resetToDemo();
      window.location.reload();
    }
  };

  const handleRoleSwitch = (newRole: 'student' | 'teacher') => {
    const store = AppStore.getInstance();
    store.switchRole(newRole);
    if (newRole === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/dashboard');
    }
  };

  const isTeacher = user?.role === 'teacher';

  const studentNavItems = [
    { href: '/dashboard', label: 'My Dashboard', icon: Home },
    { href: '/upload', label: 'Upload Materials', icon: UploadCloud, badge: 'Upload' },
    { href: '/topics', label: 'Topic Map & Weight', icon: Compass },
    { href: '/quiz', label: 'Diagnostic Quiz', icon: FileQuestion },
    { href: '/gap-report', label: 'Gap Report', icon: Sparkles },
    { href: '/revision-plan', label: 'Revision Plan', icon: CalendarCheck },
    { href: '/assistant', label: 'Explain-This-Topic', icon: Bot, isNew: true },
  ];

  const teacherNavItems = [
    { href: '/teacher', label: 'Class Overview', icon: Users, badge: 'Class' },
    { href: '/upload?role=teacher', label: 'Upload Syllabus', icon: UploadCloud },
    { href: '/topics', label: 'Curriculum Topics', icon: Compass },
    { href: '/quiz', label: 'Diagnostic Quizzes', icon: FileQuestion },
    { href: '/gap-report', label: 'Class Gap Analytics', icon: Sparkles },
    { href: '/teacher#roster', label: 'Student Roster', icon: GraduationCap },
    { href: '/teacher#remedial', label: 'Remedial Sessions', icon: CalendarCheck },
    { href: '/assistant', label: 'Explain-This-Topic', icon: Bot, isNew: true },
  ];

  const activeNavItems = isTeacher ? teacherNavItems : studentNavItems;

  const filteredNav = searchQuery.trim()
    ? activeNavItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeNavItems;

  return (
    <>
      <aside
        className={`shrink-0 h-screen sticky top-0 flex flex-col justify-between border-r transition-all duration-300 z-30 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <Link
              href={isTeacher ? '/teacher' : '/dashboard'}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Compass className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="flex items-center gap-1 font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                    <span>GapFinder</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">AI</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 block -mt-0.5 tracking-wider uppercase">
                    {isTeacher ? 'Teacher Portal' : 'Student Hub'}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Role Quick Switch Pill for Evaluators */}
          {!collapsed && (
            <div className="mt-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  !isTeacher
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Student Dashboard"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('teacher')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isTeacher
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to Teacher Dashboard"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teacher</span>
              </button>
            </div>
          )}

          {/* Search Box */}
          {!collapsed && (
            <div className="mt-2.5 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {isTeacher ? 'Class Intelligence' : 'Learning & Diagnostics'}
              </span>
            )}
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isTeacher
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? isTeacher
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                        isTeacher
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!collapsed && item.isNew && (
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[9px] font-bold">
                      RAG
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Evaluator Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Evaluator Hub
              </span>
            )}

            <Link
              href="/login"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sign In / Switch Role"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Switch Role / Sign In</span>}
            </Link>

            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>Gemini API Key</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      hasApiKey ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>
              )}
            </button>

            <button
              onClick={handleResetDemo}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset Demo Dataset"
            >
              <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Reset Demo Data</span>}
            </button>
          </div>
        </div>

        {/* Bottom Area: Theme Switcher & Profile Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          {/* Segmented Light / Dark Toggle Switch */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Light Mode"
            >
              <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
              {!collapsed && <span>Light</span>}
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`} />
              {!collapsed && <span>Dark</span>}
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                isTeacher
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            {!collapsed && (
              <div className="truncate flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {user?.name || (isTeacher ? 'Prof. Sarah Jenkins' : 'Alex Mercer')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {isTeacher ? 'Course Instructor' : 'Student'} • Lvl {user?.level || 1}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onKeySaved={(k) => setHasApiKey(!!k)}
      />

      {/* Streak celebration popup */}
      {user && (
        <StreakCelebration
          show={showStreakModal}
          streakDays={user.streakDays}
          xpEarned={25}
          onClose={() => setShowStreakModal(false)}
        />
      )}
    </>
  );
}
