import { useEffect, useRef } from 'react';
import { saveCloudSave } from '../services/syncService';
import type { PersistedGameData } from '../types/save';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import type { GameState } from '../types/game';

const SYNC_DELAY_MS = 1500;

function extractPersisted(state: GameState): PersistedGameData {
  return {
    playerName: state.playerName,
    dust: state.dust,
    totalRuns: state.totalRuns,
    depth: state.depth,
    selectedDepth: state.selectedDepth,
    equipment: state.equipment,
    inventory: state.inventory,
    inventorySort: state.inventorySort,
    inventorySlotFilter: state.inventorySlotFilter,
    inventoryRarityFilter: state.inventoryRarityFilter,
    collection: state.collection,
    collectionCounters: state.collectionCounters,
    arenaRating: state.arenaRating,
    arenaWins: state.arenaWins,
    arenaLosses: state.arenaLosses,
  };
}

function persistedChanged(next: GameState, prev: GameState): boolean {
  return JSON.stringify(extractPersisted(next)) !== JSON.stringify(extractPersisted(prev));
}

export function useCloudSync(): void {
  const userId = useAuthStore((s) => s.user?.id);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!userId || isDebugSession) return;

    const scheduleSync = (state: GameState) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (syncingRef.current) return;
        syncingRef.current = true;
        try {
          await saveCloudSave(userId, extractPersisted(state));
        } catch (err) {
          console.warn('Cloud sync failed:', err);
        } finally {
          syncingRef.current = false;
        }
      }, SYNC_DELAY_MS);
    };

    const unsub = useGameStore.subscribe((state, prev) => {
      if (persistedChanged(state, prev)) {
        scheduleSync(state);
      }
    });

    return () => {
      unsub();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId, isDebugSession]);
}

export { extractPersisted };
