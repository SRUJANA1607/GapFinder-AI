'use client';

import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { AppStore } from '@/lib/store';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const store = AppStore.getInstance();
      setApiKey(store.getApiKey());
      setSavedSuccess(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const store = AppStore.getInstance();
    store.setApiKey(apiKey);
    setSavedSuccess(true);
    onKeySaved(apiKey);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult('Please enter an API key first.');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'What is a process control block?',
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(`Success! Model active: ${data.modelUsed}`);
      } else {
        setTestResult(`Test failed: ${data.error || 'Invalid key or quota limit'}`);
      }
    } catch (err: any) {
      setTestResult(`Network error: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = () => {
    const store = AppStore.getInstance();
    store.setApiKey('');
    setApiKey('');
    setSavedSuccess(true);
    onKeySaved('');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl shadow-indigo-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Google Gemini API Key</h3>
            <p className="text-xs text-slate-400">Configure real-time Gemini 1.5 Flash AI generation</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 p-3 text-xs text-indigo-200">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> GapFinder AI works out of the box with intelligent grounded heuristics. Adding your free Gemini API key upgrades it to live Gemini 1.5/2.0 Flash reasoning!
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
            >
              Get a free Gemini API key <ExternalLink className="w-3 h-3" />
            </a>
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-rose-400 hover:text-rose-300 transition"
              >
                Clear Key
              </button>
            )}
          </div>

          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                testResult.startsWith('Success')
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.startsWith('Success') ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Key saved successfully!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !apiKey}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
            >
              {testing ? 'Testing connection...' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
