-- Moomiz Blog — Supabase (Postgres) schema
-- Supabase SQL Editor에서 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  content text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc nulls last);

create index if not exists posts_view_count_idx
  on public.posts (view_count desc);

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_posts_updated_at();

-- 조회수 증가 (익명 방문자도 호출 가능)
create or replace function public.increment_post_views(post_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published'
  returning view_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

alter table public.posts enable row level security;

drop policy if exists "Public read published posts" on public.posts;
create policy "Public read published posts"
  on public.posts for select
  using (status = 'published');

drop policy if exists "Authenticated manage posts" on public.posts;
create policy "Authenticated manage posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant execute on function public.increment_post_views(text) to anon, authenticated;
