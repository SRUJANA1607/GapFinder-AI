'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Topic } from '@/lib/types';
import { AlertTriangle, CheckCircle2, Flame, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface HeatmapGridProps {
  topics: Topic[];
  onSelectTopic?: (topic: Topic) => void;
}

export default function HeatmapGrid({ topics, onSelectTopic }: HeatmapGridProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [filter, setFilter] = useState<'all' | 'weak' | 'medium' | 'strong' | 'high_yield'>('all');

  const filteredTopics = topics.filter((t) => {
    if (filter === 'weak') return t.status === 'weak' || t.masteryScore < 50;
    if (filter === 'medium') return t.status === 'medium' || (t.masteryScore >= 50 && t.masteryScore < 75);
    if (filter === 'strong') return t.status === 'strong' || t.masteryScore >= 75;
    if (filter === 'high_yield') return t.examFrequency === 'High';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Topics ({topics.length})
          </button>
          <button
            onClick={() => setFilter('weak')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
              filter === 'weak'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400"></span> Weak Gaps
          </button>
          <button
            onClick={() => setFilter('high_yield')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
              filter === 'high_yield'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" /> High Exam Yield
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-rose-500"></span>
            <span>Weak (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-amber-500"></span>
            <span>Medium (50-74%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500"></span>
            <span>Strong (&ge;75%)</span>
          </div>
        </div>
      </div>

      {/* Grid of Topic Heatmap Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTopics.map((topic) => {
          const isWeak = topic.status === 'weak' || topic.masteryScore < 50;
          const isMedium = topic.status === 'medium' || (topic.masteryScore >= 50 && topic.masteryScore < 75);
          const isStrong = topic.status === 'strong' || topic.masteryScore >= 75;

          return (
            <div
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                if (onSelectTopic) onSelectTopic(topic);
              }}
              className={`group relative rounded-2xl p-4 border transition-all cursor-pointer backdrop-blur-md ${
                isWeak
                  ? 'bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/30 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-950/50'
                  : isMedium
                  ? 'bg-gradient-to-br from-amber-950/40 to-slate-900 border-amber-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-950/50'
                  : 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/30 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-950/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium text-slate-400 truncate block">
                  {topic.unit}
                </span>
                {topic.examFrequency === 'High' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 shrink-0">
                    <Flame className="w-3 h-3 text-amber-400" />
                    High Yield ({topic.pastPaperQuestionsCount}x)
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-indigo-200 transition">
                {topic.title}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
                {topic.description}
              </p>

              {/* Mastery Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Diagnostic Mastery:</span>
                  <span
                    className={`font-bold ${
                      isWeak ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {topic.masteryScore}% ({isWeak ? 'Weak' : isMedium ? 'Medium' : 'Strong'})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWeak ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${topic.masteryScore}%` }}
                  />
                </div>
              </div>

              {/* Diagnosis snippet */}
              {topic.diagnosisReason && (
                <div className="mt-3 rounded-lg bg-slate-950/60 p-2 text-[11px] text-slate-300 border border-slate-800/80">
                  <span className="font-semibold text-slate-200">Diagnosis: </span>
                  {topic.diagnosisReason}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
                <span className="text-[11px] text-slate-500">
                  {topic.subtopics.length} subtopics
                </span>
                <Link
                  href={`/quiz?topicId=${topic.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium group-hover:translate-x-0.5 transition"
                >
                  Diagnose Gap <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
