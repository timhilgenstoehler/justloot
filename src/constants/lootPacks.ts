import type { Rarity } from '../types/game';
import { getRarityWeightsAtDepth } from './rarities';

export interface LootPackDef {
  id: string;
  name: string;
  tagline: string;
  cardCount: number;
  dustCost: number;
  /** Multiplier on epic / legendary / mythic weights; rare gets half the bonus */
  rarityBoost: number;
}

export const LOOT_PACKS: LootPackDef[] = [
  {
    id: 'seeker',
    name: 'Seeker Pack',
    tagline: '5 cards · boosted rare+ odds',
    cardCount: 5,
    dustCost: 50,
    rarityBoost: 1.35,
  },
];

export const LOOT_PACK_BY_ID = Object.fromEntries(
  LOOT_PACKS.map((p) => [p.id, p]),
) as Record<string, LootPackDef>;

export function pickFromRarityWeights(weights: Record<Rarity, number>): Rarity {
  const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
  const total = rarities.reduce((sum, r) => sum + Math.max(0, weights[r]), 0);
  if (total <= 0) return 'common';
  let roll = Math.random() * total;
  for (const rarity of rarities) {
    roll -= Math.max(0, weights[rarity]);
    if (roll <= 0) return rarity;
  }
  return 'common';
}

export function getPackRarityWeights(
  depth: number,
  pack: LootPackDef,
  lootRarityBonus = 0,
): Record<Rarity, number> {
  const base = getRarityWeightsAtDepth(depth, lootRarityBonus);
  const boost = pack.rarityBoost;
  const rare = base.rare * (1 + (boost - 1) * 0.5);
  const epic = base.epic * boost;
  const legendary = base.legendary * boost;
  const mythic = base.mythic * boost;
  const common = Math.max(5, 100 - rare - epic - legendary - mythic);

  return { common, rare, epic, legendary, mythic };
}

export interface RarityOddsRow {
  rarity: Rarity;
  normal: number;
  pack: number;
}

export function getPackOddsComparison(
  depth: number,
  pack: LootPackDef,
): RarityOddsRow[] {
  const normal = getRarityWeightsAtDepth(depth);
  const boosted = getPackRarityWeights(depth, pack);
  const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

  return rarities.map((rarity) => ({
    rarity,
    normal: normal[rarity],
    pack: boosted[rarity],
  }));
}
