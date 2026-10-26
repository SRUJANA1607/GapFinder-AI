'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  UploadCloud,
  FileQuestion,
  CalendarCheck,
  TrendingDown,
  TrendingUp,
  Search,
  Send,
  Calendar,
  Clock,
  ChevronRight,
  Filter,
  BarChart3,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { ClassOverviewData, StudentRecord, ClassTopicInsight } from '@/lib/types';
import { DEMO_CLASS_DATA } from '@/lib/demo-data';

export default function TeacherDashboard() {
  const [classData, setClassData] = useState<ClassOverviewData>(DEMO_CLASS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Needs Support' | 'On Track' | 'Excelling'>('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState("Deadlock Avoidance & Banker's Algorithm");
  const [newSessionDate, setNewSessionDate] = useState('2026-10-28');
  const [newSessionTime, setNewSessionTime] = useState('16:00');

  // Planned Remedial Sessions
  const [remedialSessions, setRemedialSessions] = useState([
    {
      id: 'sess_1',
      title: "Banker's Algorithm & Safe Sequences Problem Solving",
      topic: "Deadlock Avoidance & Banker's Algorithm",
      datetime: 'Mon, Oct 27 • 4:00 PM - 5:00 PM',
      location: 'LH-302 & Zoom Broadcast',
      targetCount: 32,
      priority: 'Urgent',
      status: 'Scheduled',
    },
    {
      id: 'sess_2',
      title: "Virtual Memory & Belady's Anomaly Counterexamples",
      topic: "Virtual Memory, Paging & Belady's Anomaly",
      datetime: 'Wed, Oct 29 • 3:30 PM - 4:45 PM',
      location: 'Seminar Hall B',
      targetCount: 26,
      priority: 'Urgent',
      status: 'Scheduled',
    },
    {
      id: 'sess_3',
      title: "Peterson's Algorithm & Concurrency Office Hours",
      topic: "Peterson's Algorithm & Critical Section",
      datetime: 'Fri, Oct 31 • 5:00 PM - 6:00 PM',
      location: 'Faculty Office & Online Chat',
      targetCount: 12,
      priority: 'Medium',
      status: 'Planned',
    },
  ]);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    setClassData(store.getClassData());

    const handleClassUpdate = () => {
      setClassData(store.getClassData());
    };
    window.addEventListener('gapfinder_class_changed', handleClassUpdate);
    return () => window.removeEventListener('gapfinder_class_changed', handleClassUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleBroadcastQuiz = (topicTitle: string) => {
    showNotification(`Remedial diagnostic quiz on "${topicTitle}" dispatched to all 48 students.`);
  };

  const handleSendStudentNudge = (student: StudentRecord) => {
    showNotification(`Personalized revision recommendation sent to ${student.name} (${student.email}).`);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;

    const newSess = {
      id: `sess_${Date.now()}`,
      title: newSessionTitle,
      topic: newSessionTopic,
      datetime: `${newSessionDate} • ${newSessionTime}`,
      location: 'LH-302 & Online Broadcast',
      targetCount: 28,
      priority: 'High' as const,
      status: 'Scheduled' as const,
    };

    setRemedialSessions([newSess, ...remedialSessions]);
    setIsScheduleModalOpen(false);
    setNewSessionTitle('');
    showNotification(`Remedial session "${newSess.title}" scheduled and added to class calendar.`);
  };

  const filteredStudents = classData.students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.weakestTopic.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-xl border border-slate-700 dark:border-slate-200 transition-all animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Welcome & Course Header Card */}
      <div className="rounded-2xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 text-xs">
                Teacher Dashboard
              </span>
              <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-2.5 py-0.5 text-xs">
                {classData.courseCode}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {classData.semester}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {classData.className}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Review aggregated student performance, identify class-wide misconceptions, monitor quiz attempts, and organize targeted revision sessions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/upload?role=teacher"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs"
            >
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              <span>Upload Class Material</span>
            </Link>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Plan Remedial Session</span>
            </button>

            <button
              onClick={() => handleBroadcastQuiz("Banker's Algorithm & Belady's Anomaly")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Quiz</span>
            </button>
          </div>
        </div>

        {/* 4 Core Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Class Average</span>
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {classData.averageScore}%
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Below 75% Target
              </span>
            </div>
          </div>

          <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Students Enrolled</span>
              <Users className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {classData.totalStudents}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                100% Diagnostic Completed
              </span>
            </div>
          </div>

          <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Critical Gaps</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {classData.criticalGapsCount} Topics
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                &lt; 50% Avg Mastery
              </span>
            </div>
          </div>

          <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Quiz Attempts</span>
              <FileQuestion className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {classData.diagnosticAttemptsCount}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Across 4 Modules
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Class-Wide Topic Gap Heatmap & Misconception Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Class Topic Performance Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>Class Topic Performance & Gap Distribution</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown across all 48 students showing weak, medium, and strong distribution.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Weak (&lt;50%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Medium (50-74%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Strong (≥75%)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {classData.topClassWeaknesses.map((topic) => {
                const total = classData.totalStudents;
                const weakPct = Math.round((topic.studentsWeakCount / total) * 100);
                const medPct = Math.round((topic.studentsMediumCount / total) * 100);
                const strongPct = Math.round((topic.studentsStrongCount / total) * 100);

                return (
                  <div
                    key={topic.topicId}
                    className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {topic.title}
                          </h3>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              topic.examFrequency === 'High'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {topic.examFrequency} Exam Yield
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {topic.unit}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-base font-extrabold ${
                            topic.classAverageScore < 50
                              ? 'text-rose-600 dark:text-rose-400'
                              : topic.classAverageScore < 75
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {topic.classAverageScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Class Avg</span>
                      </div>
                    </div>

                    {/* Multi-segment Distribution Bar */}
                    <div className="space-y-1">
                      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                        <div
                          style={{ width: `${weakPct}%` }}
                          className="bg-rose-500 h-full transition-all"
                          title={`${topic.studentsWeakCount} students Weak (${weakPct}%)`}
                        />
                        <div
                          style={{ width: `${medPct}%` }}
                          className="bg-amber-500 h-full transition-all"
                          title={`${topic.studentsMediumCount} students Medium (${medPct}%)`}
                        />
                        <div
                          style={{ width: `${strongPct}%` }}
                          className="bg-emerald-500 h-full transition-all"
                          title={`${topic.studentsStrongCount} students Strong (${strongPct}%)`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                        <span className="text-rose-600 dark:text-rose-400">
                          {topic.studentsWeakCount} Students Weak ({weakPct}%)
                        </span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {topic.studentsMediumCount} Medium ({medPct}%)
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {topic.studentsStrongCount} Strong ({strongPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Teacher Action Pill */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 italic truncate">
                        💡 {topic.recommendedIntervention}
                      </span>
                      <button
                        onClick={() => handleBroadcastQuiz(topic.title)}
                        className="shrink-0 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>Assign Drill</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Commonly Misunderstood Concepts (Misconceptions Radar) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Commonly Misunderstood Concepts</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI-detected blind spots across quiz response citations.
                </p>
              </div>
              <span className="rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                Priority
              </span>
            </div>

            <div className="space-y-3">
              {/* Misconception 1 */}
              <div className="rounded-xl p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-200">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Unsafe State vs. Deadlock Confusion</span>
                  </span>
                  <span className="rounded-full bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 text-[10px]">
                    34 / 48 Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Students marked unsafe states as already deadlocked, rather than recognizing that unsafe merely implies the OS cannot guarantee deadlock prevention under peak requests.
                </p>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <strong>Course Evidence:</strong> Prof. Mercer Lecture Notes p. 2 • Past Exam 2025 Q3 (10 Marks)
                </div>
                <button
                  onClick={() => handleBroadcastQuiz("Banker's Algorithm Need Matrix")}
                  className="w-full text-center py-1.5 text-[11px] font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
                >
                  Push Banker's Safety Clarification Drill
                </button>
              </div>

              {/* Misconception 2 */}
              <div className="rounded-xl p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Stack Algorithm Property in LRU</span>
                  </span>
                  <span className="rounded-full bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 text-[10px]">
                    22 / 48 Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Students struggled to explain mathematically why LRU never experiences Belady's Anomaly (subset inclusion rule where pages in n frames ⊆ n+1 frames).
                </p>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  <strong>Course Evidence:</strong> Modern OS Textbook Section 7.3 • Past Exam 2024 Q2b (6 Marks)
                </div>
                <button
                  onClick={() => handleBroadcastQuiz("Belady's Anomaly & LRU Stack Proof")}
                  className="w-full text-center py-1.5 text-[11px] font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition"
                >
                  Push Page Replacement Concept Check
                </button>
              </div>

              {/* Misconception 3 */}
              <div className="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Memory Barriers in Peterson's Solution</span>
                  </span>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px]">
                    16 / 48 Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Students proved mutual exclusion correctly on paper, but omitted CPU out-of-order execution memory barrier requirements on modern multi-core systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Student Performance Roster Table */}
      <div id="roster" className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Student Performance Roster & Progress Monitor</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track individual diagnostic scores, weakest topic gaps, and revision activity.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or gap..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
              {(['All', 'Needs Support', 'On Track', 'Excelling'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    statusFilter === filter
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Overall Score</th>
                <th className="py-3 px-3">Quizzes Taken</th>
                <th className="py-3 px-4">Weakest Topic</th>
                <th className="py-3 px-3">Study Streak</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                        {student.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {student.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{student.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black text-sm ${
                          student.overallScore < 50
                            ? 'text-rose-600 dark:text-rose-400'
                            : student.overallScore < 75
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {student.overallScore}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {student.quizzesTaken} attempts
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 px-2 py-0.5 text-[11px] font-semibold">
                      {student.weakestTopic}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    🔥 {student.streakDays} Days
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        student.status === 'Needs Support'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : student.status === 'On Track'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendStudentNudge(student);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition"
                      title="Send targeted revision nudge"
                    >
                      Nudge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Class Remedial Sessions Planner */}
      <div id="remedial" className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              <span>Class Revision & Remedial Sessions Schedule</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live intervention lectures planned based on diagnosed class gaps.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Session</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {remedialSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                    {session.priority} Priority
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{session.status}</span>
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {session.title}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Topic: {session.topic}
                </span>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{session.datetime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Target: {session.targetCount} Students with Gaps</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{session.location}</span>
                <button
                  onClick={() => showNotification(`Broadcast reminder sent for "${session.title}"`)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Send Reminder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Schedule Remedial Session */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
                <span>Schedule New Remedial Session</span>
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  placeholder="e.g. Banker's Algorithm Step-by-Step Workshop"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Topic Gap
                </label>
                <select
                  value={newSessionTopic}
                  onChange={(e) => setNewSessionTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Deadlock Avoidance & Banker's Algorithm">
                    Deadlock Avoidance & Banker's Algorithm (32 Students Weak)
                  </option>
                  <option value="Virtual Memory, Paging & Belady's Anomaly">
                    Virtual Memory, Paging & Belady's Anomaly (26 Students Weak)
                  </option>
                  <option value="Peterson's Algorithm & Critical Section">
                    Peterson's Algorithm & Critical Section (12 Students Weak)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSessionDate}
                    onChange={(e) => setNewSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={newSessionTime}
                    onChange={(e) => setNewSessionTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Detail Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold flex items-center justify-center text-sm">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedStudent.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{selectedStudent.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Overall Diagnostic</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedStudent.overallScore}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 block">Current Status</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedStudent.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block mb-1">
                  Primary Knowledge Gap
                </span>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {selectedStudent.weakestTopic}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Needs urgent review on Need Matrix computation before mid-term examination.
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/gap-report"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Diagnostic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  handleSendStudentNudge(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
              >
                Send Revision Nudge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
