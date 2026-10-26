'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { RevisionPlan, Topic, UserProfile } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function RevisionPlanPage() {
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(7);
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setPlan(store.getRevisionPlan());
    setTopics(store.getTopics());
    setUser(store.getUser());
  }, []);

  const handleToggleTask = (dayNumber: number, taskId: string) => {
    const store = AppStore.getInstance();
    const nowCompleted = store.toggleTaskCompletion(dayNumber, taskId);
    setPlan(store.getRevisionPlan());
    setUser(store.getUser());

    if (nowCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          daysRemaining,
          dailyHours,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        const store = AppStore.getInstance();
        store.updateRevisionPlan(data.plan);
        setPlan(data.plan);

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Plan regeneration failed:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const totalTasks = plan?.days.reduce((acc, d) => acc + d.tasks.length, 0) || 0;
  const completedTasks = plan?.days.reduce((acc, d) => acc + d.tasks.filter((t) => t.completed).length, 0) || 0;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Adaptive Revision Plan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Prioritizes High-Yield Weak topics first to maximize exam ROI. Check off tasks as you revise to earn XP and update your mastery scores.
          </p>
        </div>

        {/* Plan Stats */}
        <div className="clean-card px-4 py-2 text-center shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tasks Completed</span>
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
            {completedTasks} / {totalTasks} ({progressPct}%)
          </span>
        </div>
      </div>

      {/* Constraints Controls Card */}
      <div className="clean-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Personalize Your Revision Constraints
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Study Hours: <strong className="text-slate-900 dark:text-white">{Math.round(daysRemaining * dailyHours)} hrs</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Days Remaining */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Days Remaining: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{daysRemaining} Days</span>
            </label>
            <input
              type="range"
              min="1"
              max="21"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 Day (Sprint)</span>
              <span>7 Days</span>
              <span>21 Days</span>
            </div>
          </div>

          {/* Daily Hours Available */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Daily Study Hours: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{dailyHours} Hours/Day</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr/day</span>
              <span>2 hrs/day</span>
              <span>8 hrs/day</span>
            </div>
          </div>

          {/* Regenerate Button */}
          <div className="flex items-end">
            <button
              onClick={handleRegeneratePlan}
              disabled={isRegenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Recalculating...' : 'Recalculate Adaptive Plan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Overall Revision Completion</span>
          <span className="font-bold text-slate-900 dark:text-white">{progressPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Days Schedule List */}
      <div className="space-y-4">
        {plan?.days.map((day) => {
          const dayCompleted = day.tasks.every((t) => t.completed);

          return (
            <div
              key={day.dayNumber}
              className={`clean-card p-5 transition-all ${
                dayCompleted ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40' : ''
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      dayCompleted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    D{day.dayNumber}
                  </span>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{day.focusTitle}</h3>
                    <span className="text-[11px] text-slate-400">{day.dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{day.estimatedMinutes} mins</span>
                  </span>
                  {dayCompleted && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Day Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Day Tasks */}
              <div className="space-y-2">
                {day.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(day.dayNumber, task.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3 transition cursor-pointer ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="mt-1 sm:mt-0 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
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
                          <strong>{task.actionType}</strong> • Source: {task.sourceReference}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      <span className="text-xs text-slate-400">{task.durationMinutes} min</span>
                      {task.actionType === 'Re-test Quiz' && (
                        <Link
                          href={`/quiz?topicId=${task.topicId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-2.5 py-1 text-[11px] font-semibold transition"
                        >
                          Launch Quiz
                        </Link>
                      )}
                      {task.actionType === 'Review Notes' && (
                        <Link
                          href={`/assistant?q=${encodeURIComponent('Review ' + task.topicTitle)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 px-2.5 py-1 text-[11px] font-semibold transition"
                        >
                          Ask Tutor
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
