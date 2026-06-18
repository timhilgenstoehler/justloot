-- Just Loot — run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (one per auth user)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full game save blob (equipment, inventory, collection, etc.)
create table if not exists public.player_saves (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Arena leaderboard (one row per player)
create table if not exists public.leaderboard_entries (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  display_name text not null,
  arena_rating int not null default 1000 check (arena_rating >= 0),
  power_score int not null default 0 check (power_score >= 0),
  depth int not null default 1 check (depth >= 1),
  updated_at timestamptz not null default now()
);

-- Global activity feed
create table if not exists public.feed_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  display_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists feed_entries_created_at_idx on public.feed_entries (created_at desc);
create index if not exists leaderboard_entries_rating_idx on public.leaderboard_entries (arena_rating desc);

-- Auto-create profile + save + leaderboard row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    case
      when coalesce(new.is_anonymous, false)
        or new.email is null
        or trim(coalesce(new.email, '')) = '' then
        'Guest ' || upper(left(replace(new.id::text, '-', ''), 6))
      else split_part(new.email, '@', 1)
    end,
    'Adventurer'
  );

  insert into public.profiles (id, display_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  insert into public.player_saves (user_id, data)
  values (
    new.id,
    jsonb_build_object(
      'playerName', v_name,
      'dust', 0,
      'totalRuns', 0,
      'depth', 1,
      'selectedDepth', 1,
      'equipment', '{}'::jsonb,
      'inventory', '[]'::jsonb,
      'inventorySort', 'newest',
      'inventorySlotFilter', 'all',
      'inventoryRarityFilter', 'all',
      'collection', '{}'::jsonb,
      'collectionCounters', jsonb_build_object(
        'common', 0, 'rare', 0, 'epic', 0, 'legendary', 0, 'mythic', 0, 'ancient', 0
      ),
      'arenaRating', 1000,
      'arenaWins', 0,
      'arenaLosses', 0
    )
  )
  on conflict (user_id) do nothing;

  insert into public.leaderboard_entries (user_id, display_name, arena_rating, power_score, depth)
  values (new.id, v_name, 1000, 0, 1)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic arena rating update (both players)
create or replace function public.apply_arena_result(
  p_opponent_id uuid,
  p_player_won boolean,
  p_player_delta int,
  p_opponent_delta int,
  p_player_power int,
  p_player_depth int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.leaderboard_entries
  set
    arena_rating = greatest(0, arena_rating + p_player_delta),
    power_score = p_player_power,
    depth = p_player_depth,
    updated_at = now()
  where user_id = v_uid;

  if p_opponent_id is not null and p_opponent_id <> v_uid then
    update public.leaderboard_entries
    set
      arena_rating = greatest(0, arena_rating + p_opponent_delta),
      updated_at = now()
    where user_id = p_opponent_id;
  end if;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.player_saves enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.feed_entries enable row level security;

create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "saves_select_own" on public.player_saves for select using (auth.uid() = user_id);
create policy "saves_select_inspect" on public.player_saves for select to authenticated using (true);
create policy "saves_insert_own" on public.player_saves for insert with check (auth.uid() = user_id);
create policy "saves_update_own" on public.player_saves for update using (auth.uid() = user_id);

create policy "leaderboard_select" on public.leaderboard_entries for select using (true);
create policy "leaderboard_insert_own" on public.leaderboard_entries for insert with check (auth.uid() = user_id);
create policy "leaderboard_update_own" on public.leaderboard_entries for update using (auth.uid() = user_id);

create policy "feed_select" on public.feed_entries for select using (true);
create policy "feed_insert_own" on public.feed_entries for insert with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant execute on function public.apply_arena_result to authenticated;

-- Daily analytics: DAU + runs per user per day (UTC)
create table if not exists public.daily_user_activity (
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_date date not null default ((now() at time zone 'utc')::date),
  run_count int not null default 0 check (run_count >= 0),
  primary key (user_id, activity_date)
);

create index if not exists daily_user_activity_date_idx
  on public.daily_user_activity (activity_date desc);

create or replace function public.normalize_activity_date(p_activity_date date)
returns date
language plpgsql
immutable
as $$
declare
  v_ref date := (now() at time zone 'utc')::date;
begin
  if p_activity_date is null then
    return v_ref;
  end if;

  if p_activity_date > v_ref + 1 then
    raise exception 'Invalid activity date: too far in the future';
  end if;

  if p_activity_date < v_ref - 3 then
    raise exception 'Invalid activity date: too far in the past';
  end if;

  return p_activity_date;
end;
$$;

create or replace function public.record_daily_active(p_activity_date date default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_day date := public.normalize_activity_date(p_activity_date);
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.daily_user_activity (user_id, activity_date, run_count)
  values (v_uid, v_day, 0)
  on conflict (user_id, activity_date) do nothing;
end;
$$;

create or replace function public.record_run(p_activity_date date default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_day date := public.normalize_activity_date(p_activity_date);
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.daily_user_activity (user_id, activity_date, run_count)
  values (v_uid, v_day, 1)
  on conflict (user_id, activity_date)
  do update set run_count = public.daily_user_activity.run_count + 1;
end;
$$;

-- Query helpers (run in Supabase SQL editor)
create or replace view public.analytics_dau as
select
  activity_date,
  count(*)::int as dau
from public.daily_user_activity
group by activity_date
order by activity_date desc;

create or replace view public.analytics_runs_per_user_per_day as
select
  a.activity_date,
  a.user_id,
  p.display_name,
  a.run_count
from public.daily_user_activity a
join public.profiles p on p.id = a.user_id
order by a.activity_date desc, a.run_count desc;

alter table public.daily_user_activity enable row level security;

grant execute on function public.normalize_activity_date(date) to authenticated;
grant execute on function public.record_daily_active(date) to authenticated;
grant execute on function public.record_run(date) to authenticated;

create or replace function public.get_analytics_dashboard(p_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dau json;
  v_runs json;
  v_cutoff date := (now() at time zone 'utc')::date - 30;
begin
  if p_password is distinct from 'lootlol' then
    raise exception 'Unauthorized';
  end if;

  select coalesce(json_agg(row_to_json(t) order by t.activity_date desc), '[]'::json)
  into v_dau
  from (
    select activity_date, dau
    from public.analytics_dau
    where activity_date >= v_cutoff
    order by activity_date desc
  ) t;

  select coalesce(json_agg(row_to_json(t) order by t.activity_date desc, t.run_count desc), '[]'::json)
  into v_runs
  from (
    select activity_date, user_id, display_name, run_count
    from public.analytics_runs_per_user_per_day
    where activity_date >= v_cutoff
    order by activity_date desc, run_count desc
    limit 1000
  ) t;

  return json_build_object('dau', v_dau, 'runs', v_runs);
end;
$$;

grant execute on function public.get_analytics_dashboard(text) to anon, authenticated;
