'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Trophy, Sparkles, X } from 'lucide-react';

interface StreakCelebrationProps {
  show: boolean;
  streakDays: number;
  xpEarned: number;
  message?: string;
  onClose: () => void;
}

export default function StreakCelebration({
  show,
  streakDays,
  xpEarned,
  message = 'Streak kept alive! Keep up the daily exam prep!',
  onClose,
}: StreakCelebrationProps) {
  useEffect(() => {
    if (show) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#eab308', '#6366f1', '#ec4899', '#10b981'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border border-amber-500/40 p-4 shadow-2xl shadow-amber-500/20 backdrop-blur-md max-w-sm">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded-md p-1 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/40 animate-bounce">
          <Flame className="w-7 h-7 fill-white" />
        </div>

        <div className="pr-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-300">
              🔥 {streakDays} Day Streak!
            </span>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
              +{xpEarned} XP
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-snug">{message}</p>
        </div>
      </div>
    </div>
  );
}
