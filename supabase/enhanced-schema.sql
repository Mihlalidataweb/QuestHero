-- Enhanced QuestClash Supabase schema with XP transaction tracking
-- Run this in Supabase SQL editor for your project

-- Add XP transactions table for tracking all XP movements
create table if not exists public.xp_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  username text not null,
  transaction_type text check (transaction_type in ('signup_bonus','quest_creation_fee','quest_join_fee','quest_completion_reward','quest_creation_refund')) not null,
  amount int not null, -- positive for gains, negative for costs
  quest_id uuid references public.quests(id) on delete set null,
  description text,
  created_at timestamptz default now()
);

-- Add quest participants table to track who joined which quests
create table if not exists public.quest_participants (
  id uuid primary key default uuid_generate_v4(),
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  username text not null,
  joined_at timestamptz default now(),
  status text check (status in ('joined','submitted','completed','failed')) default 'joined',
  evidence_submitted boolean default false,
  unique(quest_id, user_id)
);

-- Add user wallet addresses table for base wallet integration
create table if not exists public.user_wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  wallet_address text not null unique,
  wallet_type text default 'base',
  created_at timestamptz default now()
);

-- Update users table to include reward points (separate from XP)
alter table public.users add column if not exists reward_points int default 100; -- Start with 100 points
alter table public.users add column if not exists wallet_address text;
alter table public.users add column if not exists created_at timestamptz default now();
alter table public.users add column if not exists last_login timestamptz default now();

-- Update quests table to include creator reward point cost
alter table public.quests add column if not exists creator_cost int default 0;
alter table public.quests add column if not exists join_cost int default 0;
alter table public.quests add column if not exists created_at timestamptz default now();

-- RLS policies for new tables
alter table public.xp_transactions enable row level security;
alter table public.quest_participants enable row level security;
alter table public.user_wallets enable row level security;

create policy "XP transactions read" on public.xp_transactions for select using (true);
create policy "XP transactions write" on public.xp_transactions for insert with check (true);

create policy "Quest participants read" on public.quest_participants for select using (true);
create policy "Quest participants write" on public.quest_participants for insert with check (true);
create policy "Quest participants update" on public.quest_participants for update using (true) with check (true);

create policy "User wallets read" on public.user_wallets for select using (true);
create policy "User wallets write" on public.user_wallets for insert with check (true);

-- Function to generate unique usernames
create or replace function generate_unique_username()
returns text as $$
declare
  base_name text := 'user';
  random_suffix text;
  attempt_count int := 0;
  max_attempts int := 100;
  candidate_name text;
begin
  loop
    -- Generate random 6-character suffix
    random_suffix := substr(md5(random()::text), 1, 6);
    candidate_name := base_name || '_' || random_suffix;
    
    -- Check if username exists
    if not exists (select 1 from public.users where username = candidate_name) then
      return candidate_name;
    end if;
    
    attempt_count := attempt_count + 1;
    if attempt_count >= max_attempts then
      raise exception 'Could not generate unique username after % attempts', max_attempts;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Function to handle user registration with signup bonus
create or replace function register_user_with_bonus(wallet_addr text)
returns uuid as $$
declare
  new_user_id uuid;
  new_username text;
begin
  -- Generate unique username
  new_username := generate_unique_username();
  
  -- Create user with signup bonus
  insert into public.users (username, wallet_address, xp, reward_points)
  values (new_username, wallet_addr, 100, 100)
  returning id into new_user_id;
  
  -- Record signup bonus transaction
  insert into public.xp_transactions (user_id, username, transaction_type, amount, description)
  values (new_user_id, new_username, 'signup_bonus', 100, 'Welcome bonus for new user registration');
  
  -- Create wallet record
  insert into public.user_wallets (user_id, wallet_address)
  values (new_user_id, wallet_addr);
  
  return new_user_id;
end;
$$ language plpgsql;