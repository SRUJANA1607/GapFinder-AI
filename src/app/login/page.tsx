'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Brain,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Flame,
  X,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AppStore } from '@/lib/store';
import { DEMO_STUDENT, DEMO_TEACHER } from '@/lib/demo-data';
import { validateEmail } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signUpRole, setSignUpRole] = useState<'student' | 'teacher'>('student');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [demoModalInfo, setDemoModalInfo] = useState<{ title: string; message: string } | null>(null);

  // Read URL query parameters for redirects and OAuth errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      const errDesc = params.get('error_description');
      const redirectedFrom = params.get('redirectedFrom');

      if (err || errDesc) {
        setErrorMessage(decodeURIComponent(errDesc || err || 'Authentication failed. Please try again.'));
      } else if (redirectedFrom) {
        setErrorMessage('Please sign in to access your dashboard.');
      }
    }
  }, []);

  // Password strength checker helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signUpPassword);

  // Helper to translate Supabase Auth errors into clear, friendly guidance
  const formatAuthError = (err: { message?: string; code?: string; status?: number }) => {
    const msg = (err.message || '').toLowerCase();
    const code = err.code || '';

    if (code === 'over_email_send_rate_limit' || err.status === 429 || msg.includes('rate limit')) {
      return 'Email Rate Limit Reached: Supabase free tier limits built-in confirmation emails to 3 per hour. To fix this for local development: in your Supabase Dashboard, go to Authentication > Providers > Email, uncheck "Confirm email", and click Save. Or wait for the hourly window to reset.';
    }
    if (code === 'email_exists' || msg.includes('already registered') || msg.includes('user already exists')) {
      return 'An account with this email address already exists. Please switch to the Sign In tab.';
    }
    if (code === 'invalid_credentials' || msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'Invalid email address or password. Please verify your credentials and try again.';
    }
    if (code === 'weak_password' || msg.includes('password should be at least')) {
      return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    }
    if (code === 'email_address_invalid' || msg.includes('email address is invalid') || msg.includes('invalid email')) {
      return 'Please enter a valid email address with a real domain (e.g. name@gmail.com).';
    }
    return err.message || 'Authentication failed. Please check your credentials and try again.';
  };

  // --- Real Supabase Sign In ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const emailCheck = validateEmail(signInEmail);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || 'Please enter a valid email address, for example, name@gmail.com.');
      return;
    }

    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailCheck.sanitized,
        password: signInPassword,
      });

      if (error) {
        setIsLoading(false);
        setErrorMessage(formatAuthError(error));
        return;
      }

      if (data.user) {
        const role = data.user.user_metadata?.role || 'student';
        // Sync local store
        const store = AppStore.getInstance();
        store.updateUser({
          id: data.user.id,
          name: data.user.user_metadata?.name || emailCheck.sanitized.split('@')[0],
          email: data.user.email || emailCheck.sanitized,
          role: role,
          streakDays: 4,
          lastActiveDate: new Date().toISOString(),
          xp: 450,
          level: 3,
          badges: [],
        });

        const targetUrl = role === 'teacher' ? '/teacher' : '/dashboard';
        window.location.href = targetUrl;
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage('Connection error. Please check your network and Supabase credentials.');
    }
  };

  // --- Real Supabase Sign Up ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const emailCheck = validateEmail(signUpEmail);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || 'Please enter a valid email address, for example, name@gmail.com.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailCheck.sanitized,
        password: signUpPassword,
        options: {
          data: {
            name: signUpName.trim(),
            role: signUpRole,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setIsLoading(false);

      if (error) {
        setErrorMessage(formatAuthError(error));
        return;
      }

      if (data.user) {
        // If email confirmation is required by Supabase
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorMessage('An account with this email address already exists. Please sign in instead.');
          return;
        }

        if (data.session) {
          // Direct login (email confirmation disabled in Supabase)
          const store = AppStore.getInstance();
          store.updateUser({
            id: data.user.id,
            name: signUpName.trim(),
            email: signUpEmail.trim(),
            role: signUpRole,
            streakDays: 1,
            lastActiveDate: new Date().toISOString(),
            xp: 100,
            level: 1,
            badges: [],
          });
          router.refresh();
          router.push(signUpRole === 'teacher' ? '/teacher' : '/dashboard');
        } else {
          // Email confirmation link sent
          setSuccessMessage(
            'Account created successfully! We sent a confirmation link to your email. Please verify to activate your account.'
          );
        }
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage('Registration failed. Please check your network and Supabase settings.');
    }
  };

  // --- Real Google OAuth with Supabase ---
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes('your-project-id')) {
      setIsGoogleLoading(false);
      setErrorMessage(
        'Supabase is not configured yet. Please enter your Supabase Project URL and anon key into .env.local'
      );
      return;
    }

    try {
      // Check if Google OAuth provider is enabled in the Supabase project
      try {
        const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: anonKey },
        });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.external && settings.external.google === false) {
            setIsGoogleLoading(false);
            setErrorMessage(
              'Google OAuth is not enabled in your Supabase project yet. In your Supabase Dashboard, go to Authentication > Providers > Google, toggle it ON, and add your Google Client ID and Secret.'
            );
            return;
          }
        }
      } catch {
        // Continue to OAuth if network check is blocked
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setIsGoogleLoading(false);
        setErrorMessage(error.message);
      }
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      setErrorMessage('Failed to initiate Google authentication. Please verify Google OAuth setup in Supabase.');
    }
  };

  // --- Real Supabase Forgot Password ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const emailCheck = validateEmail(forgotEmail);
    if (!emailCheck.isValid) {
      setForgotError(emailCheck.error || 'Please enter a valid email address, for example, name@gmail.com.');
      return;
    }

    setForgotLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailCheck.sanitized, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      setForgotLoading(false);

      if (error) {
        setForgotError(error.message);
      } else {
        setForgotSuccess(
          'Password reset link sent! Check your inbox and follow the instructions to set a new password.'
        );
      }
    } catch (err: unknown) {
      setForgotLoading(false);
      setForgotError('Unable to send reset email. Please ensure Supabase Auth email settings are enabled.');
    }
  };

  // --- Secure Server-Side Demo Login Handlers ---
  const handleDemoLogin = async (role: 'student' | 'teacher') => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.notConfigured) {
        setDemoModalInfo({
          title: `Demo ${role === 'teacher' ? 'Teacher' : 'Student'} Account Not Configured`,
          message:
            `1-Click demo access requires server-side test credentials.\n\nTo enable this, configure the following server-only variables in your .env.local file:\n• DEMO_${role.toUpperCase()}_EMAIL\n• DEMO_${role.toUpperCase()}_PASSWORD\n\n(These variables are kept strictly on the server and are never exposed to browser bundles or client code).\n\nAlternatively, you can create a test account on the Sign Up tab or sign in directly with Google.`,
        });
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Demo authentication failed.');
        return;
      }

      // Synchronize client store with authenticated user info
      const store = AppStore.getInstance();
      store.updateUser({
        id: data.userId || ('demo-' + role),
        name: data.userName || (role === 'teacher' ? 'Demo Teacher' : 'Demo Student'),
        email: data.userEmail || (role === 'teacher' ? 'teacher@gapfinder.ai' : 'student@gapfinder.ai'),
        role: data.role || role,
        streakDays: 4,
        lastActiveDate: new Date().toISOString(),
        xp: 450,
        level: 3,
        badges: [],
      });

      const targetUrl = data.redirectUrl || (role === 'teacher' ? '/teacher' : '/dashboard');
      window.location.href = targetUrl;
    } catch {
      setIsLoading(false);
      setErrorMessage('Network connection error during demo authentication.');
    }
  };

  const handleDemoStudentLogin = () => handleDemoLogin('student');
  const handleDemoTeacherLogin = () => handleDemoLogin('teacher');

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* =========================================================================
          LEFT PANEL — Authentication Interface (~55% width on desktop)
         ========================================================================= */}
      <div className="w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="max-w-md w-full mx-auto space-y-7">
          {/* Logo & Project Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                <span>GapFinder</span>
                <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-0.5">
                Precision Academic Diagnostic
              </span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'signin' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {activeTab === 'signin'
                ? 'Sign in to access your knowledge gap diagnosis and revision plans.'
                : 'Join GapFinder AI to discover your learning blind spots and excel.'}
            </p>
          </div>

          {/* Segmented Sign In / Sign Up Tabs */}
          <div className="flex items-center rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert / Feedback Messages */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* =========================================================================
              FORM 1: SIGN IN FORM
             ========================================================================= */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(signInEmail);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showSignInPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* =========================================================================
              FORM 2: SIGN UP FORM
             ========================================================================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('student')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition ${
                      signUpRole === 'student'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpRole('teacher')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition ${
                      signUpRole === 'teacher'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Teacher</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {signUpPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Strength: <strong className="text-slate-700 dark:text-slate-300">{strength.label}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  I agree to the <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Terms of Service</span> and <span className="text-indigo-600 dark:text-indigo-400 font-semibold underline">Privacy Policy</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* =========================================================================
              GOOGLE OAUTH BUTTON (Divider & Clean Full-Width Button)
             ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                OR CONTINUE WITH
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* =========================================================================
              JUDGE DEMO ACCESS BOX (Clearly separated from normal authentication)
             ========================================================================= */}
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Evaluator Instant Demo Access</span>
              </div>
              <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 text-[10px] font-bold">
                Test Accounts
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Quick access using pre-configured test credentials, or sign up with any valid email above:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleDemoStudentLogin}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-60"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={handleDemoTeacherLogin}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-60"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Demo Teacher</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto pt-6 text-center text-xs text-slate-400">
          <span>&copy; 2026 GapFinder AI. All rights reserved.</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL — Educational Branding & Visuals (~45% width on desktop)
         ========================================================================= */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden border-l border-indigo-900/40">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-400/30 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Knowledge Diagnostic Engine</span>
          </div>
        </div>

        {/* Educational Visual Composition */}
        <div className="relative z-10 my-auto space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Discover Your Learning Gaps. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
                Unlock Your Potential.
              </span>
            </h2>
            <p className="text-xs xl:text-sm text-indigo-200/80 leading-relaxed max-w-lg">
              Personalized learning insights that help you understand what you know, identify what you need to improve, and learn with confidence.
            </p>
          </div>

          {/* Floating Educational Cards & Connected Nodes Illustration */}
          <div className="space-y-3 pt-2">
            {/* Card 1: Diagnostic Gap Identification */}
            <div className="rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 shadow-xl space-y-2 hover:scale-[1.02] transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Syllabus & Past Paper Diagnosis</span>
                </span>
                <span className="rounded-md bg-rose-500/20 border border-rose-400/30 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                  Gap Found (&lt;50%)
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/90">
                <strong>Deadlock Avoidance & Banker&apos;s Algorithm:</strong> Need matrix safe state calculation missed in 2 consecutive past exams.
              </div>
            </div>

            {/* Card 2: Adaptive Revision Plan */}
            <div className="rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 shadow-xl space-y-2 hover:scale-[1.02] transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Adaptive Day-by-Day Revision</span>
                </span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                  High Yield Priority
                </span>
              </div>
              <div className="text-[11px] text-indigo-200/90">
                Generated 7-day study timetable scheduling urgent gaps first before routine reviews.
              </div>
            </div>

            {/* Micro Badge Row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-indigo-200">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Provable Citations</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-indigo-200">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Exam Frequency Weightage</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Pill */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-indigo-300/80 pt-4 border-t border-white/10">
          <span>Grounded in your own syllabus, notes & past papers</span>
          <span>Zero hallucinations</span>
        </div>
      </div>

      {/* =========================================================================
          FORGOT PASSWORD MODAL (Real Supabase Auth Email Reset)
         ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reset Your Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter the email address associated with your account. We will send you a genuine password reset link through Supabase Auth.
            </p>

            {forgotError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotPassword} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5"
                  >
                    {forgotLoading ? <span>Sending...</span> : <span>Send Reset Link</span>}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          DEMO ACCOUNT CONFIGURATION INFO MODAL
         ========================================================================= */}
      {demoModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <span>{demoModalInfo.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalInfo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {demoModalInfo.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDemoModalInfo(null);
                  setActiveTab('signup');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
              >
                Open Sign Up Tab
              </button>
              <button
                type="button"
                onClick={() => setDemoModalInfo(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
