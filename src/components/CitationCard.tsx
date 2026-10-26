'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface CitationCardProps {
  docName: string;
  section: string;
  snippet: string;
  pageNumber?: number;
}

export default function CitationCard({
  docName,
  section,
  snippet,
  pageNumber,
}: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isTextbook = docName.toLowerCase().includes('textbook') || docName.toLowerCase().includes('chapter');
  const isPastPaper = docName.toLowerCase().includes('past') || docName.toLowerCase().includes('paper') || docName.toLowerCase().includes('exam');
  const isSyllabus = docName.toLowerCase().includes('syllabus');

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs transition-all hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-2xs">
      <div
        className="flex items-center justify-between cursor-pointer select-none gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
              isPastPaper
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                : isTextbook
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                : isSyllabus
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            }`}
          >
            {isPastPaper ? (
              <FileText className="w-3.5 h-3.5" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
          </span>
          <div className="truncate">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{docName}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              {section} {pageNumber ? `(Page ~${pageNumber})` : ''}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md"
          aria-label="Toggle citation text"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 rounded-lg p-2.5">
          <div className="flex items-start gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1 font-semibold text-[11px]">
            <Quote className="w-3 h-3 shrink-0 mt-0.5" />
            <span>Grounded Source Excerpt:</span>
          </div>
          <p className="italic font-serif text-[12px] leading-relaxed pl-3 border-l-2 border-indigo-400 dark:border-indigo-500/50 text-slate-600 dark:text-slate-300">
            &ldquo;{snippet}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
