-- Tianhui's Farewell Wall — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create extension if not exists pgcrypto;

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  message    text not null check (char_length(message) between 1 and 1000),
  author     text not null default 'Anonymous' check (char_length(author) <= 80),
  color      text not null default 'yellow' check (color in ('yellow', 'blue', 'coral', 'gold')),
  created_at timestamptz not null default now()
);

-- Row Level Security: anyone may read and add notes, but nothing can be
-- edited or deleted from the client (no update/delete policy).
alter table public.notes enable row level security;

create policy "Public can read notes" on public.notes
  for select to anon, authenticated
  using (true);

create policy "Public can add notes" on public.notes
  for insert to anon, authenticated
  with check (
    char_length(message) between 1 and 1000
    and char_length(author) <= 80
  );
