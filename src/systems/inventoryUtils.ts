import { RARITIES } from '../constants/rarities';
import type {
  CollectionEntry,
  InventoryItem,
  InventoryRarityFilter,
  InventorySlotFilter,
  InventorySort,
  Item,
  Rarity,
  Slot,
} from '../types/game';
import { getItemFingerprint } from './lootGenerator';
import { getSlotGroup } from './inventorySlots';

const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
  mythic: 4,
};

export function isItemEquipped(
  itemId: string,
  equipment: Partial<Record<Slot, Item>>,
): boolean {
  return Object.values(equipment).some((item) => item?.id === itemId);
}

export function canDeleteItem(
  item: InventoryItem,
  equipment: Partial<Record<Slot, Item>>,
): boolean {
  if (item.favorite) return false;
  if (isItemEquipped(item.id, equipment)) return false;
  return true;
}

export function getMainAffixLines(item: Item, maxLines = 3): string[] {
  return item.stats.slice(0, maxLines).map((stat) => stat.display);
}

export function matchesSlotFilter(item: Item, filter: InventorySlotFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'ring') return item.slot === 'ring1' || item.slot === 'ring2';
  if (filter === 'trinket') return item.slot === 'trinket1' || item.slot === 'trinket2';
  return item.slot === filter;
}

export function matchesRarityFilter(item: Item, filter: InventoryRarityFilter): boolean {
  if (filter === 'all') return true;
  return item.rarity === filter;
}

export function filterInventory(
  items: InventoryItem[],
  slotFilter: InventorySlotFilter,
  rarityFilter: InventoryRarityFilter,
): InventoryItem[] {
  return items.filter(
    (item) => matchesSlotFilter(item, slotFilter) && matchesRarityFilter(item, rarityFilter),
  );
}

export function sortInventory(items: InventoryItem[], sort: InventorySort): InventoryItem[] {
  const sorted = [...items];
  switch (sort) {
    case 'power':
      return sorted.sort((a, b) => b.power - a.power);
    case 'rarity':
      return sorted.sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]);
    case 'slot':
      return sorted.sort((a, b) => getSlotGroup(a.slot).localeCompare(getSlotGroup(b.slot)));
    case 'newest':
    default:
      return sorted.sort((a, b) => b.acquiredAt - a.acquiredAt);
  }
}

export function toInventoryItem(item: Item, foundDepth: number): InventoryItem {
  return {
    ...item,
    acquiredAt: Date.now(),
    foundDepth,
    favorite: false,
  };
}

export function itemFromInventory(inv: InventoryItem): Item {
  const { acquiredAt: _a, foundDepth: _d, favorite: _f, ...item } = inv;
  return item;
}

export function getBulkDeleteCandidates(
  items: InventoryItem[],
  rarity: Rarity,
  equipment: Partial<Record<Slot, Item>>,
): InventoryItem[] {
  if (rarity === 'mythic') return [];
  return items.filter(
    (item) =>
      item.rarity === rarity &&
      !item.favorite &&
      !isItemEquipped(item.id, equipment),
  );
}

export function canSalvageItem(
  item: InventoryItem,
  equipment: Partial<Record<Slot, Item>>,
): boolean {
  return canDeleteItem(item, equipment);
}

export function getBulkSalvageCandidates(
  items: InventoryItem[],
  rarity: Rarity,
  equipment: Partial<Record<Slot, Item>>,
): InventoryItem[] {
  return getBulkDeleteCandidates(items, rarity, equipment);
}

export function isNewDiscovery(
  item: Item,
  collection: Record<string, CollectionEntry>,
): boolean {
  const fingerprint = getItemFingerprint(item);
  const entry = collection[fingerprint];
  return !!entry && entry.viewed === false;
}

export const RARITY_FILTER_OPTIONS: InventoryRarityFilter[] = [
  'all',
  ...RARITIES,
];
