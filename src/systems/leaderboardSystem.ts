import type { LeaderboardEntry, LeaderboardSort } from '../types/game';
import { calculateArenaRatingChange } from './arenaOpponentGenerator';
import { scaleEnemyStat } from '../constants/combatBalance';
import type { Enemy } from '../types/game';
import type { ArenaOpponent } from './arenaOpponentGenerator';

const DEFAULT_BOTS: Omit<LeaderboardEntry, 'timestamp' | 'isPlayer'>[] = [
  { id: 'bot-ash-warden', name: 'Ash Warden', arenaRating: 1240, powerScore: 420, depth: 6 },
  { id: 'bot-crypt-king', name: 'Crypt King', arenaRating: 1160, powerScore: 380, depth: 5 },
  { id: 'bot-silent-blade', name: 'Silent Blade', arenaRating: 1080, powerScore: 310, depth: 4 },
  { id: 'bot-storm-herald', name: 'Storm Herald', arenaRating: 1020, powerScore: 280, depth: 4 },
  { id: 'bot-pale-duke', name: 'Pale Duke', arenaRating: 960, powerScore: 240, depth: 3 },
  { id: 'bot-grave-duelist', name: 'Grave Duelist', arenaRating: 900, powerScore: 200, depth: 3 },
  { id: 'bot-iron-oath', name: 'Iron Oathkeeper', arenaRating: 860, powerScore: 175, depth: 2 },
  { id: 'bot-void-knight', name: 'Void Knight', arenaRating: 820, powerScore: 150, depth: 2 },
];

export function createDefaultLeaderboard(
  playerName: string,
  arenaRating: number,
  powerScore: number,
  depth: number,
): LeaderboardEntry[] {
  const now = Date.now();
  const bots: LeaderboardEntry[] = DEFAULT_BOTS.map((bot, i) => ({
    ...bot,
    timestamp: now - (i + 1) * 86400000,
  }));

  const player: LeaderboardEntry = {
    id: 'player',
    name: playerName,
    arenaRating,
    powerScore,
    depth,
    timestamp: now,
    isPlayer: true,
  };

  return [player, ...bots].sort((a, b) => b.arenaRating - a.arenaRating);
}

export function ensureLeaderboard(
  leaderboard: LeaderboardEntry[],
  playerName: string,
  arenaRating: number,
  powerScore: number,
  depth: number,
): LeaderboardEntry[] {
  if (leaderboard.length === 0) {
    return createDefaultLeaderboard(playerName, arenaRating, powerScore, depth);
  }

  const hasPlayer = leaderboard.some((e) => e.isPlayer);
  const hasBots = leaderboard.some((e) => !e.isPlayer);

  if (!hasBots) {
    const now = Date.now();
    const bots = DEFAULT_BOTS.map((bot, i) => ({
      ...bot,
      timestamp: now - (i + 1) * 86400000,
    }));
    const player = hasPlayer
      ? leaderboard.find((e) => e.isPlayer)!
      : {
          id: 'player',
          name: playerName,
          arenaRating,
          powerScore,
          depth,
          timestamp: now,
          isPlayer: true as const,
        };
    const withoutPlayer = leaderboard.filter((e) => !e.isPlayer);
    return [player, ...bots, ...withoutPlayer]
      .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
      .sort((a, b) => b.arenaRating - a.arenaRating);
  }

  if (!hasPlayer) {
    return [
      {
        id: 'player',
        name: playerName,
        arenaRating,
        powerScore,
        depth,
        timestamp: Date.now(),
        isPlayer: true,
      },
      ...leaderboard,
    ].sort((a, b) => b.arenaRating - a.arenaRating);
  }

  return leaderboard
    .map((entry) =>
      entry.isPlayer
        ? { ...entry, name: playerName, powerScore, depth, arenaRating: entry.arenaRating || arenaRating }
        : entry,
    )
    .sort((a, b) => b.arenaRating - a.arenaRating);
}

export function getArenaOpponents(leaderboard: LeaderboardEntry[]): LeaderboardEntry[] {
  return leaderboard.filter((e) => !e.isPlayer);
}

export function sortLeaderboard(
  entries: LeaderboardEntry[],
  sortBy: LeaderboardSort,
): LeaderboardEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (sortBy === 'rating') {
      if (b.arenaRating !== a.arenaRating) return b.arenaRating - a.arenaRating;
      if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
      return b.depth - a.depth;
    }
    if (sortBy === 'power') {
      if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
      if (b.arenaRating !== a.arenaRating) return b.arenaRating - a.arenaRating;
      return b.depth - a.depth;
    }
    if (b.depth !== a.depth) return b.depth - a.depth;
    if (b.powerScore !== a.powerScore) return b.powerScore - a.powerScore;
    return b.arenaRating - a.arenaRating;
  });
  return sorted;
}

export function getLeaderboardEntry(
  leaderboard: LeaderboardEntry[],
  opponentId: string,
): LeaderboardEntry | undefined {
  return leaderboard.find((e) => e.id === opponentId && !e.isPlayer);
}

export function opponentFromLeaderboardEntry(entry: LeaderboardEntry): ArenaOpponent {
  const stats = scaleEnemyStat(entry.depth);
  const powerFactor = Math.max(0.65, Math.min(1.35, entry.powerScore / 400));

  const enemy: Enemy = {
    name: entry.name,
    health: Math.round(stats.health * powerFactor),
    attack: Math.round(stats.attack * powerFactor),
    defense: Math.round(stats.defense * powerFactor),
    speed: stats.speed,
    element: undefined,
  };

  return {
    name: entry.name,
    arenaRating: entry.arenaRating,
    enemy,
    loadout: {
      stats: {
        health: enemy.health,
        attack: enemy.attack,
        defense: enemy.defense,
        speed: enemy.speed,
        critChance: 5 + Math.floor(entry.depth / 2),
        critDamage: 150,
        attackSpeed: 0,
        healthRegen: 0,
      },
      effects: [],
      resists: { fire: 0, cold: 0, lightning: 0, poison: 0, bleed: 0 },
      build: {
        buildAffixes: [],
        specialEffects: [],
        berserkActive: false,
        revivedThisRun: false,
      },
      lootBonuses: { lootQuality: 0, lootRarity: 0 },
    },
  };
}

export function updateLeaderboardAfterFight(
  leaderboard: LeaderboardEntry[],
  playerName: string,
  playerRating: number,
  powerScore: number,
  depth: number,
  opponentId: string,
  won: boolean,
  ratingGainBonus: number,
): LeaderboardEntry[] {
  const opponent = leaderboard.find((e) => e.id === opponentId);
  if (!opponent) {
    return ensureLeaderboard(leaderboard, playerName, playerRating, powerScore, depth);
  }

  const playerDelta = calculateArenaRatingChange(
    won,
    playerRating,
    opponent.arenaRating,
    ratingGainBonus,
  );
  const opponentDelta = -playerDelta;

  const newPlayerRating = Math.max(0, playerRating + playerDelta);

  return leaderboard
    .map((entry) => {
      if (entry.isPlayer) {
        return {
          ...entry,
          name: playerName,
          arenaRating: newPlayerRating,
          powerScore,
          depth,
          timestamp: Date.now(),
        };
      }
      if (entry.id === opponentId) {
        return {
          ...entry,
          arenaRating: Math.max(0, entry.arenaRating + opponentDelta),
          timestamp: Date.now(),
        };
      }
      return entry;
    })
    .sort((a, b) => b.arenaRating - a.arenaRating);
}
