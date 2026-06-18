import { SALVAGE_DUST } from '../constants/rarities';
import type { Item } from '../types/game';

export function calculateSalvageDust(item: Item): number {
  return SALVAGE_DUST[item.rarity];
}
