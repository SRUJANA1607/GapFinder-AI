'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  Flame,
  FileQuestion,
  BarChart3,
  CalendarCheck,
  Bot,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  GraduationCap,
  Users,
  Lightbulb,
  UploadCloud,
} from 'lucide-react';
import { DEMO_STUDENT, DEMO_TEACHER } from '@/lib/demo-data';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Diagnostic AI for Students & Class Intelligence for Teachers</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Find what you <span className="text-indigo-600 dark:text-indigo-400">don’t know</span> before the exam does.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Most study tools wait for questions. But you can&apos;t ask about gaps you don’t know you have.
          <strong className="text-slate-900 dark:text-white"> GapFinder AI</strong> diagnoses hidden blind spots from your course materials and gives students personal revision plans while giving teachers actionable class-wide intelligence.
        </p>

        {/* Primary Role CTAs */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:scale-[1.02] transition"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Launch Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/teacher"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition"
          >
            <Users className="w-4 h-4" />
            <span>Launch Teacher Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <span>Role Sign In</span>
          </Link>
        </div>

        {/* Dual Mode Card Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
          {/* Student Experience Card */}
          <div className="clean-card p-5 space-y-3 relative overflow-hidden border-t-4 border-t-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Student Experience
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Primary User
                  </span>
                </div>
              </div>
              <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                Alex Mercer
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Upload syllabus, notes & past papers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Take AI-generated grounded diagnostic quizzes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Discover weak, medium & strong knowledge gaps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Personalized revision timetable with daily tasks</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Teacher Experience Card */}
          <div className="clean-card p-5 space-y-3 relative overflow-hidden border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Teacher Dashboard
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Secondary User
                  </span>
                </div>
              </div>
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                Prof. Sarah Jenkins
              </span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Upload syllabus & learning materials for a class</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Review class-level topic performance & gap heatmap</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Identify commonly misunderstood concepts (34/48 students)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Plan remedial sessions & broadcast targeted quizzes</span>
              </li>
            </ul>

            <Link
              href="/teacher"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
            >
              <span>Explore Teacher Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Workflow Steps */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            How GapFinder AI Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Separating Retrieval from Generation to deliver provably grounded diagnostic insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clean-card p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">1. Material Ingestion & Map</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Uploads syllabus, notes, textbooks, and past papers. Extracts topics and computes past exam frequency weightage.
            </p>
          </div>

          <div className="clean-card p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
              <FileQuestion className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">2. Grounded Diagnostic Quiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Questions are created strictly from retrieved chunks with exact citations. Confidence selector detects lucky guesses.
            </p>
          </div>

          <div className="clean-card p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">3. Gap Diagnosis & Heatmap</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Categorizes topics into Weak (&lt;50%), Medium, and Strong. Pinpoints exact conceptual misunderstandings.
            </p>
          </div>

          <div className="clean-card p-5 space-y-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">4. Adaptive Revision Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates a day-by-day plan prioritizing High-Yield Weak gaps first, adjusting dynamically as you improve.
            </p>
          </div>
        </div>
      </div>

      {/* Standout Features / Why This Project Wins Section */}
      <div className="clean-card p-6 sm:p-8 space-y-5">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Competition Evaluation Highlights
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Why GapFinder AI Stands Out
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unlike generic &ldquo;chat with your PDF&rdquo; wrappers, GapFinder AI finds the problem before the student asks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-4">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Strict RAG Separation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Retrieval extracts verified chunks from student notes. Generation synthesizes diagnostic questions & evaluations strictly within that context. Zero ungrounded hallucinations.
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>High-Yield Past Paper Weightage</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Cross-references syllabus topics against past exam papers to calculate recurring question frequency. Prioritizes weak topics that carry the highest exam marks!
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Gamified Revision Habit</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Revision Streak counter, Study XP levels, and celebratory confetti designed to engage students and maintain consistent daily revision habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
