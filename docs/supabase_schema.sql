-- Supabase schema for Math2 app
-- Run in Supabase SQL editor

-- Enable pgcrypto extension for gen_random_uuid if necessary
create extension if not exists "pgcrypto";

-- 1) users
create table if not exists users (
  id text primary key,
  display_name text,
  coins int default 0,
  created_at timestamp with time zone default now()
);

-- 2) progress
create table if not exists progress (
  user_id text not null,
  unit_id text not null,
  quest_coins_earned int default 0,
  quest_completed_count int default 0,
  bounty_completed boolean default false,
  updated_at timestamp with time zone default now(),
  primary key (user_id, unit_id)
);
create index if not exists idx_progress_user_id on progress(user_id);

-- 4) messages (chat)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  sender_id text not null,
  username text,
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


