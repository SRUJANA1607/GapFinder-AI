'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileQuestion,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Zap,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { QuizQuestion, Topic, QuizAttempt } from '@/lib/types';
import CitationCard from '@/components/CitationCard';
import confetti from 'canvas-confetti';

function QuizContent() {
  const searchParams = useSearchParams();
  const initialTopicId = searchParams?.get('topicId') || 'all';

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'guess'>('high');
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    confidence: 'high' | 'medium' | 'guess';
    timeSpentSeconds: number;
  }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const store = AppStore.getInstance();
    store.initStore();
    const loadedTopics = store.getTopics();
    setTopics(loadedTopics);
    loadQuestions(selectedTopicId);
  }, []);

  // Timer
  useEffect(() => {
    if (quizFinished) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [quizFinished]);

  const loadQuestions = async (topicId: string) => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setUserAnswers([]);
    setSecondsElapsed(0);

    const store = AppStore.getInstance();
    const allQuestions = store.getQuestions();

    let filtered = allQuestions;
    if (topicId !== 'all') {
      filtered = allQuestions.filter((q) => q.topicId === topicId);
    }

    // If no preloaded questions for that topic, request grounded generation
    if (filtered.length === 0) {
      try {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId,
            apiKey: store.getApiKey(),
          }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          filtered = data.questions;
          store.addQuestions(data.questions);
        }
      } catch (err) {
        console.warn('Quiz generation fetch error:', err);
      }
    }

    setQuestions(filtered.length > 0 ? filtered : allQuestions);
    setLoading(false);
  };

  const handleTopicChange = (newTopicId: string) => {
    setSelectedTopicId(newTopicId);
    loadQuestions(newTopicId);
  };

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasSubmittedAnswer) return;

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswerIndex;

    const answerRecord = {
      questionId: currentQ.id,
      selectedOption,
      isCorrect,
      confidence,
      timeSpentSeconds: secondsElapsed,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
    setHasSubmittedAnswer(true);

    if (isCorrect) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setConfidence('high');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const store = AppStore.getInstance();

    const correctCount = userAnswers.filter((a) => a.isCorrect).length + (selectedOption === questions[currentIndex]?.correctAnswerIndex ? (hasSubmittedAnswer ? 0 : 1) : 0);
    const totalCount = questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      date: new Date().toISOString(),
      topicIds: selectedTopicId === 'all' ? topics.map((t) => t.id) : [selectedTopicId],
      totalQuestions: totalCount,
      score: correctCount,
      percentage,
      answers: userAnswers,
    };

    store.recordQuizAttempt(attempt);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const currentQ = questions[currentIndex];
  const isAnswered = hasSubmittedAnswer;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Topic Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Grounded Diagnostic Quiz
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Questions synthesized strictly from your uploaded textbook, notes, and past exam questions.
          </p>
        </div>

        {/* Topic dropdown selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">Assessing:</label>
          <select
            value={selectedTopicId}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Full Course Diagnostic (All Topics)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="clean-card p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Retrieving grounded chunks & assembling questions...
          </p>
        </div>
      ) : quizFinished ? (
        /* Quiz Finished View */
        <div className="clean-card p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Diagnostic Assessment Complete!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your topic mastery scores and gap diagnosis have been automatically updated.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Score</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {userAnswers.filter((a) => a.isCorrect).length} / {questions.length}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round((userAnswers.filter((a) => a.isCorrect).length / questions.length) * 100)}%
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">XP Earned</span>
              <span className="text-lg sm:text-xl font-bold text-amber-500">+60 XP</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/gap-report"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition"
            >
              <span>View Updated Gap Report & Heatmap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => loadQuestions(selectedTopicId)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Diagnostic Assessment</span>
            </button>
          </div>
        </div>
      ) : currentQ ? (
        /* Active Question Card */
        <div className="clean-card p-6 sm:p-8 space-y-6">
          {/* Progress bar & Timer */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>•</span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
                {currentQ.topicTitle}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Timer className="w-3.5 h-3.5" />
              <span>{Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  currentQ.difficulty === 'Hard'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    : currentQ.difficulty === 'Medium'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {currentQ.difficulty} Difficulty
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.correctAnswerIndex;

              let optionStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700';
              if (isSelected && !isAnswered) {
                optionStyle = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-white shadow-xs';
              } else if (isAnswered) {
                if (isCorrectAnswer) {
                  optionStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                } else {
                  optionStyle = 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer ${optionStyle}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs leading-relaxed font-semibold mt-0.5">{opt}</span>
                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-auto" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Confidence Selector */}
          {!isAnswered && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Confidence Level (calibrates lucky guesses):
              </span>
              <div className="flex items-center gap-2">
                {[
                  { id: 'high', label: '100% Confident' },
                  { id: 'medium', label: 'Fairly Sure' },
                  { id: 'guess', label: 'Educated Guess' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConfidence(item.id as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      confidence === item.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Answer Evaluation & Citations */}
          {isAnswered && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {selectedOption === currentQ.correctAnswerIndex ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Correct Answer (+20 XP)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-3 py-1 text-xs font-bold">
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Conceptual Gap Detected
                  </span>
                )}
                {confidence === 'guess' && selectedOption === currentQ.correctAnswerIndex && (
                  <span className="rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    Lucky Guess Flagged
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Explanation & Diagnostic Rubric:</span>
                <p>{currentQ.explanation}</p>
              </div>

              {/* Source Citation */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Verifiable Source Citation:
                </span>
                <CitationCard
                  docName={currentQ.citation.docName}
                  section={currentQ.citation.section}
                  snippet={currentQ.citation.snippet}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isAnswered ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                Submit Answer for Diagnosis
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Diagnosis'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading Diagnostic Quiz...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
