'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Building,
  BookOpen,
  Calendar,
  Hash,
  Phone,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Zap,
  Award,
  ArrowLeft,
  Loader2,
  Layers,
  FileText,
} from 'lucide-react';
import { AppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';

interface ProfileData {
  id: string;
  email: string;
  emailVerified: boolean;
  role: 'student' | 'teacher' | 'judge';
  createdAt?: string;
  name: string;
  phone: string;
  bio: string;
  institution: string;
  degree: string;
  department: string;
  yearSemester: string;
  rollNumber: string;
  academicInterests: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [appUser, setAppUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch verified profile from secure server API
  const fetchProfile = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        window.location.href = '/login?redirectedFrom=/profile';
        return;
      }
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setFormData(data.profile);
      } else {
        setErrorMessage(data.error || 'Failed to load profile details.');
      }
    } catch {
      setErrorMessage('Network error fetching profile. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const store = AppStore.getInstance();
    store.initStore();
    setAppUser(store.getUser());

    const handleUserChanged = () => {
      setAppUser(store.getUser());
    };
    window.addEventListener('gapfinder_user_changed', handleUserChanged);
    return () => window.removeEventListener('gapfinder_user_changed', handleUserChanged);
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          institution: formData.institution,
          degree: formData.degree,
          department: formData.department,
          yearSemester: formData.yearSemester,
          rollNumber: formData.rollNumber,
          academicInterests: formData.academicInterests,
        }),
      });

      const result = await res.json();
      setIsSaving(false);

      if (!res.ok || !result.success) {
        setErrorMessage(result.error || 'Failed to update profile.');
        return;
      }

      setProfile(result.profile);
      setFormData(result.profile);
      setIsEditing(false);
      setSuccessMessage('Your profile has been saved successfully.');

      // Synchronize with local AppStore for immediate UI reflection in header & sidebar
      const store = AppStore.getInstance();
      const current = store.getUser();
      if (current) {
        store.updateUser({
          ...current,
          name: result.profile.name,
          phone: result.profile.phone,
          bio: result.profile.bio,
          institution: result.profile.institution,
          degree: result.profile.degree,
          department: result.profile.department,
          yearSemester: result.profile.yearSemester,
          rollNumber: result.profile.rollNumber,
          academicInterests: result.profile.academicInterests,
        });
      }

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch {
      setIsSaving(false);
      setErrorMessage('Network error while saving profile. Please try again.');
    }
  };

  const isTeacher = profile?.role === 'teacher';

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Active Member';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading your authenticated profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 lg:p-10 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Link
              href={isTeacher ? '/teacher' : '/dashboard'}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {isTeacher ? 'Class Overview' : 'Dashboard'}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">My Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account & Academic Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal academic identity, institution credentials, and study preferences.
          </p>
        </div>

        {/* Edit / Save Action Buttons */}
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition disabled:opacity-60 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-rose-800 dark:text-rose-200 text-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Profile Banner Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative gradient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Big Avatar */}
            <div
              className={`flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-2xl font-black text-2xl sm:text-3xl shadow-lg ${
                isTeacher
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-indigo-500/25'
              }`}
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>

            {/* Profile Identity Details */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {profile?.name || 'Academic User'}
                </h2>

                {/* Role Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isTeacher
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                  }`}
                >
                  {isTeacher ? (
                    <>
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Course Instructor / Teacher</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>Registered Student</span>
                    </>
                  )}
                </span>
              </div>

              {/* Verified Email & Member Since */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile?.email}</span>
                </span>

                <span className="text-slate-300 dark:text-slate-700">•</span>

                {profile?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Supabase Session</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Active Session</span>
                  </span>
                )}

                <span className="text-slate-300 dark:text-slate-700">•</span>

                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {memberSince}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Academic Snapshot Pills */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
            {profile?.institution ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>{profile.institution}</span>
              </span>
            ) : null}
            {profile?.department ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>{profile.department}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content Form & Details Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* =========================================================================
            LEFT COLUMN (2 / 3 width on desktop) — Personal & Education Information
           ========================================================================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Personal Information */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primary personal details and contact preferences.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Full Name</span>
                  {isEditing && <span className="text-[10px] text-rose-500 font-semibold">Required</span>}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    required
                  />
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-semibold border border-slate-100 dark:border-slate-800">
                    {profile?.name || '—'}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={formData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Bio / Summary */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Bio & Academic Objective</span>
                  {isEditing && (
                    <span className="text-[10px] text-slate-400">
                      {(formData?.bio || '').length}/500 chars
                    </span>
                  )}
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={formData?.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Briefly describe your academic background, current learning focus, or areas you are aiming to master..."
                    maxLength={500}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                  />
                ) : (
                  <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                    {profile?.bio ||
                      'No bio added yet. Click "Edit Profile" to share your academic objective and study focus.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Education & Academic Information */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Education & Academic Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Institution affiliation, degree program, and specialized interests.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Institution */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institution / University
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData?.institution || ''}
                      onChange={(e) => handleInputChange('institution', e.target.value)}
                      placeholder="e.g. Stanford University / MIT / IIT Delhi"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.institution || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Degree / Program */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Degree / Program
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.degree || ''}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.degree || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Department / Major */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Department / Major
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g. Computer Science and Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.department || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Year / Semester */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Year / Semester
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.yearSemester || ''}
                    onChange={(e) => handleInputChange('yearSemester', e.target.value)}
                    placeholder="e.g. 3rd Year / 6th Semester"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.yearSemester || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Roll Number / Student ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isTeacher ? 'Faculty / Employee ID' : 'Roll Number / Student ID'}
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={formData?.rollNumber || ''}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      placeholder={isTeacher ? 'e.g. FAC-2024-089' : 'e.g. 21CS042'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ) : (
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-medium border border-slate-100 dark:border-slate-800">
                    {profile?.rollNumber || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Academic Interests */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Academic Interests & Core Focus
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.academicInterests || ''}
                    onChange={(e) => handleInputChange('academicInterests', e.target.value)}
                    placeholder="e.g. Operating Systems, Virtual Memory, Concurrency, File Systems"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    {profile?.academicInterests ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.academicInterests.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{tag.trim()}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No academic interests specified yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* In Edit Mode: Bottom Save / Cancel Bar */}
            {isEditing && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (1 / 3 width on desktop) — Security, RLS & GapFinder Stats
           ========================================================================= */}
        <div className="space-y-6">
          {/* Diagnostic Engagement Stats Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Diagnostic Engagement</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Daily Streak */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    Activity Streak
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-900 dark:text-amber-200">
                  {appUser?.streakDays || 4}{' '}
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Days
                  </span>
                </div>
              </div>

              {/* Diagnostic XP */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/40">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                  <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                    Diagnostic Level
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-indigo-900 dark:text-indigo-200">
                  Lvl {appUser?.level || 3}{' '}
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    ({appUser?.xp || 450} XP)
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Unlocked */}
            {appUser?.badges && appUser.badges.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Earned Achievements
                </span>
                <div className="space-y-2">
                  {appUser.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <div className="truncate flex-1">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {badge.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {badge.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
