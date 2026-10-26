'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Info,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';
import CitationCard from '@/components/CitationCard';

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      text: `Hello! I am your **GapFinder Grounded Assistant**.

I am strictly constrained to answer questions using **only your uploaded syllabus, textbook excerpts, lecture notes, and past question papers**. Every answer includes verifiable source citations so you can cross-check definitions and formulas before your exam.

Try asking about any diagnosed weak gap, or select a suggested topic below!`,
    },
  ]);
  const [inputText, setInputText] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const store = AppStore.getInstance();
      const apiKey = store.getApiKey();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          apiKey,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: data.answer || "I could not generate an answer from the indexed materials.",
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      store.addXp(15);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: `Error connecting to RAG service: ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const suggestionPills = [
    "Explain Banker's Algorithm Need Matrix formula",
    "Why does FIFO page replacement have Belady's Anomaly?",
    "Explain Peterson's Algorithm turn and flag variables",
    "What is the formula for Effective Memory Access Time (EMAT)?",
    "Compare SCAN vs C-SCAN disk scheduling",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explain-This-Topic Assistant</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded Socratic tutor powered by vector retrieval over your uploaded course materials.
          </p>
        </div>

        {/* Grounding Guarantee Badge */}
        <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-2 flex items-center gap-2 text-xs text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Strictly Grounded in Uploaded Materials • Zero Hallucinations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Main Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs sm:text-sm leading-relaxed ${
                    isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] space-y-3 ${isAssistant ? '' : 'text-right'}`}>
                    <div
                      className={`rounded-2xl p-4 text-left whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-slate-950/90 border border-slate-800 text-slate-200'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Citations block for assistant messages */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-2 pt-1 text-left">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Verifiable Citations ({msg.citations.length}):</span>
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.citations.map((cit, idx) => (
                            <CitationCard
                              key={idx}
                              docName={cit.docName}
                              section={cit.section}
                              snippet={cit.snippet}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>Searching vector store and synthesizing grounded response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Pills Suggestions */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">Quick Ask:</span>
            {suggestionPills.map((pill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(pill)}
                className="rounded-full bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/60 px-3 py-1 text-[11px] text-slate-300 shrink-0 transition"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything grounded in your course materials (e.g. 'How does Peterson algorithm solve mutual exclusion?')..."
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: RAG Architecture Transparency Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                RAG Architecture Transparency
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              GapFinder AI maintains a strict mathematical separation between <strong>Retrieval</strong> and <strong>Generation</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <span className="font-bold text-indigo-300 block">1. Semantic Chunking</span>
                <p className="text-slate-400 leading-normal">
                  Syllabus, textbooks, and past papers are segmented by chapter and topic headers with 100-character overlap.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <span className="font-bold text-purple-300 block">2. Vector Cosine Ranking</span>
                <p className="text-slate-400 leading-normal">
                  When you submit a query, the top 4 chunks with highest cosine similarity score are retrieved from the index.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1">
                <span className="font-bold text-emerald-300 block">3. Grounded Synthesis</span>
                <p className="text-slate-400 leading-normal">
                  Gemini generates explanations strictly constrained within the retrieved chunk context, citing exact source documents and pages.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/20 p-3 text-[11px] text-indigo-300">
              💡 <strong>Pro Tip:</strong> Click &ldquo;Inspect Chunks&rdquo; on the Upload page to view the exact raw chunks used by this assistant!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading Grounded Assistant...</p>
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
