-- Tianhui's Farewell Wall — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: policies are dropped and recreated.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Farewell Wall: notes
-- ─────────────────────────────────────────────────────────────
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

drop policy if exists "Public can read notes" on public.notes;
create policy "Public can read notes" on public.notes
  for select to anon, authenticated
  using (true);

drop policy if exists "Public can add notes" on public.notes;
create policy "Public can add notes" on public.notes
  for insert to anon, authenticated
  with check (
    char_length(message) between 1 and 1000
    and char_length(author) <= 80
  );

drop policy if exists "Public can edit notes" on public.notes;
create policy "Public can edit notes" on public.notes
  for update to anon, authenticated
  using (true)
  with check (
    char_length(message) between 1 and 1000
    and char_length(author) <= 80
  );

drop policy if exists "Public can delete notes" on public.notes;
create policy "Public can delete notes" on public.notes
  for delete to anon, authenticated
  using (true);

-- ─────────────────────────────────────────────────────────────
-- Memory Gallery: photos (metadata) + Storage bucket for the images
-- ─────────────────────────────────────────────────────────────
create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  author       text not null default 'Anonymous' check (char_length(author) <= 80),
  description  text not null default '' check (char_length(description) <= 500),
  storage_path text not null check (char_length(storage_path) > 0),
  created_at   timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "Public can read photos" on public.photos;
create policy "Public can read photos" on public.photos
  for select to anon, authenticated
  using (true);

drop policy if exists "Public can add photos" on public.photos;
create policy "Public can add photos" on public.photos
  for insert to anon, authenticated
  with check (
    char_length(author) <= 80
    and char_length(description) <= 500
    and char_length(storage_path) > 0
  );

drop policy if exists "Public can edit photos" on public.photos;
create policy "Public can edit photos" on public.photos
  for update to anon, authenticated
  using (true)
  with check (
    char_length(author) <= 80
    and char_length(description) <= 500
  );

drop policy if exists "Public can delete photos" on public.photos;
create policy "Public can delete photos" on public.photos
  for delete to anon, authenticated
  using (true);

-- Public bucket for uploaded images (images only, 10 MB max).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memories', 'memories', true, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

drop policy if exists "Public can view memory photos" on storage.objects;
create policy "Public can view memory photos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'memories');

drop policy if exists "Public can upload memory photos" on storage.objects;
create policy "Public can upload memory photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'memories');

drop policy if exists "Public can delete memory photos" on storage.objects;
create policy "Public can delete memory photos" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'memories');
