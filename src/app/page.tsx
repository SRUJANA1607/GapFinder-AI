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
  AlertTriangle,
} from 'lucide-react';
import { DEMO_USER } from '@/lib/demo-data';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Academic Diagnostic & Revision Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Find what you <span className="gradient-text">don’t know</span> before the exam does.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Most study tools wait for you to ask questions. But students can&apos;t ask about gaps they don’t know they have.
          <strong className="text-white"> GapFinder AI</strong> diagnoses hidden blind spots from your syllabus, textbooks, and past papers, and builds an adaptive revision plan.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02] transition"
          >
            <span>Launch Evaluation Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/quiz"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
          >
            <FileQuestion className="w-4 h-4 text-indigo-400" />
            <span>Take Diagnostic Quiz</span>
          </Link>
        </div>

        {/* Judge Demo Banner */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 border border-indigo-500/30 p-4 max-w-2xl mx-auto text-left shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  Evaluator Instant Access
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-semibold text-[10px]">
                  Preloaded CS Course
                </span>
              </div>
              <p className="text-slate-300">
                Logged in as <strong>{DEMO_USER.name}</strong> ({DEMO_USER.email}).
                Includes complete Operating Systems syllabus, textbook excerpts, lecture notes, and 3 years of past papers pre-indexed for testing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Steps */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">How GapFinder AI Works</h2>
          <p className="text-xs text-slate-400 mt-1">
            Separating Retrieval from Generation to deliver provably grounded diagnostic insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">1. Material Ingestion & Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uploads syllabus, notes, textbooks, and past papers. Extracts topics and computes past exam frequency weightage.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">2. Grounded Diagnostic Quiz</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions are created strictly from retrieved chunks with exact citations. Confidence selector detects lucky guesses.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">3. Gap Diagnosis & Heatmap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Categorizes topics into Weak (&lt;50%), Medium, and Strong. Pinpoints exact conceptual misunderstandings.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">4. Adaptive Revision Plan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a day-by-day plan prioritizing High-Yield Weak gaps first, adjusting dynamically as you improve.
            </p>
          </div>
        </div>
      </div>

      {/* Standout Features / Why This Project Wins Section */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Competition Evaluation Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Why GapFinder AI Stands Out
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Unlike generic &ldquo;chat with your PDF&rdquo; wrappers, GapFinder AI finds the problem before the student asks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Strict RAG Separation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retrieval extracts verified chunks from student notes. Generation synthesizes diagnostic questions & evaluations strictly within that context. Zero ungrounded hallucinations.
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>High-Yield Past Paper Weightage</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cross-references syllabus topics against past exam papers to calculate recurring question frequency. Prioritizes weak topics that carry the highest exam marks!
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-950/70 border border-slate-800/80 p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Gamified Revision Habit</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Revision Streak counter, Study XP levels, and celebratory confetti designed to engage students and maintain consistent daily revision habits.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard"
          className="group rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:shadow-indigo-950/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Explore Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition">
            Student & Judge Progress Dashboard
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Real-time Exam Readiness Score, Knowledge Gap Heatmap, Streak tracker, and quick-launch diagnostics.
          </p>
        </Link>

        <Link
          href="/assistant"
          className="group rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-950/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Open Assistant <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition">
            Explain-This-Topic Grounded Assistant
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Ask any question and receive an explanation grounded strictly in your uploaded materials with interactive verifiable citations.
          </p>
        </Link>
      </div>
    </div>
  );
}
