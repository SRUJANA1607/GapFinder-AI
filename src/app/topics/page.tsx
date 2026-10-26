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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Syllabus Topic Map & Exam Weightage
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Hierarchical course breakdown extracted from your syllabus and cross-referenced with 3 years of past papers.
          Topics are tagged with exam frequencies so you prioritize high-yield areas first.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Units & Topic List */}
        <div className="lg:col-span-7 space-y-4">
          {Object.entries(unitsMap).map(([unitName, unitTopics]) => (
            <div
              key={unitName}
              className="clean-card p-5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {unitName}
                  </h2>
                </div>
                <span className="text-xs text-slate-400">{unitTopics.length} topics</span>
              </div>

              <div className="space-y-2 pt-1">
                {unitTopics.map((topic) => {
                  const isSelected = selectedTopic?.id === topic.id;
                  const isWeak = topic.status === 'weak' || topic.masteryScore < 50;
                  const isMedium = topic.status === 'medium' || (topic.masteryScore >= 50 && topic.masteryScore < 75);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex items-center justify-between rounded-xl border p-3 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            isWeak
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : isMedium
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {topic.masteryScore}%
                        </div>

                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {topic.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {topic.subtopics.length} subtopics • Status: {isWeak ? 'Weak' : isMedium ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {topic.examFrequency === 'High' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 text-[10px] font-bold">
                            <Flame className="w-3 h-3 text-amber-500" />
                            {topic.pastPaperQuestionsCount}x Past Papers
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Topic Detail & Grounded Citations */}
        <div className="lg:col-span-5 space-y-4">
          {selectedTopic ? (
            <div className="sticky top-20 clean-card p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {selectedTopic.unit}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedTopic.title}
                  </h3>
                </div>
                <div
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    selectedTopic.masteryScore < 50
                      ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      : selectedTopic.masteryScore < 75
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {selectedTopic.masteryScore}% Mastery
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedTopic.description}
              </p>

              {/* Exam Weightage Card */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Exam Weightage: {selectedTopic.examFrequency} Yield</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  Found in <strong>{selectedTopic.pastPaperQuestionsCount} past exam papers</strong> (2023–2025). High priority for revision.
                </p>
              </div>

              {/* Subtopics Checklist */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Mapped Subtopics
                </span>
                <div className="space-y-1">
                  {selectedTopic.subtopics.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounded Citations */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Grounded Material References ({selectedTopic.citationSources.length})
                </span>
                <div className="space-y-1.5">
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

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href={`/quiz?topicId=${selectedTopic.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-xs transition"
                >
                  <FileQuestion className="w-4 h-4" />
                  <span>Diagnose This Topic Now</span>
                </Link>
                <Link
                  href={`/assistant?q=${encodeURIComponent('Explain ' + selectedTopic.title)}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ask Grounded Assistant</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="clean-card p-8 text-center text-xs text-slate-400">
              Select a topic on the left to inspect its exam yield and grounded citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
