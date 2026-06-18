import { getSupabase, isSupabaseConfigured } from './supabase';

export async function getCurrentUserId(): Promise<string | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  const { data } = await getSupabase().auth.getSession();
  return data.session?.user?.id;
}
