-- Run this once in Supabase SQL Editor when you are ready to add accounts and cloud data.
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text default 'Violet',
  created_at timestamptz default now()
);
create table if not exists public.study_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  kind text default 'study'
);
alter table public.subjects enable row level security;
alter table public.study_events enable row level security;
create policy "users manage their subjects" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage their own events" on public.study_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
