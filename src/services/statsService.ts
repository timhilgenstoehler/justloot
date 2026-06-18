import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface DauRow {
  activity_date: string;
  dau: number;
}

export interface RunRow {
  activity_date: string;
  user_id: string;
  display_name: string;
  run_count: number;
}

export interface AnalyticsDashboard {
  dau: DauRow[];
  runs: RunRow[];
}

export async function fetchAnalyticsDashboard(password: string): Promise<AnalyticsDashboard> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('get_analytics_dashboard', {
    p_password: password,
  });

  if (error) throw error;

  const payload = data as AnalyticsDashboard | null;
  return {
    dau: payload?.dau ?? [],
    runs: payload?.runs ?? [],
  };
}
