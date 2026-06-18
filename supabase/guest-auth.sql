-- Re-run after enabling Anonymous sign-in in Supabase Dashboard (Auth → Providers → Anonymous).

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
