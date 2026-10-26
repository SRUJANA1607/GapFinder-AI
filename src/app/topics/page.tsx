'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Flame,
  FileQuestion,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { Topic } from '@/lib/types';
import CitationCard from '@/components/CitationCard';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    const currentTopics = store.getTopics();
    setTopics(currentTopics);
    if (currentTopics.length > 0) {
      setSelectedTopic(currentTopics[0]);
    }
  }, []);

  // Group topics by Unit
  const unitsMap = topics.reduce<Record<string, Topic[]>>((acc, topic) => {
    if (!acc[topic.unit]) {
      acc[topic.unit] = [];
    }
    acc[topic.unit].push(topic);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Syllabus Topic Map & Exam Weightage</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Hierarchical course breakdown extracted from your syllabus and cross-referenced with 3 years of past examination papers.
          Topics are tagged with exam frequencies so you prioritize high-yield areas first.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Units & Topic List */}
        <div className="lg:col-span-7 space-y-6">
          {Object.entries(unitsMap).map(([unitName, unitTopics]) => (
            <div
              key={unitName}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">{unitName}</h2>
                </div>
                <span className="text-xs text-slate-400">{unitTopics.length} topics</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {unitTopics.map((topic) => {
                  const isSelected = selectedTopic?.id === topic.id;
                  const isWeak = topic.status === 'weak' || topic.masteryScore < 50;
                  const isMedium = topic.status === 'medium' || (topic.masteryScore >= 50 && topic.masteryScore < 75);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex items-center justify-between rounded-2xl border p-3.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            isWeak
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isMedium
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {topic.masteryScore}%
                        </div>

                        <div className="truncate">
                          <h4 className="text-xs font-semibold text-white truncate">{topic.title}</h4>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {topic.subtopics.length} subtopics • Status: {isWeak ? 'Weak' : isMedium ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {topic.examFrequency === 'High' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {topic.pastPaperQuestionsCount}x Past Papers
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Topic Detail & Grounded Citations */}
        <div className="lg:col-span-5 space-y-6">
          {selectedTopic ? (
            <div className="sticky top-20 rounded-3xl bg-slate-900/90 border border-indigo-500/30 p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    {selectedTopic.unit}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedTopic.title}</h3>
                </div>
                <div
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    selectedTopic.masteryScore < 50
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : selectedTopic.masteryScore < 75
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {selectedTopic.masteryScore}% Mastery
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedTopic.description}
              </p>

              {/* Exam Weightage Card */}
              <div className="rounded-2xl bg-amber-950/30 border border-amber-500/30 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Past Examination Frequency: {selectedTopic.examFrequency} Yield</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Identified in <strong>{selectedTopic.pastPaperQuestionsCount} past exam papers</strong> (2023 - 2025). This topic represents up to 10 marks on mid-term & end-semester papers.
                </p>
              </div>

              {/* Subtopics Checklist */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Mapped Subtopics
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {selectedTopic.subtopics.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-1.5 text-xs text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounded Citation Sources */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Grounded Material References ({selectedTopic.citationSources.length})
                </span>
                <div className="space-y-2">
                  {selectedTopic.citationSources.map((cit, idx) => (
                    <CitationCard
                      key={idx}
                      docName={cit.docName}
                      section={cit.section}
                      snippet="Contains explicit definitions, algorithmic preconditions, and formal proofs as verified in the semantic index."
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href={`/quiz?topicId=${selectedTopic.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition"
                >
                  <FileQuestion className="w-4 h-4" />
                  <span>Diagnose This Topic Now</span>
                </Link>
                <Link
                  href={`/assistant?q=${encodeURIComponent('Explain ' + selectedTopic.title)}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ask Grounded Assistant</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-8 text-center text-xs text-slate-500">
              Select a topic on the left to inspect its exam yield and grounded citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
