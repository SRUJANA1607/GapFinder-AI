'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Explain-This-Topic Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Grounded Socratic tutor powered by vector retrieval over your uploaded course materials.
          </p>
        </div>

        {/* Grounding Guarantee Badge */}
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Strictly Grounded in Uploaded Materials • Zero Hallucinations</span>
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="flex flex-col h-[650px] clean-card overflow-hidden shadow-xs">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                        ? 'bg-indigo-600 shadow-xs'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] space-y-2.5 ${isAssistant ? '' : 'text-right'}`}>
                    <div
                      className={`rounded-2xl p-4 text-left whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                          : 'bg-indigo-600 text-white shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Citations block for assistant messages */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-1.5 pt-1 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Verifiable Citations ({msg.citations.length}):</span>
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
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
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-11">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <span>Searching vector store and synthesizing grounded response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Pills Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Ask:
            </span>
            {suggestionPills.map((pill, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(pill)}
                className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 shrink-0 transition shadow-2xs"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything grounded in your course materials..."
              className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading Grounded Assistant...</p>
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
