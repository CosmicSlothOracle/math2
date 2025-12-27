-- Supabase schema for Math2 app
-- Run in Supabase SQL editor

-- Enable pgcrypto extension for gen_random_uuid if necessary
create extension if not exists "pgcrypto";

-- 1) users
create table if not exists users (
  id text primary key,
  display_name text,
  coins int default 250,
  unlocked_items text[] default array[]::text[],  -- Für Shop-Käufe
  avatar text,
  calculator_skin text,
  active_effects text[] default array[]::text[],
  completed_units text[] default array[]::text[],
  mastered_units text[] default array[]::text[],
  pre_cleared_units text[] default array[]::text[],
  perfect_standard_quiz_units text[] default array[]::text[],
  perfect_bounty_units text[] default array[]::text[],
  created_at timestamp with time zone default now()
);

-- 2) progress
create table if not exists progress (
  user_id text not null,
  unit_id text not null,
  quest_coins_earned int default 0,
  quest_completed_count int default 0,
  bounty_completed boolean default false,
  perfect_standard_quiz boolean default false,
  perfect_bounty boolean default false,
  updated_at timestamp with time zone default now(),
  primary key (user_id, unit_id)
);
create index if not exists idx_progress_user_id on progress(user_id);
create index if not exists idx_progress_perfect_standard on progress(user_id, perfect_standard_quiz) where perfect_standard_quiz = true;
create index if not exists idx_progress_perfect_bounty on progress(user_id, perfect_bounty) where perfect_bounty = true;

-- 4) messages (chat)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  sender_id text not null,
  username text,
  avatar text,
  text text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_messages_channel_created_at on messages(channel_id, created_at);

-- 3) coin_ledger
create table if not exists coin_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  delta int not null,
  reason text,
  ref_type text,
  ref_id text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_coin_ledger_user_id_created_at on coin_ledger(user_id, created_at);

-- 5) battles
create table if not exists battles (
  id uuid primary key default gen_random_uuid(),
  scenario_id text,
  challenger_id text not null,
  opponent_id text,
  unit_id text not null,
  unit_title text,
  stake int not null default 0,
  round_count int not null default 0,
  task_ids text[] default array[]::text[],
  task_bundle jsonb,
  status text not null default 'pending',
  metadata jsonb,
  created_at timestamp with time zone default now(),
  accepted_at timestamp with time zone,
  finished_at timestamp with time zone,
  last_event_at timestamp with time zone default now(),
  winner_id text,
  result_reason text,
  challenger_score int default 0,
  opponent_score int default 0,
  challenger_time_ms int default 0,
  opponent_time_ms int default 0,
  challenger_summary jsonb,
  opponent_summary jsonb
);
create index if not exists idx_battles_challenger on battles(challenger_id);
create index if not exists idx_battles_opponent on battles(opponent_id);
create index if not exists idx_battles_status on battles(status);
create index if not exists idx_battles_status_opponent on battles(status, opponent_id) where opponent_id is null;
create index if not exists idx_battles_unit on battles(unit_id);
create index if not exists idx_battles_created_at on battles(created_at desc);

-- 6) battle_turns (stores per-player submissions / summaries)
create table if not exists battle_turns (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references battles(id) on delete cascade,
  player_id text not null,
  turn_index int not null default 0,
  is_correct boolean,
  solve_time_ms int,
  answer_payload jsonb,
  submitted_at timestamp with time zone default now()
);
create index if not exists idx_battle_turns_battle on battle_turns(battle_id);
create index if not exists idx_battle_turns_player on battle_turns(player_id);


