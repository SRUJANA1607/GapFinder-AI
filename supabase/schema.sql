-- =========================================================================
-- GapFinder AI: Safe, Non-Destructive Profiles & Roles Setup
-- 100% additive script: contains ZERO DROP, DELETE, or TRUNCATE statements.
-- Preserves all existing tables and data.
-- =========================================================================

-- 1. Create profiles table if it does not already exist
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  email text,
  role text default 'student' check (role in ('student', 'teacher', 'admin')),
  phone text,
  bio text,
  institution text,
  degree text,
  department text,
  year_semester text,
  roll_number text,
  academic_interests text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS) safely
alter table public.profiles enable row level security;

-- 3. Create RLS Policies safely without dropping anything
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

-- 4. Create or replace the function that auto-creates a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach trigger safely without dropping existing triggers
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
  end if;
end $$;
