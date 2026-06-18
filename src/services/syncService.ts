import { getSupabase } from '../lib/supabase';
import { calculatePowerScore } from '../systems/powerCalculator';
import type { PersistedGameData } from '../types/save';
import { DEFAULT_PERSISTED_GAME } from '../types/save';

export async function loadCloudSave(userId: string): Promise<PersistedGameData | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('player_saves')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.data) return null;

  return mergePersistedData(data.data as Partial<PersistedGameData>);
}

export async function saveCloudSave(userId: string, save: PersistedGameData): Promise<void> {
  const supabase = getSupabase();
  const powerScore = calculatePowerScore(save.equipment);

  const [{ error: saveError }, { error: boardError }] = await Promise.all([
    supabase.from('player_saves').upsert({
      user_id: userId,
      data: save,
      updated_at: new Date().toISOString(),
    }),
    supabase.from('leaderboard_entries').upsert({
      user_id: userId,
      display_name: save.playerName,
      arena_rating: save.arenaRating,
      power_score: powerScore,
      depth: save.depth,
      updated_at: new Date().toISOString(),
    }),
  ]);

  if (saveError) throw saveError;
  if (boardError) throw boardError;
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

function mergePersistedData(raw: Partial<PersistedGameData>): PersistedGameData {
  return {
    ...DEFAULT_PERSISTED_GAME,
    ...raw,
    equipment: raw.equipment ?? {},
    inventory: raw.inventory ?? [],
    collection: raw.collection ?? {},
    collectionCounters: {
      ...DEFAULT_PERSISTED_GAME.collectionCounters,
      ...(raw.collectionCounters ?? {}),
    },
  };
}
