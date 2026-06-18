import { scaleEnemyStat } from '../constants/combatBalance';
import { calculateCharacterLoadout } from './characterStatsCalculator';
import type { CharacterCombatLoadout } from './characterStatsCalculator';
import type { Enemy } from '../types/game';

const ARENA_NAMES = [
  'Grave Duelist',
  'Crypt Champion',
  'Ash Vanguard',
  'Silent Reaper',
  'Storm Warden',
  'Pale Gladiator',
  'Iron Oathkeeper',
  'Void Knight',
];

export interface ArenaOpponent {
  name: string;
  loadout: CharacterCombatLoadout;
  enemy: Enemy;
  arenaRating: number;
}

export function generateArenaOpponent(
  playerDepth: number,
  playerPower: number,
  playerRating: number,
): ArenaOpponent {
  const name = ARENA_NAMES[Math.floor(Math.random() * ARENA_NAMES.length)];
  const ratingDelta = Math.floor(Math.random() * 200) - 100;
  const arenaRating = Math.max(800, playerRating + ratingDelta);

  const depthScale = Math.max(1, playerDepth + Math.floor(ratingDelta / 100));
  const stats = scaleEnemyStat(depthScale);

  const powerFactor = Math.max(0.7, Math.min(1.4, playerPower / 500));
  const enemy: Enemy = {
    name,
    health: Math.round(stats.health * powerFactor),
    attack: Math.round(stats.attack * powerFactor),
    defense: Math.round(stats.defense * powerFactor),
    speed: stats.speed,
    element: undefined,
  };

  const loadout: CharacterCombatLoadout = {
    stats: {
      health: enemy.health,
      attack: enemy.attack,
      defense: enemy.defense,
      speed: enemy.speed,
      critChance: 5 + Math.floor(depthScale / 3),
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
  };

  return { name, loadout, enemy, arenaRating };
}

export function calculateArenaRatingChange(
  won: boolean,
  playerRating: number,
  opponentRating: number,
  ratingGainBonus: number,
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const score = won ? 1 : 0;
  const k = 32;
  let delta = Math.round(k * (score - expected));
  if (won && ratingGainBonus > 0) {
    delta = Math.round(delta * (1 + ratingGainBonus / 100));
  }
  return delta;
}

export function createPlayerArenaLoadout(
  equipment: Parameters<typeof calculateCharacterLoadout>[0],
): CharacterCombatLoadout {
  return calculateCharacterLoadout(equipment);
}
