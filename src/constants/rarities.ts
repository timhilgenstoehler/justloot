import type { Rarity } from '../types/game';

export const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

/** Base drop chances (percent of total weight). */
export const BASE_RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 65,
  rare: 25,
  epic: 8,
  legendary: 1.8,
  mythic: 0.2,
};

/** Legendary / Mythic % at depth anchors (of total drops). */
const DEPTH_RARITY_ANCHORS: { depth: number; legendary: number; mythic: number }[] = [
  { depth: 1, legendary: 0.2, mythic: 0 },
  { depth: 50, legendary: 1, mythic: 0.05 },
  { depth: 100, legendary: 2, mythic: 0.1 },
  { depth: 500, legendary: 5, mythic: 0.5 },
  { depth: 1000, legendary: 10, mythic: 1 },
];

function lerpAnchors(depth: number): { legendary: number; mythic: number } {
  const d = Math.max(1, depth);
  if (d <= DEPTH_RARITY_ANCHORS[0].depth) return DEPTH_RARITY_ANCHORS[0];
  const last = DEPTH_RARITY_ANCHORS[DEPTH_RARITY_ANCHORS.length - 1];
  if (d >= last.depth) return last;

  for (let i = 0; i < DEPTH_RARITY_ANCHORS.length - 1; i++) {
    const a = DEPTH_RARITY_ANCHORS[i];
    const b = DEPTH_RARITY_ANCHORS[i + 1];
    if (d >= a.depth && d <= b.depth) {
      const t = (d - a.depth) / (b.depth - a.depth);
      return {
        legendary: a.legendary + (b.legendary - a.legendary) * t,
        mythic: a.mythic + (b.mythic - a.mythic) * t,
      };
    }
  }
  return last;
}

export function getRarityWeightsAtDepth(depth: number, lootRarityBonus = 0): Record<Rarity, number> {
  const anchors = lerpAnchors(depth);
  const mythicPct = anchors.mythic * (1 + lootRarityBonus / 100);
  const legendaryPct = anchors.legendary * (1 + lootRarityBonus / 100);
  const epicPct = BASE_RARITY_WEIGHTS.epic;
  const rarePct = BASE_RARITY_WEIGHTS.rare;
  const commonPct = Math.max(5, 100 - rarePct - epicPct - legendaryPct - mythicPct);

  return {
    common: commonPct,
    rare: rarePct,
    epic: epicPct,
    legendary: legendaryPct,
    mythic: mythicPct,
  };
}

export const RARITY_POWER_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  rare: 1.08,
  epic: 1.18,
  legendary: 1.35,
  mythic: 1.55,
};

export const QUALITY_POWER_MULTIPLIERS: Record<string, number> = {
  poor: 0.85,
  normal: 1,
  great: 1.1,
  perfect: 1.2,
  ancient: 1.35,
};

export const SALVAGE_DUST: Record<Rarity, number> = {
  common: 2,
  rare: 5,
  epic: 8,
  legendary: 12,
  mythic: 25,
};
