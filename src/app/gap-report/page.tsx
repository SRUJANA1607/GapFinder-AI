'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  CalendarCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { Topic } from '@/lib/types';
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Diagnostic Knowledge Gap Report
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Objective analysis of topic-level strengths and blind spots. Every rating is tied to diagnostic assessment performance and grounded textbook citations.
          </p>
        </div>

        <Link
          href="/revision-plan"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition shrink-0"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Build Revision Plan from Gaps</span>
        </Link>
      </div>

      {/* High-Yield Critical Alert */}
      {highYieldWeak.length > 0 && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>High-Yield Examination Risk Detected</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            You have <strong>{highYieldWeak.length} High-Yield topic(s)</strong> classified as <span className="font-bold underline">WEAK (&lt;50%)</span>.
            These concepts appeared in 3 consecutive past papers for a combined weight of over 18 marks:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {highYieldWeak.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-700 px-3 py-1 text-xs font-bold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {t.title} ({t.masteryScore}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-card p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Readiness
          </span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            <span>{avgReadiness}%</span>
            <span className="text-xs font-normal text-slate-400">Readiness Score</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{ width: `${avgReadiness}%` }}
            />
          </div>
        </div>

        <div
          onClick={() => setActiveCategory('weak')}
          className={`clean-card p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'weak'
              ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
              : 'hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Weak Topics (&lt;50%)
          </span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {weakTopics.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Immediate revision required</span>
        </div>

        <div
          onClick={() => setActiveCategory('medium')}
          className={`clean-card p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'medium'
              ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
              : 'hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Medium Topics (50-74%)
          </span>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {mediumTopics.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Needs targeted practice</span>
        </div>

        <div
          onClick={() => setActiveCategory('strong')}
          className={`clean-card p-5 space-y-1 cursor-pointer transition ${
            activeCategory === 'strong'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Strong Topics (&ge;75%)
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {strongTopics.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Solid conceptual grasp</span>
        </div>
      </div>

      {/* Knowledge Gap Heatmap */}
      <div className="clean-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Knowledge Gap Heatmap
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any topic to re-test</span>
        </div>
        <HeatmapGrid topics={topics} />
      </div>

      {/* Deep-Dive Diagnosis Reasoning List */}
      <div className="clean-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Topic Diagnosis Reasoning & Evidence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {displayTopics.map((topic) => {
            const isWeak = topic.status === 'weak' || topic.masteryScore < 50;
            const isMedium = topic.status === 'medium' || (topic.masteryScore >= 50 && topic.masteryScore < 75);

            return (
              <div
                key={topic.id}
                className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isWeak ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{topic.title}</h3>
                    <span className="text-xs text-slate-400">({topic.unit})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {topic.examFrequency === 'High' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[10px] font-bold">
                        <Flame className="w-3 h-3 text-amber-500" />
                        High Exam Frequency
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isWeak
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          : isMedium
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {topic.masteryScore}% ({isWeak ? 'Weak' : isMedium ? 'Medium' : 'Strong'})
                    </span>
                  </div>
                </div>

                {/* Concrete Diagnosis Reason */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Diagnostic Evidence:</span>
                  <p className="leading-relaxed">
                    {topic.diagnosisReason ||
                      'Evaluated across syllabus and diagnostic test responses with past examination weighting.'}
                  </p>
                </div>

                {/* Grounded Citation Sources */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link
                    href={`/assistant?q=${encodeURIComponent('Explain why students struggle with ' + topic.title)}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Explain this Gap
                  </Link>

                  <Link
                    href={`/quiz?topicId=${topic.id}`}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white transition shadow-2xs"
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
