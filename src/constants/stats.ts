/** Re-exports from statRegistry for backward compatibility. */
export {
  STAT_REGISTRY as STAT_DEFINITIONS,
  STAT_BY_ID,
  RARITY_AFFIX_COUNT as RARITY_STAT_COUNT,
  getStatsForSlot,
  rollStatValue,
  rollDefense,
  rollItemQuality,
  pickWeightedStatForSlot,
  getStatCategory,
  BUILD_AFFIX_LABELS,
  SPECIAL_EFFECT_LABELS,
} from './statRegistry';

export type { StatDefinition } from './statRegistry';

import { RARITY_AFFIX_COUNT } from './statRegistry';
import type { Rarity } from '../types/game';

export function rollStatCount(rarity: Rarity): number {
  return RARITY_AFFIX_COUNT[rarity];
}

export function getDepthLootFactor(depth: number): number {
  const d = Math.max(1, depth);
  if (d === 1) return 1;
  return 1 + Math.log10(d) * 0.5;
}

export function getDepthRarityFactor(depth: number): number {
  const d = Math.max(1, depth);
  if (d <= 1) return 0;
  return Math.min(1, Math.log(d) / Math.log(1000));
}

export type PowerTier = 'early' | 'mid' | 'late' | 'endgame';

export function getPowerTier(powerScore: number): PowerTier {
  if (powerScore < 100) return 'early';
  if (powerScore < 500) return 'mid';
  if (powerScore < 2000) return 'late';
  return 'endgame';
}
