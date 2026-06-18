import { getSupabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/session';
import { getLocalActivityDate } from '../utils/activityDate';

/** Marks the signed-in user active for today (local calendar day). Idempotent per day. */
export async function recordDailyActive(activityDate = getLocalActivityDate()): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = getSupabase();
  const { error } = await supabase.rpc('record_daily_active', {
    p_activity_date: activityDate,
  });
  if (error) throw error;
}

/** Increments today's run count for the signed-in user (dungeon + arena). */
export async function recordRun(activityDate = getLocalActivityDate()): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = getSupabase();
  const { error } = await supabase.rpc('record_run', {
    p_activity_date: activityDate,
  });
  if (error) throw error;
}

export function trackRunStarted(): void {
  recordRun().catch((err) => console.warn('Analytics run failed:', err));
}
