import { getSupabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/session';

/** Marks the signed-in user active for today (UTC). Idempotent per day. */
export async function recordDailyActive(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = getSupabase();
  const { error } = await supabase.rpc('record_daily_active');
  if (error) throw error;
}

/** Increments today's run count for the signed-in user (dungeon + arena). */
export async function recordRun(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = getSupabase();
  const { error } = await supabase.rpc('record_run');
  if (error) throw error;
}

export function trackRunStarted(): void {
  recordRun().catch((err) => console.warn('Analytics run failed:', err));
}
