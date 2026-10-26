'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Key,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { DEMO_USER } from '@/lib/demo-data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'judge'>('judge');

  const handleDemoJudgeLogin = () => {
    const store = AppStore.getInstance();
    store.updateUser(DEMO_USER);
    router.push('/dashboard');
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const store = AppStore.getInstance();
    store.updateUser({
      ...DEMO_USER,
      name: email ? email.split('@')[0] : 'Student User',
      email: email || 'student@university.edu',
      role: 'student',
    });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/30">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Sign In to GapFinder AI</h1>
          <p className="text-xs text-slate-400">
            Access your personalized knowledge gap diagnoses and adaptive revision schedules.
          </p>
        </div>

        {/* 1-Click Judge Access Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/40 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Hackathon Judge & Evaluator Access
              </span>
            </div>
            <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
              Instant
            </span>
          </div>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Demo Email:</span>
              <span className="font-mono text-indigo-300">judge@gapfinder.ai</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Demo Password:</span>
              <span className="font-mono text-indigo-300">demo_judge_2026</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoJudgeLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition"
          >
            <span>Instant Judge Login (Prof. Alex Mercer)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Regular Student Login Form */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Student Authentication
            </span>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Sign In as Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
