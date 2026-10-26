'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { createClient } from '@/lib/supabase/client';
import { AppStore } from '@/lib/store';

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname.startsWith('/auth');

  useEffect(() => {
    if (isAuthPage) return;

    const syncAuthenticatedUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const store = AppStore.getInstance();
          store.initStore();
          const current = store.getUser();

          const email = user.email || '';
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (email ? email.split('@')[0] : 'Student');

          let role = user.user_metadata?.role || (current?.role || 'student');
          try {
            const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
            if (p?.role) role = p.role;
          } catch {
            // fallback
          }

          if (!current || current.email !== email || current.name !== name || current.id !== user.id || current.role !== role) {
            store.updateUser({
              id: user.id,
              name,
              email,
              role,
              streakDays: current?.streakDays || 1,
              lastActiveDate: new Date().toISOString(),
              xp: current?.xp || 100,
              level: current?.level || 1,
              badges: current?.badges || [],
            });
          }
        }
      } catch (err) {
        console.warn('Failed to sync auth user to AppStore:', err);
      }
    };

    syncAuthenticatedUser();
  }, [pathname, isAuthPage]);

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-50 dark:bg-[#0b0f19]">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
