import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayoutShell from '@/components/AppLayoutShell';

export const metadata: Metadata = {
  title: 'GapFinder AI - Precision Academic Diagnostic & Revision Engine',
  description:
    'Proactively diagnoses student knowledge gaps from syllabus, lecture notes, textbooks, and past papers. Generates grounded quizzes and adaptive revision plans.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/20 selection:text-indigo-600">
        <ThemeProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
