-- Run this in Supabase SQL Editor if you already deployed the base schema.

create table if not exists public.daily_user_activity (
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_date date not null default ((now() at time zone 'utc')::date),
  run_count int not null default 0 check (run_count >= 0),
  primary key (user_id, activity_date)
);

create index if not exists daily_user_activity_date_idx
  on public.daily_user_activity (activity_date desc);

create or replace function public.record_daily_active()
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

  insert into public.daily_user_activity (user_id, activity_date, run_count)
  values (v_uid, (now() at time zone 'utc')::date, 0)
  on conflict (user_id, activity_date) do nothing;
end;
$$;

create or replace function public.record_run()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.daily_user_activity (user_id, activity_date, run_count)
  values (v_uid, v_today, 1)
  on conflict (user_id, activity_date)
  do update set run_count = public.daily_user_activity.run_count + 1;
end;
$$;

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

grant execute on function public.record_daily_active to authenticated;
grant execute on function public.record_run to authenticated;

create or replace function public.get_analytics_dashboard(p_password text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dau json;
  v_runs json;
begin
  if p_password is distinct from 'lootlol' then
    raise exception 'Unauthorized';
  end if;

  select coalesce(json_agg(row_to_json(t) order by t.activity_date desc), '[]'::json)
  into v_dau
  from (
    select activity_date, dau
    from public.analytics_dau
    where activity_date >= ((now() at time zone 'utc')::date - 30)
    order by activity_date desc
    limit 30
  ) t;

  select coalesce(json_agg(row_to_json(t) order by t.activity_date desc, t.run_count desc), '[]'::json)
  into v_runs
  from (
    select activity_date, user_id, display_name, run_count
    from public.analytics_runs_per_user_per_day
    where activity_date >= ((now() at time zone 'utc')::date - 14)
    order by activity_date desc, run_count desc
    limit 200
  ) t;

  return json_build_object('dau', v_dau, 'runs', v_runs);
end;
$$;

grant execute on function public.get_analytics_dashboard(text) to anon, authenticated;
