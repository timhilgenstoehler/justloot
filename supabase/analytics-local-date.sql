-- Run in Supabase SQL Editor to fix analytics day bucketing (local calendar date from client).

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

grant execute on function public.normalize_activity_date(date) to authenticated;
grant execute on function public.record_daily_active(date) to authenticated;
grant execute on function public.record_run(date) to authenticated;
