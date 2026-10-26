'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Award,
  FileQuestion,
  BookOpen,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { Topic, RevisionPlan, UserProfile, StudyDocument } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [docs, setDocs] = useState<StudyDocument[]>([]);
  const [readinessScore, setReadinessScore] = useState(62);
  const [trackerMode, setTrackerMode] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setUser(store.getUser());
    const currentTopics = store.getTopics();
    setTopics(currentTopics);
    setPlan(store.getRevisionPlan());
    setDocs(store.getDocuments());

    if (currentTopics.length > 0) {
      const avg = Math.round(
        currentTopics.reduce((acc, t) => acc + t.masteryScore, 0) / currentTopics.length
      );
      setReadinessScore(avg);
    }

    const handleUserChanged = () => {
      setUser(store.getUser());
    };
    window.addEventListener('gapfinder_user_changed', handleUserChanged);
    return () => window.removeEventListener('gapfinder_user_changed', handleUserChanged);
  }, []);

  const handleTaskToggle = (dayNumber: number, taskId: string) => {
    const store = AppStore.getInstance();
    const nowCompleted = store.toggleTaskCompletion(dayNumber, taskId);
    setPlan(store.getRevisionPlan());
    setUser(store.getUser());

    if (nowCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const weakTopics = topics.filter((t) => t.status === 'weak' || t.masteryScore < 50);
  const highYieldWeak = weakTopics.filter((t) => t.examFrequency === 'High');
  const todayTasks = plan?.days[0]?.tasks || [];

  // Generate 28 calendar dots for October 2026 (like learning.ccbp.in)
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    // Active on days 22, 23, 24, 25, 26
    const isActive = [20, 21, 22, 23, 24, 25, 26].includes(day);
    const isToday = day === 26;
    return { day, isActive, isToday };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner (Inspiration from CCBP / NxtWave Portal) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Academic Diagnostic System
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              OUTPACE TRADITIONAL REVISION WITH GAPFINDER AI.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Find and fix hidden syllabus blind spots before your exam. Grounded quizzes, past paper weightage analysis, and adaptive revision schedules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/25 hover:opacity-95 hover:scale-[1.02] transition"
            >
              <span>Start Diagnostic Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-3 text-xs font-semibold transition"
            >
              <span>Upload Materials ({docs.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Content) + Right Column (Consistency & Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Revision Schedule & Topics (7 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Critical Gaps Warning Banner (If Any) */}
          {highYieldWeak.length > 0 && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {highYieldWeak.length} High-Yield Exam Gap(s) Need Attention
                  </h4>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    Topics like <strong>{highYieldWeak[0]?.title}</strong> appear frequently on past papers (10 marks) but are scored as Weak (&lt;50%).
                  </p>
                </div>
              </div>

              <Link
                href={`/quiz?topicId=${highYieldWeak[0]?.id}`}
                className="shrink-0 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition"
              >
                Drill Gap
              </Link>
            </div>
          )}

          {/* Today's Revision Action Plan */}
          <div className="clean-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Today&apos;s Targeted Revision Action Plan
                </h3>
              </div>
              <Link
                href="/revision-plan"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Full 7-Day Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(1, task.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.topicTitle}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            task.priority === 'Urgent'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {task.actionType} • Source: {task.sourceReference}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.durationMinutes}m</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Consistency, Monthly Tracker & Stats (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Learning Consistency Card (From Screenshot) */}
          <div className="clean-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                <span>Learning Consistency</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[10px] font-bold">
                Goal 🔥 7 Days
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Track your daily revision streak and conceptual consistency.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700/80 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Current Streak
                </span>
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span>{user?.streakDays || 1}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-semibold">
                  Personal Best: 🔥 12
                </span>
              </div>

              <div className="rounded-2xl bg-indigo-50/60 dark:bg-slate-800/60 border border-indigo-200/80 dark:border-slate-700/80 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Study XP
                </span>
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span>{user?.xp || 0}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-semibold">
                  Level {user?.level || 1} • Topic Sleuth
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Activity Tracker (From Screenshot) */}
          <div className="clean-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                <span>Monthly Tracker</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setTrackerMode('daily')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    trackerMode === 'daily'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTrackerMode('weekly')}
                  className={`rounded-md px-2 py-0.5 transition ${
                    trackerMode === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold px-1">
              <span>October 2026</span>
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <span className="h-2 w-2 rounded-sm bg-emerald-500"></span>
                <span>Active revision</span>
              </div>
            </div>

            {/* Calendar Contribution Matrix (7 Columns for 7 Days of the week) */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div
                  key={idx}
                  className="text-center text-[10px] font-bold text-slate-400 pb-1"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((d) => (
                <div
                  key={d.day}
                  title={`Oct ${d.day}, 2026: ${d.isActive ? 'Study streak active' : 'Rest day'}`}
                  className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold transition cursor-pointer ${
                    d.isToday
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 font-bold'
                      : d.isActive
                      ? 'bg-emerald-500 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>

          {/* Exam Readiness Card */}
          <div className="clean-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Predicted Exam Readiness
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  readinessScore >= 75
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                }`}
              >
                {readinessScore >= 75 ? 'Prepared' : 'Needs Practice'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {readinessScore}%
              </span>
              <span className="text-xs text-slate-500">Readiness Score</span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <div className="pt-2">
              <Link
                href="/gap-report"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <span>View Full Gap Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
