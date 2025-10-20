-- QuestClash Supabase schema
-- Run this in Supabase SQL editor for your project

create extension if not exists "uuid-ossp";

-- Users
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  avatar text,
  level int default 1,
  xp int default 0,
  xp_to_next_level int default 1000,
  tier text check (tier in ('bronze','silver','gold','platinum')) default 'bronze',
  total_quests int default 0,
  completed_quests int default 0,
  streak int default 0,
  rank int default 0,
  badges jsonb default '[]'::jsonb,
  usdc_balance numeric(10,2) default 0,
  credits int default 0
);

-- Quests
create table if not exists public.quests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  category text check (category in ('fitness','learning','social','creative','wellness')),
  difficulty text check (difficulty in ('easy','medium','hard','extreme')),
  xp_reward int not null,
  usdc_reward numeric(10,2),
  voucher_reward text,
  duration text,
  participants int default 0,
  max_participants int,
  created_by text not null,
  status text check (status in ('active','completed','pending_validation')) default 'active',
  image text,
  requirements jsonb default '[]'::jsonb,
  verification_method text check (verification_method in ('photo','video','gps','community')),
  tier text check (tier in ('bronze','silver','gold','platinum')),
  start_date timestamptz not null,
  end_date timestamptz not null
);

-- Submissions
create table if not exists public.submissions (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  username text,
  evidence text,
  submitted_at timestamptz default now(),
  votes_for int default 0,
  votes_against int default 0,
  status text check (status in ('pending','approved','rejected')) default 'pending',
  time_remaining int default 0
);

-- Votes (optional detailed log)
create table if not exists public.votes (
  id uuid primary key default uuid_generate_v4(),
  submission_id uuid references public.submissions(id) on delete cascade,
  voter text not null,
  approve boolean not null,
  created_at timestamptz default now()
);

-- Leaderboard (cached)
create table if not exists public.leaderboard_entries (
  id bigserial primary key,
  rank int not null,
  username text not null,
  avatar text,
  level int,
  xp int,
  completed_quests int,
  tier text,
  streak int
);

-- RLS policies (development friendly; tighten for production)
alter table public.users enable row level security;
alter table public.quests enable row level security;
alter table public.submissions enable row level security;
alter table public.votes enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "Users read" on public.users for select using (true);
create policy "Users write" on public.users for insert with check (true);
create policy "Users update" on public.users for update using (true) with check (true);

create policy "Quests read" on public.quests for select using (true);
create policy "Quests write" on public.quests for insert with check (true);
create policy "Quests update" on public.quests for update using (true) with check (true);

create policy "Submissions read" on public.submissions for select using (true);
create policy "Submissions write" on public.submissions for insert with check (true);
create policy "Submissions update" on public.submissions for update using (true) with check (true);

create policy "Votes read" on public.votes for select using (true);
create policy "Votes write" on public.votes for insert with check (true);

create policy "Leaderboard read" on public.leaderboard_entries for select using (true);
create policy "Leaderboard write" on public.leaderboard_entries for insert with check (true);