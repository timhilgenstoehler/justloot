import { fetchLeaderboard } from './leaderboardService';
import { loadCloudSave } from './syncService';
import { getCurrentUserId } from '../lib/session';
import { calculatePowerScore } from '../systems/powerCalculator';
import type { Item, Slot } from '../types/game';

export interface PlayerInspectData {
  userId: string;
  playerName: string;
  depth: number;
  arenaRating: number;
  arenaWins: number;
  arenaLosses: number;
  equipment: Partial<Record<Slot, Item>>;
  powerScore: number;
}

export async function fetchPlayerInspect(userId: string): Promise<PlayerInspectData | null> {
  const save = await loadCloudSave(userId);

  if (save) {
    return {
      userId,
      playerName: save.playerName,
      depth: save.depth,
      arenaRating: save.arenaRating,
      arenaWins: save.arenaWins,
      arenaLosses: save.arenaLosses,
      equipment: save.equipment,
      powerScore: calculatePowerScore(save.equipment),
    };
  }

  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return null;

  const leaderboard = await fetchLeaderboard(currentUserId);
  const entry = leaderboard.find((row) => row.id === userId);
  if (!entry) return null;

  return {
    userId,
    playerName: entry.name,
    depth: entry.depth,
    arenaRating: entry.arenaRating,
    arenaWins: 0,
    arenaLosses: 0,
    equipment: {},
    powerScore: entry.powerScore,
  };
}
