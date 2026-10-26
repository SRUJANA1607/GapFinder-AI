'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flame,
  CalendarCheck,
  FileQuestion,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { Topic, GapDiagnosis } from '@/lib/types';
import HeatmapGrid from '@/components/HeatmapGrid';
import CitationCard from '@/components/CitationCard';

export default function GapReportPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'weak' | 'medium' | 'strong'>('weak');

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setTopics(store.getTopics());
  }, []);

  const weakTopics = topics.filter((t) => t.status === 'weak' || t.masteryScore < 50);
  const mediumTopics = topics.filter((t) => t.status === 'medium' || (t.masteryScore >= 50 && t.masteryScore < 75));
  const strongTopics = topics.filter((t) => t.status === 'strong' || t.masteryScore >= 75);

  const highYieldWeak = weakTopics.filter((t) => t.examFrequency === 'High');
  const avgReadiness = topics.length > 0 ? Math.round(topics.reduce((acc, t) => acc + t.masteryScore, 0) / topics.length) : 50;

  const displayTopics = activeCategory === 'all'
    ? topics
    : activeCategory === 'weak'
    ? weakTopics
    : activeCategory === 'medium'
    ? mediumTopics
    : strongTopics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Diagnostic Knowledge Gap Report</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Objective analysis of topic-level strengths and blind spots. Every rating is tied to diagnostic assessment performance and grounded textbook citations.
          </p>
        </div>

        <Link
          href="/revision-plan"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition shrink-0"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Build Revision Plan from Gaps</span>
        </Link>
      </div>

      {/* High-Yield Critical Alert */}
      {highYieldWeak.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/40 p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>High-Yield Examination Risk Detected</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You have <strong>{highYieldWeak.length} High-Yield topic(s)</strong> classified as <span className="text-rose-400 font-bold">WEAK (&lt;50%)</span>.
            These concepts appeared in 3 consecutive past papers for a combined weight of over 18 marks:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {highYieldWeak.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1 text-xs font-semibold"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                {t.title} ({t.masteryScore}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Exam Readiness
          </span>
          <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
            <span>{avgReadiness}%</span>
            <span className="text-xs font-normal text-slate-400">Readiness Score</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${avgReadiness}%` }}
            />
          </div>
        </div>

        <div
          onClick={() => setActiveCategory('weak')}
          className={`rounded-2xl border p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'weak'
              ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
            Weak Topics (&lt;50%)
          </span>
          <div className="text-3xl font-extrabold text-rose-300">
            {weakTopics.length}
          </div>
          <span className="text-[11px] text-slate-400 block">Immediate revision required</span>
        </div>

        <div
          onClick={() => setActiveCategory('medium')}
          className={`rounded-2xl border p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'medium'
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Medium Topics (50-74%)
          </span>
          <div className="text-3xl font-extrabold text-amber-300">
            {mediumTopics.length}
          </div>
          <span className="text-[11px] text-slate-400 block">Needs targeted practice</span>
        </div>

        <div
          onClick={() => setActiveCategory('strong')}
          className={`rounded-2xl border p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'strong'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Strong Topics (&ge;75%)
          </span>
          <div className="text-3xl font-extrabold text-emerald-300">
            {strongTopics.length}
          </div>
          <span className="text-[11px] text-slate-400 block">Solid conceptual mastery</span>
        </div>
      </div>

      {/* Visual Knowledge Gap Heatmap */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Full Knowledge Gap Heatmap</h2>
          </div>
          <span className="text-xs text-slate-400">Click any topic to re-test</span>
        </div>
        <HeatmapGrid topics={topics} />
      </div>

      {/* Deep-Dive Diagnosis Reasoning List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Topic Diagnosis Reasoning & Citations</h2>
            <p className="text-xs text-slate-400">
              Clear diagnostic explanations for why each topic is rated Weak, Medium, or Strong.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['weak', 'medium', 'strong', 'all'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {displayTopics.map((topic) => {
            const isWeak = topic.status === 'weak' || topic.masteryScore < 50;
            const isMedium = topic.status === 'medium' || (topic.masteryScore >= 50 && topic.masteryScore < 75);

            return (
              <div
                key={topic.id}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isWeak ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <h3 className="font-bold text-white text-sm">{topic.title}</h3>
                    <span className="text-xs text-slate-500">({topic.unit})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {topic.examFrequency === 'High' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                        <Flame className="w-3 h-3 text-amber-400" />
                        High Exam Frequency
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isWeak
                          ? 'bg-rose-500/20 text-rose-300'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {topic.masteryScore}% ({isWeak ? 'Weak' : isMedium ? 'Medium' : 'Strong'})
                    </span>
                  </div>
                </div>

                {/* Concrete Diagnosis Reason */}
                <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-300 block">Diagnostic Evidence:</span>
                  <p className="leading-relaxed">
                    {topic.diagnosisReason ||
                      'Evaluated across syllabus and diagnostic test responses with past examination weighting.'}
                  </p>
                </div>

                {/* Grounded Citation Sources */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Grounded Reference Sources:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {topic.citationSources.map((cit, idx) => (
                      <CitationCard
                        key={idx}
                        docName={cit.docName}
                        section={cit.section}
                        snippet="Grounded source material used in diagnostic validation."
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href={`/assistant?q=${encodeURIComponent('Explain why students struggle with ' + topic.title)}`}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Explain this Gap</span>
                  </Link>

                  <Link
                    href={`/quiz?topicId=${topic.id}`}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white transition"
                  >
                    <span>Re-test Topic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
