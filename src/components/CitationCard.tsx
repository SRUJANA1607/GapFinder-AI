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
    <div className="rounded-xl border border-slate-700/70 bg-slate-850/60 p-3 text-xs transition-all hover:border-indigo-500/50 hover:bg-slate-800/80">
      <div
        className="flex items-center justify-between cursor-pointer select-none gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
              isPastPaper
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : isTextbook
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : isSyllabus
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isPastPaper ? (
              <FileText className="w-3.5 h-3.5" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
          </span>
          <div className="truncate">
            <span className="font-semibold text-slate-200 block truncate">{docName}</span>
            <span className="text-[11px] text-slate-400 block truncate">
              {section} {pageNumber ? `(Page ~${pageNumber})` : ''}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-white p-1 rounded-md"
          aria-label="Toggle citation text"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/60 text-slate-300 bg-slate-900/60 rounded-lg p-2.5">
          <div className="flex items-start gap-1.5 text-indigo-300 mb-1 font-medium text-[11px]">
            <Quote className="w-3 h-3 shrink-0 mt-0.5" />
            <span>Grounded Source Excerpt:</span>
          </div>
          <p className="italic font-serif text-[12px] leading-relaxed text-slate-300 pl-4 border-l-2 border-indigo-500/50">
            &ldquo;{snippet}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
