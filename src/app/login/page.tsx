'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  Lightbulb,
  FileCheck,
  Calendar,
  Lock,
  Mail,
  Zap,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { DEMO_STUDENT, DEMO_TEACHER } from '@/lib/demo-data';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleInstantStudentLogin = () => {
    const store = AppStore.getInstance();
    store.updateUser(DEMO_STUDENT);
    router.push('/dashboard');
  };

  const handleInstantTeacherLogin = () => {
    const store = AppStore.getInstance();
    store.updateUser(DEMO_TEACHER);
    router.push('/teacher');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = AppStore.getInstance();

    if (selectedRole === 'teacher') {
      store.updateUser({
        ...DEMO_TEACHER,
        name: email ? (email.split('@')[0].includes('jenkins') ? 'Prof. Sarah Jenkins' : email.split('@')[0]) : 'Prof. Sarah Jenkins',
        email: email || 'teacher@gapfinder.ai',
        role: 'teacher',
      });
      router.push('/teacher');
    } else {
      store.updateUser({
        ...DEMO_STUDENT,
        name: email ? (email.split('@')[0].includes('alex') ? 'Alex Mercer' : email.split('@')[0]) : 'Alex Mercer',
        email: email || 'student@gapfinder.ai',
        role: 'student',
      });
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sign In to GapFinder <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Please choose whether you are signing in as a <span className="font-semibold text-indigo-600 dark:text-indigo-400">Student</span> to identify knowledge gaps or as a <span className="font-semibold text-emerald-600 dark:text-emerald-400">Teacher</span> to review class-wide mastery.
            </p>
          </div>
        </div>

        {/* Step 1: Explicit Role Question & Instant One-Click Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step 1: Choose Your Role to Sign In
            </span>
            <span className="text-xs font-medium text-slate-400">
              Instant 1-Click login available for judges
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Role Card */}
            <div
              onClick={() => setSelectedRole('student')}
              className={`cursor-pointer rounded-2xl p-6 transition-all relative border flex flex-col justify-between ${
                selectedRole === 'student'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>I am a Student</span>
                        {selectedRole === 'student' && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Primary Experience
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-bold">
                    Personalized
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload your syllabus and past papers, take diagnostic quizzes, uncover weak/medium/strong topics, and receive an adaptive revision timetable.
                </p>

                {/* Features Pill List */}
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Upload notes, textbooks & exam papers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>AI diagnostic quiz with citation evidence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Personalized 7-day adaptive revision plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Explain-This-Topic grounded tutor</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInstantStudentLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 text-xs shadow-sm transition"
                >
                  <span>Sign In as Student (Alex Mercer)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teacher Role Card */}
            <div
              onClick={() => setSelectedRole('teacher')}
              className={`cursor-pointer rounded-2xl p-6 transition-all relative border flex flex-col justify-between ${
                selectedRole === 'teacher'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>I am a Teacher</span>
                        {selectedRole === 'teacher' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Class Intelligence
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    Aggregated
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Upload syllabus & learning materials for a class, review topic performance, identify commonly misunderstood concepts, and plan revision sessions.
                </p>

                {/* Features Pill List */}
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Upload course materials & syllabus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Class-level topic gap heatmap (48 students)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Common misconceptions radar & evidence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Plan & broadcast class remedial sessions</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInstantTeacherLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 text-xs shadow-sm transition"
                >
                  <span>Sign In as Teacher (Prof. Sarah Jenkins)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Custom Credentials Form */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Or Sign In with Credentials
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Will sign you into the{' '}
                <strong className={selectedRole === 'teacher' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                  {selectedRole === 'teacher' ? 'Teacher Dashboard (/teacher)' : 'Student Dashboard (/dashboard)'}
                </strong>
              </p>
            </div>

            {/* Active Role Selector Segment */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'student'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRole === 'teacher'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Teacher Mode</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'teacher' ? 'teacher@gapfinder.ai' : 'student@gapfinder.ai'}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Preloaded with CS301 Operating Systems Demo Data</span>
              </div>

              <button
                type="submit"
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-6 text-xs font-bold text-white shadow-sm transition ${
                  selectedRole === 'teacher'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>
                  {selectedRole === 'teacher' ? 'Sign In to Teacher Dashboard' : 'Sign In to Student Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Demo Credentials Footer for Judges */}
        <div className="rounded-xl p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Hackathon Judge & Evaluator Reference
            </span>
            <span className="text-slate-500 dark:text-slate-400 block">
              Student demo: <code className="font-mono text-indigo-600 dark:text-indigo-400">student@gapfinder.ai</code> • Teacher demo: <code className="font-mono text-emerald-600 dark:text-emerald-400">teacher@gapfinder.ai</code>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Skip to Student Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
