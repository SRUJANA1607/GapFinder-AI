-- =========================================================================
-- GapFinder AI: Safe Additive Profile Fields Migration
-- Run this in your Supabase Dashboard SQL Editor (SQL Editor > New query).
-- 100% additive: contains ZERO DROP, DELETE, or ALTER TYPE statements.
-- Preserves all existing tables, rows, and data.
-- =========================================================================

-- 1. Safely add personal & education columns to public.profiles if not present
alter table public.profiles
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists institution text,
  add column if not exists degree text,
  add column if not exists department text,
  add column if not exists year_semester text,
  add column if not exists roll_number text,
  add column if not exists academic_interests text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Ensure RLS policies permit users to select and update their own full profile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile" on public.profiles
      for select using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile" on public.profiles
      for update using (auth.uid() = id);
  end if;
end $$;
