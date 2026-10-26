'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Flame,
  Zap,
  BarChart3,
  CalendarCheck,
  FileQuestion,
  Bot,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { Topic, RevisionPlan, UserProfile, StudyDocument } from '@/lib/types';
import HeatmapGrid from '@/components/HeatmapGrid';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [docs, setDocs] = useState<StudyDocument[]>([]);
  const [readinessScore, setReadinessScore] = useState(62);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    const currentUser = store.getUser();
    const currentTopics = store.getTopics();
    const currentPlan = store.getRevisionPlan();
    const currentDocs = store.getDocuments();

    setUser(currentUser);
    setTopics(currentTopics);
    setPlan(currentPlan);
    setDocs(currentDocs);

    // Compute readiness score
    if (currentTopics.length > 0) {
      const avg = Math.round(
        currentTopics.reduce((acc, t) => acc + t.masteryScore, 0) / currentTopics.length
      );
      setReadinessScore(avg);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name.split(' ')[0] || 'Student'}!
            </h1>
            <span className="rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold">
              {user?.role === 'judge' ? 'Judge Evaluation Mode' : 'Exam Candidate'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Course in Focus: <span className="text-indigo-300 font-medium">CS301 Operating Systems & Concurrency</span> ({docs.length} materials indexed)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/quiz"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition"
          >
            <FileQuestion className="w-4 h-4" />
            <span>Take Diagnostic Quiz</span>
          </Link>
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Explain a Gap</span>
          </Link>
        </div>
      </div>

      {/* Hero Diagnostic Readiness Card & Gamified Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Readiness Score Meter */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Readiness Score
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                readinessScore >= 75
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : readinessScore >= 50
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              {readinessScore >= 75 ? 'Exam Ready' : readinessScore >= 50 ? 'Revision Needed' : 'Critical Gaps'}
            </span>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-950 border-4 border-slate-800">
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-500"
                style={{
                  clipPath: `polygon(50% 50%, -50% -50%, ${readinessScore * 3.6}% 0%, 100% 100%)`,
                }}
              />
              <div className="text-center z-10">
                <span className="text-4xl font-extrabold text-white">{readinessScore}%</span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Readiness
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            Calculated across {topics.length} syllabus topics weighted by past question paper frequency.
          </div>
        </div>

        {/* Streak & XP Gamification Center */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Revision Streak & XP
            </span>
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{user?.streakDays || 1} Days Active</span>
            </div>
          </div>

          <div className="space-y-4 my-auto">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">Level {user?.level || 1}</span>
                  <span className="block text-[11px] text-slate-400">Topic Sleuth</span>
                </div>
              </div>
              <span className="font-mono text-xs text-indigo-300 font-bold">{user?.xp || 0} XP</span>
            </div>

            {/* XP progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Progress to Level {(user?.level || 1) + 1}</span>
                <span>{((user?.xp || 0) % 150)} / 150 XP</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(((user?.xp || 0) % 150) / 150) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges Preview */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Unlocked Badges
              </span>
              <div className="flex items-center gap-2">
                {user?.badges.map((b) => (
                  <div
                    key={b.id}
                    title={`${b.title}: ${b.description}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition ${
                      b.unlockedAt
                        ? 'bg-slate-800 border-indigo-500/40 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40'
                    }`}
                  >
                    <span>{b.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-800/80">
            Earn +30 XP for completing revision tasks and +60 XP for diagnostic quizzes!
          </div>
        </div>

        {/* Critical High-Yield Gaps Alert */}
        <div className="rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Critical Gaps Alert
                </span>
              </div>
              <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold">
                {highYieldWeak.length} Urgent Gaps
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              These topics appear with high frequency on past question papers (up to 10 marks), but your diagnostic score is below 50%:
            </p>

            <div className="space-y-2">
              {highYieldWeak.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl bg-slate-950/70 border border-rose-500/30 p-2.5 text-xs flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-white block truncate">{topic.title}</span>
                    <span className="text-[10px] text-rose-400">
                      Score: {topic.masteryScore}% • {topic.pastPaperQuestionsCount} past exam questions
                    </span>
                  </div>
                  <Link
                    href={`/quiz?topicId=${topic.id}`}
                    className="shrink-0 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold transition"
                  >
                    Drill Gap
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/gap-report"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <span>View Full Diagnostic Gap Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Visual Knowledge Gap Heatmap */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Knowledge Gap Heatmap</h2>
            </div>
            <p className="text-xs text-slate-400">
              Interactive topic mastery map generated from your syllabus and diagnostic answers.
            </p>
          </div>
          <Link
            href="/gap-report"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            <span>Detailed Diagnosis Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HeatmapGrid topics={topics} />
      </div>

      {/* Today's Adaptive Revision Tasks */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Today&apos;s Targeted Revision Action Plan</h2>
              <p className="text-xs text-slate-400">
                Prioritized around your weakest high-yield topics ({plan?.days[0]?.focusTitle || 'Day 1'})
              </p>
            </div>
          </div>
          <Link
            href="/revision-plan"
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>View Full 7-Day Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskToggle(1, task.id)}
              className={`flex items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all cursor-pointer ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="mt-1 sm:mt-0 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {task.topicTitle}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Action: <strong>{task.actionType}</strong> • Ref: {task.sourceReference}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> {task.durationMinutes} min
                </span>
                {task.completed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
