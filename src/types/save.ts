import type {
  CollectionCounters,
  CollectionEntry,
  InventoryItem,
  InventoryRarityFilter,
  InventorySlotFilter,
  InventorySort,
  Item,
  Slot,
} from './game';

/** Serializable slice synced to Supabase (matches gameStore partialize). */
export interface PersistedGameData {
  playerName: string;
  dust: number;
  totalRuns: number;
  depth: number;
  selectedDepth: number;
  equipment: Partial<Record<Slot, Item>>;
  inventory: InventoryItem[];
  inventorySort: InventorySort;
  inventorySlotFilter: InventorySlotFilter;
  inventoryRarityFilter: InventoryRarityFilter;
  collection: Record<string, CollectionEntry>;
  collectionCounters: CollectionCounters;
  arenaRating: number;
  arenaWins: number;
  arenaLosses: number;
}

export const DEFAULT_PERSISTED_GAME: PersistedGameData = {
  playerName: 'Adventurer',
  dust: 0,
  totalRuns: 0,
  depth: 1,
  selectedDepth: 1,
  equipment: {},
  inventory: [],
  inventorySort: 'newest',
  inventorySlotFilter: 'all',
  inventoryRarityFilter: 'all',
  collection: {},
  collectionCounters: {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    ancient: 0,
  },
  arenaRating: 1000,
  arenaWins: 0,
  arenaLosses: 0,
};
