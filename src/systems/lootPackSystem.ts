import { generateItem } from '../systems/lootGenerator';
import { calculatePowerScore, sumEquippedLootBonuses } from '../systems/powerCalculator';
import {
  getPackRarityWeights,
  LOOT_PACK_BY_ID,
  type LootPackDef,
} from '../constants/lootPacks';
import type { Item, Slot } from '../types/game';

export function generatePackItems(
  pack: LootPackDef,
  depth: number,
  equipment: Partial<Record<Slot, Item>>,
): Item[] {
  const powerScore = calculatePowerScore(equipment);
  const lootBonuses = sumEquippedLootBonuses(equipment);
  const rarityWeights = getPackRarityWeights(depth, pack, lootBonuses.lootRarity);

  const items: Item[] = [];
  for (let i = 0; i < pack.cardCount; i++) {
    items.push(
      generateItem(0, {
        depth,
        powerScore,
        lootBonuses,
        rarityWeights,
      }),
    );
  }
  return items;
}

export function getLootPack(packId: string): LootPackDef | undefined {
  return LOOT_PACK_BY_ID[packId];
}
