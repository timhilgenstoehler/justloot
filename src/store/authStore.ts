import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchFeed,
  fetchLeaderboard,
} from '../services/leaderboardService';
import { loadCloudSave } from '../services/syncService';
import { useGameStore } from './gameStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

let authSubscription: { unsubscribe: () => void } | null = null;

async function hydrateUserSession(session: Session | null): Promise<void> {
  const game = useGameStore.getState();

  if (!session?.user) {
    game.resetAll();
    game.setLeaderboard([]);
    game.setFeedLog([]);
    return;
  }

  const save = await loadCloudSave(session.user.id);
  if (save) {
    game.hydrateFromCloud(save);
  }

  const [leaderboard, feed] = await Promise.all([
    fetchLeaderboard(session.user.id),
    fetchFeed(),
  ]);

  game.setLeaderboard(leaderboard);
  game.setFeedLog(feed);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ initialized: true, error: 'Supabase is not configured.' });
      return;
    }

    if (get().initialized) return;

    const supabase = getSupabase();

    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
    });

    if (data.session) {
      try {
        await hydrateUserSession(data.session);
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to load save.' });
      }
    }

    if (!authSubscription) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session, user: session?.user ?? null });

        if (event === 'SIGNED_IN' && session) {
          set({ loading: true, error: null });
          try {
            await hydrateUserSession(session);
          } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to load save.' });
          } finally {
            set({ loading: false });
          }
        }

        if (event === 'SIGNED_OUT') {
          useGameStore.getState().resetAll();
          useGameStore.getState().setLeaderboard([]);
          useGameStore.getState().setFeedLog([]);
        }
      });
      authSubscription = listener.subscription;
    }

    set({ initialized: true });
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Sign in failed.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() || 'Adventurer' },
        },
      });
      if (error) throw error;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Sign up failed.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    set({ session: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
