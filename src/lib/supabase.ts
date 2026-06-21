import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Required for Supabase auth on React Native (Collapse skips this — it has no auth).
import 'react-native-url-polyfill/auto';

let client: SupabaseClient | null = null;
let clientUrl: string | null = null;
let clientKey: string | null = null;

function getExtra(): Record<string, string | undefined> {
  return (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
}

function getEnv(name: string, altName?: string): string | undefined {
  const extra = getExtra();
  return (
    extra[name] ??
    (altName ? extra[altName] : undefined) ??
    process.env[name] ??
    (altName ? process.env[altName] : undefined)
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    getEnv('EXPO_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') &&
      getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}

export function getSupabaseUrl(): string {
  return (getEnv('EXPO_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL') ?? '').trim();
}

export function getSupabaseAnonKey(): string {
  return (getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '').trim();
}

function getAuthStorage() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  }
  return AsyncStorage;
}

/** Same pattern as Collapse — direct createClient, extra-first env lookup. */
export function getSupabase(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  if (client && (clientUrl !== url || clientKey !== key)) {
    client = null;
  }

  if (client) return client;

  client = createClient(url, key, {
    auth: {
      storage: getAuthStorage(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });
  clientUrl = url;
  clientKey = key;

  return client;
}

export function resetSupabaseClient(): void {
  client = null;
  clientUrl = null;
  clientKey = null;
}

function isAuthStorageKey(key: string): boolean {
  return key.includes('-auth-token') || key.startsWith('sb-');
}

export async function clearSupabaseAuthStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    for (const key of Object.keys(window.localStorage)) {
      if (isAuthStorageKey(key)) {
        window.localStorage.removeItem(key);
      }
    }
    return;
  }

  const keys = await AsyncStorage.getAllKeys();
  const authKeys = keys.filter(isAuthStorageKey);
  if (authKeys.length > 0) {
    await AsyncStorage.multiRemove(authKeys);
  }
}

export function formatSupabaseError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String((err as { message: unknown }).message);
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  return 'Something went wrong';
}
