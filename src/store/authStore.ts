import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import {
  clearSupabaseAuthStorage,
  getSupabase,
  isSupabaseConfigured,
  resetSupabaseClient,
} from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  isDebugSession: boolean;
  bootstrap: () => void;
  restoreSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  enterDebugSession: () => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let hydratedUserId: string | null = null;

function generateGuestName(): string {
  return `Guest${Math.floor(1000 + Math.random() * 9000)}`;
}

function displayNameFromSession(session: Session): string | null {
  const name = session.user.user_metadata?.display_name;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
}

async function hydrateUserSession(session: Session): Promise<void> {
  if (hydratedUserId === session.user.id) return;

  const { loadCloudSave } = await import('../services/syncService');
  const { fetchFeed, fetchLeaderboard } = await import('../services/leaderboardService');
  const { useGameStore } = await import('./gameStore');
  const game = useGameStore.getState();

  try {
    const save = await loadCloudSave(session.user.id);
    if (save) {
      game.hydrateFromCloud(save);
    } else {
      const name = displayNameFromSession(session);
      if (name) useGameStore.setState({ playerName: name });
    }
  } catch {
    // cloud save is optional on first sign-in
  }

  try {
    game.setLeaderboard(await fetchLeaderboard(session.user.id));
  } catch {
    // leaderboard can load later
  }

  try {
    game.setFeedLog(await fetchFeed());
  } catch {
    // feed can load later
  }

  hydratedUserId = session.user.id;
}

function scheduleHydrate(session: Session | null): void {
  if (!session?.user) return;
  setTimeout(() => {
    void hydrateUserSession(session);
  }, 0);
}

async function clearLocalGameState(): Promise<void> {
  const { useGameStore } = await import('./gameStore');
  useGameStore.getState().resetAll();
  useGameStore.getState().setLeaderboard([]);
  useGameStore.getState().setFeedLog([]);
  await useGameStore.persist.clearStorage();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initialized: false,
  loading: false,
  error: null,
  isDebugSession: false,

  bootstrap: () => {
    if (!get().initialized) set({ initialized: true });
  },

  restoreSession: async () => {
    if (!isSupabaseConfigured()) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await getSupabase().auth.getSession();
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
      if (data.session) scheduleHydrate(data.session);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to restore session.',
      });
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null, isDebugSession: false });
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
      if (data.session) scheduleHydrate(data.session);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Sign in failed.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null, isDebugSession: false });
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() || 'Adventurer' },
        },
      });
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
      if (data.session) scheduleHydrate(data.session);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Sign up failed.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signInAsGuest: async () => {
    set({ loading: true, error: null, isDebugSession: false });
    try {
      const { data: existing, error: existingError } = await getSupabase().auth.getSession();
      if (existingError) throw existingError;
      if (existing.session) {
        set({ session: existing.session, user: existing.session.user });
        scheduleHydrate(existing.session);
        return;
      }

      const { data, error } = await getSupabase().auth.signInAnonymously({
        options: { data: { display_name: generateGuestName() } },
      });
      if (error) throw error;
      set({ session: data.session, user: data.session?.user ?? null });
      if (data.session) scheduleHydrate(data.session);
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : 'Guest sign-in failed. Enable Anonymous sign-in in Supabase.',
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  enterDebugSession: () => {
    const { useDebugStore } = require('./debugStore') as typeof import('./debugStore');
    useDebugStore.getState().enterDebug();
    hydratedUserId = null;
    set({
      session: null,
      user: null,
      isDebugSession: true,
      initialized: true,
      loading: false,
      error: null,
    });
  },

  signOut: async () => {
    const { isDebugSession } = get();

    if (isDebugSession) {
      const { useDebugStore } = require('./debugStore') as typeof import('./debugStore');
      useDebugStore.getState().exitDebug();
      hydratedUserId = null;
      await clearLocalGameState();
      set({ session: null, user: null, isDebugSession: false, loading: false, error: null });
      return;
    }

    hydratedUserId = null;
    set({ session: null, user: null, loading: false, error: null, isDebugSession: false });

    try {
      await clearLocalGameState();
      await clearSupabaseAuthStorage();
      try {
        await getSupabase().auth.signOut({ scope: 'local' });
      } catch {
        // local sign-out is enough if remote hangs
      }
    } finally {
      resetSupabaseClient();
    }
  },

  clearError: () => set({ error: null }),
}));
