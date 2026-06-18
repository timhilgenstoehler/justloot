import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { calculateArenaRatingChange } from '../systems/arenaOpponentGenerator';
import {
  applyArenaResult,
  fetchFeed,
  fetchLeaderboard,
  getLeaderboardEntryById,
  postFeedEntry,
} from '../services/leaderboardService';
import { trackRunStarted } from '../services/analyticsService';
import { getCurrentUserId } from '../lib/session';
import { opponentFromLeaderboardEntry } from '../systems/leaderboardSystem';
import { simulateCombat } from '../systems/combatSimulator';
import { generateEnemy } from '../systems/enemyGenerator';
import { generateItem, getItemFingerprint, migrateItem } from '../systems/lootGenerator';
import {
  getBulkDeleteCandidates,
  itemFromInventory,
  toInventoryItem,
} from '../systems/inventoryUtils';
import { resolveEquipSlot } from '../systems/inventorySlots';
import { calculatePowerScore, sumEquippedLootBonuses } from '../systems/powerCalculator';
import type {
  CollectionCounters,
  CollectionEntry,
  CompareRequest,
  FeedEntry,
  GameState,
  InventoryItem,
  InventoryRarityFilter,
  InventorySlotFilter,
  InventorySort,
  Item,
  LeaderboardEntry,
  Rarity,
  Slot,
} from '../types/game';
import { calculateCharacterLoadout } from '../systems/characterStatsCalculator';
import type { PersistedGameData } from '../types/save';
import { INVENTORY_CAPACITY } from '../types/game';
import type { CharacterCombatLoadout } from '../systems/characterStatsCalculator';

type EquipResult = 'equipped' | 'needs_comparison' | 'needs_slot_choice' | 'full' | 'not_found';
type StashResult = 'ok' | 'full' | 'not_found';

interface GameActions {
  startRun: () => void;
  startArenaRun: (opponentId: string) => void;
  ensureLeaderboardReady: () => void;
  advanceCombatLog: () => void;
  enterVictoryPhase: () => void;
  claimVictoryLoot: () => void;
  finishCombatVictory: () => void;
  finishCombatDefeat: () => void;
  dismissDefeat: () => void;
  beginEquipItem: (source: CompareRequest['source'], itemId: string, targetSlot?: Slot) => EquipResult;
  equipPendingLoot: () => EquipResult;
  confirmEquipReplace: () => 'ok' | 'full' | 'not_found';
  cancelEquip: () => StashResult;
  stashPendingLoot: () => StashResult;
  unequipSlot: (slot: Slot) => StashResult;
  toggleFavorite: (itemId: string) => void;
  deleteInventoryItem: (itemId: string) => boolean;
  bulkDeleteByRarity: (rarity: Rarity) => number;
  markCollectionViewed: (fingerprint: string) => void;
  dismissResult: () => void;
  clearSalvageToast: () => void;
  getPowerScore: () => number;
  getCombatLoadout: () => CharacterCombatLoadout;
  getCompareNewItem: () => Item | null;
  getCompareCurrentItem: () => Item | undefined;
  getCurrentItemForPendingSlot: () => Item | undefined;
  setSelectedDepth: (depth: number) => void;
  setInventorySort: (sort: InventorySort) => void;
  setInventorySlotFilter: (filter: InventorySlotFilter) => void;
  setInventoryRarityFilter: (filter: InventoryRarityFilter) => void;
  dismissArenaVictory: () => void;
  resetAll: () => void;
  hydrateFromCloud: (data: PersistedGameData) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setFeedLog: (entries: FeedEntry[]) => void;
  refreshLeaderboardFromCloud: () => Promise<void>;
  refreshFeedFromCloud: () => Promise<void>;
}

type GameStore = GameState & GameActions;

const EMPTY_COUNTERS: CollectionCounters = {
  common: 0,
  rare: 0,
  epic: 0,
  legendary: 0,
  mythic: 0,
  ancient: 0,
};

const initialState: GameState = {
  playerName: 'Tim',
  dust: 0,
  totalRuns: 0,
  depth: 1,
  selectedDepth: 1,
  equipment: {},
  inventory: [],
  pendingLoot: null,
  compareRequest: null,
  inventorySort: 'newest',
  inventorySlotFilter: 'all',
  inventoryRarityFilter: 'all',
  runPhase: 'idle',
  runMode: 'dungeon',
  combatResult: null,
  combatLogIndex: 0,
  showResult: false,
  lastSalvageDust: null,
  lastDefeatDust: null,
  collection: {},
  collectionCounters: { ...EMPTY_COUNTERS },
  feedLog: [],
  arenaRating: 1000,
  arenaWins: 0,
  arenaLosses: 0,
  leaderboard: [],
  equippedLootBonuses: { lootQuality: 0, lootRarity: 0 },
  runBuildState: {
    buildAffixes: [],
    specialEffects: [],
    berserkActive: false,
    revivedThisRun: false,
  },
  arenaOpponentRating: null,
  arenaOpponentId: null,
};

function recordCollection(
  collection: Record<string, CollectionEntry>,
  counters: CollectionCounters,
  item: Item,
  depthFound: number,
): { collection: Record<string, CollectionEntry>; counters: CollectionCounters } {
  const fingerprint = getItemFingerprint(item);
  const nextCounters = { ...counters };
  nextCounters[item.rarity] += 1;
  if (item.quality === 'ancient') nextCounters.ancient += 1;

  if (collection[fingerprint]) {
    return { collection, counters: nextCounters };
  }

  const entry: CollectionEntry = {
    fingerprint,
    name: item.name,
    slot: item.slot,
    rarity: item.rarity,
    quality: item.quality,
    depthFound,
    foundAt: Date.now(),
    viewed: false,
    buildAffix: item.buildAffix,
  };

  return {
    collection: { ...collection, [fingerprint]: entry },
    counters: nextCounters,
  };
}

function addFeedEntry(feedLog: FeedEntry[], text: string): FeedEntry[] {
  const entry: FeedEntry = { id: `${Date.now()}`, text, timestamp: Date.now() };
  return [entry, ...feedLog].slice(0, 50);
}

function applyPersistedMigration(data: PersistedGameData): PersistedGameData {
  const equipment = { ...data.equipment };
  for (const slot of Object.keys(equipment) as Slot[]) {
    const item = equipment[slot];
    if (item) {
      equipment[slot] = migrateItem(item);
    }
  }

  const inventory = data.inventory.map(migrateInventoryItem);
  const collection = { ...data.collection };
  for (const key of Object.keys(collection)) {
    if (collection[key].viewed === undefined) {
      collection[key] = { ...collection[key], viewed: true };
    }
  }

  return {
    ...data,
    equipment,
    inventory,
    collection,
    collectionCounters: data.collectionCounters ?? { ...EMPTY_COUNTERS },
    selectedDepth: data.selectedDepth ?? data.depth ?? 1,
    depth: data.depth ?? 1,
    arenaRating: data.arenaRating ?? 1000,
    arenaWins: data.arenaWins ?? 0,
    arenaLosses: data.arenaLosses ?? 0,
    inventorySort: data.inventorySort ?? 'newest',
    inventorySlotFilter: data.inventorySlotFilter ?? 'all',
    inventoryRarityFilter: data.inventoryRarityFilter ?? 'all',
  };
}

function migrateInventoryItem(item: InventoryItem): InventoryItem {
  const migrated = migrateItem(item);
  return {
    ...migrated,
    acquiredAt: item.acquiredAt ?? Date.now(),
    foundDepth: item.foundDepth ?? 1,
    favorite: item.favorite ?? false,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getPowerScore: () => calculatePowerScore(get().equipment),

      getCombatLoadout: () => calculateCharacterLoadout(get().equipment),

      getCurrentItemForPendingSlot: () => {
        const { compareRequest, equipment } = get();
        if (!compareRequest) return undefined;
        return equipment[compareRequest.targetSlot];
      },

      getCompareNewItem: () => {
        const { compareRequest, pendingLoot, inventory } = get();
        if (!compareRequest) return null;
        if (compareRequest.source === 'pending') {
          return pendingLoot?.id === compareRequest.itemId ? pendingLoot : null;
        }
        const inv = inventory.find((i) => i.id === compareRequest.itemId);
        return inv ? itemFromInventory(inv) : null;
      },

      getCompareCurrentItem: () => {
        const { compareRequest, equipment } = get();
        if (!compareRequest) return undefined;
        return equipment[compareRequest.targetSlot];
      },

      startRun: () => {
        const { equipment, selectedDepth } = get();
        const loadout = calculateCharacterLoadout(equipment);
        const enemy = generateEnemy(selectedDepth);
        const weaponName = equipment.weapon?.name ?? 'Your Strikes';
        const combatResult = simulateCombat(loadout, enemy, {
          depth: selectedDepth,
          weaponName,
        });

        set({
          runPhase: 'combat',
          runMode: 'dungeon',
          combatResult,
          combatLogIndex: 0,
          showResult: false,
          pendingLoot: null,
          lastSalvageDust: null,
          lastDefeatDust: null,
          runBuildState: { ...loadout.build },
          equippedLootBonuses: loadout.lootBonuses,
        });
        trackRunStarted();
      },

      startArenaRun: (opponentId: string) => {
        const state = get();
        const entry = getLeaderboardEntryById(state.leaderboard, opponentId);
        if (!entry) return;

        const opponent = opponentFromLeaderboardEntry(entry);
        const playerLoadout = calculateCharacterLoadout(state.equipment);
        const weaponName = state.equipment.weapon?.name ?? 'Your Strikes';
        const combatResult = simulateCombat(playerLoadout, opponent.enemy, {
          depth: entry.depth,
          locationName: 'ARENA',
          weaponName,
        });

        set({
          runPhase: 'combat',
          runMode: 'arena',
          combatResult,
          combatLogIndex: 0,
          showResult: false,
          pendingLoot: null,
          lastSalvageDust: null,
          lastDefeatDust: null,
          runBuildState: { ...playerLoadout.build },
          equippedLootBonuses: playerLoadout.lootBonuses,
          arenaOpponentRating: opponent.arenaRating,
          arenaOpponentId: opponentId,
        });
        trackRunStarted();
      },

      ensureLeaderboardReady: () => {
        get().refreshLeaderboardFromCloud().catch((err) => console.warn('Leaderboard refresh failed:', err));
        get().refreshFeedFromCloud().catch((err) => console.warn('Feed refresh failed:', err));
      },

      refreshLeaderboardFromCloud: async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;
        const entries = await fetchLeaderboard(userId);
        set({ leaderboard: entries });
      },

      refreshFeedFromCloud: async () => {
        const feed = await fetchFeed();
        set({ feedLog: feed });
      },

      setLeaderboard: (entries) => set({ leaderboard: entries }),

      setFeedLog: (entries) => set({ feedLog: entries }),

      hydrateFromCloud: (data) => {
        const migrated = applyPersistedMigration(data);
        set({
          ...migrated,
          compareRequest: null,
          pendingLoot: null,
          showResult: false,
          runPhase: 'idle',
          runMode: 'dungeon',
          combatResult: null,
          combatLogIndex: 0,
          lastSalvageDust: null,
          lastDefeatDust: null,
          arenaOpponentRating: null,
          arenaOpponentId: null,
        });
      },

      advanceCombatLog: () => {
        const { combatResult, combatLogIndex } = get();
        if (!combatResult) return;
        set({ combatLogIndex: Math.min(combatLogIndex + 1, combatResult.log.length) });
      },

      enterVictoryPhase: () => {
        set({ runPhase: 'victory' });
      },

      claimVictoryLoot: () => {
        const state = get();
        const { equipment, depth, selectedDepth, totalRuns, collection, collectionCounters, feedLog, playerName } = state;
        const powerScore = calculatePowerScore(equipment);
        const lootBonuses = sumEquippedLootBonuses(equipment);
        const item = generateItem(0, { depth: selectedDepth, powerScore, lootBonuses });
        const beatFrontier = selectedDepth >= depth;
        const newMaxDepth = beatFrontier ? depth + 1 : depth;

        const collected = recordCollection(collection, collectionCounters, item, selectedDepth);
        const feedText =
          item.rarity === 'mythic' ? `${playerName} found MYTHIC ${item.name}` : null;

        set({
          depth: newMaxDepth,
          selectedDepth: beatFrontier ? newMaxDepth : selectedDepth,
          totalRuns: totalRuns + 1,
          pendingLoot: item,
          showResult: true,
          combatResult: null,
          combatLogIndex: 0,
          collection: collected.collection,
          collectionCounters: collected.counters,
        });

        if (feedText) {
          getCurrentUserId().then((userId) => {
            if (userId) {
              postFeedEntry(userId, playerName, feedText)
                .then(() => get().refreshFeedFromCloud())
                .catch((err) => console.warn('Feed post failed:', err));
            } else {
              set({ feedLog: addFeedEntry(feedLog, feedText) });
            }
          });
        }
      },

      finishCombatVictory: () => {
        const state = get();
        if (state.runMode === 'arena' && state.arenaOpponentId) {
          const lootBonuses = sumEquippedLootBonuses(state.equipment);
          const powerScore = calculatePowerScore(state.equipment);
          const opponent = getLeaderboardEntryById(state.leaderboard, state.arenaOpponentId);
          const opponentName = opponent?.name ?? 'Opponent';
          const opponentRating = opponent?.arenaRating ?? 1000;

          const playerDelta = calculateArenaRatingChange(
            true,
            state.arenaRating,
            opponentRating,
            lootBonuses.arenaRatingGain,
          );
          const opponentDelta = -playerDelta;
          const newRating = Math.max(0, state.arenaRating + playerDelta);
          const ratingDelta = playerDelta;
          const feedText = `${state.playerName} defeated ${opponentName} in the Arena (${ratingDelta >= 0 ? '+' : ''}${ratingDelta} rating)`;

          set({
            runPhase: 'victory',
            arenaRating: newRating,
            arenaWins: state.arenaWins + 1,
            dust: state.dust + 2,
            arenaOpponentRating: null,
            arenaOpponentId: null,
          });

          getCurrentUserId().then((userId) => {
            if (!userId) {
              set({ feedLog: addFeedEntry(state.feedLog, feedText) });
              return;
            }
            applyArenaResult({
              opponentId: state.arenaOpponentId!,
              playerWon: true,
              playerDelta,
              opponentDelta,
              playerPower: powerScore,
              playerDepth: state.depth,
            })
              .then(async () => {
                await postFeedEntry(userId, state.playerName, feedText);
                await get().refreshLeaderboardFromCloud();
                await get().refreshFeedFromCloud();
              })
              .catch((err) => console.warn('Arena sync failed:', err));
          });
          return;
        }
        set({ runPhase: 'victory' });
      },

      finishCombatDefeat: () => {
        const state = get();

        if (state.runMode === 'arena' && state.arenaOpponentId) {
          const powerScore = calculatePowerScore(state.equipment);
          const opponent = getLeaderboardEntryById(state.leaderboard, state.arenaOpponentId);
          const opponentName = opponent?.name ?? 'Opponent';
          const opponentRating = opponent?.arenaRating ?? 1000;

          const playerDelta = calculateArenaRatingChange(
            false,
            state.arenaRating,
            opponentRating,
            0,
          );
          const opponentDelta = -playerDelta;
          const newRating = Math.max(0, state.arenaRating + playerDelta);
          const feedText = `${state.playerName} was defeated by ${opponentName} in the Arena`;

          set({
            runPhase: 'defeat',
            arenaRating: newRating,
            arenaLosses: state.arenaLosses + 1,
            lastDefeatDust: null,
            combatLogIndex: state.combatResult?.log.length ?? 0,
            arenaOpponentRating: null,
            arenaOpponentId: null,
          });

          getCurrentUserId().then((userId) => {
            if (!userId) {
              set({ feedLog: addFeedEntry(state.feedLog, feedText) });
              return;
            }
            applyArenaResult({
              opponentId: state.arenaOpponentId!,
              playerWon: false,
              playerDelta,
              opponentDelta,
              playerPower: powerScore,
              playerDepth: state.depth,
            })
              .then(async () => {
                await postFeedEntry(userId, state.playerName, feedText);
                await get().refreshLeaderboardFromCloud();
                await get().refreshFeedFromCloud();
              })
              .catch((err) => console.warn('Arena sync failed:', err));
          });
          return;
        }

        const gained = Math.max(1, Math.floor(state.selectedDepth / 3));
        set({
          runPhase: 'defeat',
          dust: state.dust + gained,
          lastDefeatDust: gained,
          combatLogIndex: state.combatResult?.log.length ?? 0,
        });
      },

      dismissDefeat: () => {
        set({
          runPhase: 'idle',
          runMode: 'dungeon',
          combatResult: null,
          combatLogIndex: 0,
          lastDefeatDust: null,
        });
      },

      beginEquipItem: (source, itemId, targetSlot) => {
        const state = get();
        let item: Item | undefined;

        if (source === 'pending') {
          item = state.pendingLoot?.id === itemId ? state.pendingLoot : undefined;
        } else {
          const inv = state.inventory.find((i) => i.id === itemId);
          item = inv ? itemFromInventory(inv) : undefined;
        }

        if (!item) return 'not_found';

        const resolution = resolveEquipSlot(item, state.equipment, targetSlot);
        if (resolution.needsSlotChoice) return 'needs_slot_choice';

        const slot = resolution.slot;
        const current = state.equipment[slot];

        if (current) {
          set({
            compareRequest: { source, itemId, targetSlot: slot },
            showResult: false,
          });
          return 'needs_comparison';
        }

        if (source === 'inventory') {
          set({
            inventory: state.inventory.filter((i) => i.id !== itemId),
            equipment: { ...state.equipment, [slot]: item },
          });
          return 'equipped';
        }

        set({
          equipment: { ...state.equipment, [slot]: item },
          pendingLoot: null,
          showResult: false,
          runPhase: 'idle',
        });
        return 'equipped';
      },

      equipPendingLoot: () => {
        const { pendingLoot } = get();
        if (!pendingLoot) return 'not_found';
        return get().beginEquipItem('pending', pendingLoot.id);
      },

      confirmEquipReplace: () => {
        const state = get();
        const { compareRequest, equipment, inventory, pendingLoot, depth } = state;
        if (!compareRequest) return 'not_found';

        let newItem: Item | null = null;
        if (compareRequest.source === 'pending') {
          if (pendingLoot?.id === compareRequest.itemId) newItem = pendingLoot;
        } else {
          const inv = inventory.find((i) => i.id === compareRequest.itemId);
          if (inv) newItem = itemFromInventory(inv);
        }
        if (!newItem) return 'not_found';

        const slot = compareRequest.targetSlot;
        const oldItem = equipment[slot];
        let newInventory = inventory.filter((i) => i.id !== compareRequest.itemId);

        if (oldItem) {
          if (newInventory.length >= INVENTORY_CAPACITY) return 'full';
          newInventory = [...newInventory, toInventoryItem(oldItem, depth)];
        }

        set({
          equipment: { ...equipment, [slot]: newItem },
          inventory: newInventory,
          pendingLoot: compareRequest.source === 'pending' ? null : pendingLoot,
          compareRequest: null,
          showResult: false,
          runPhase: 'idle',
        });
        return 'ok';
      },

      cancelEquip: () => {
        const state = get();
        const { compareRequest, pendingLoot, inventory, selectedDepth } = state;
        if (!compareRequest) return 'not_found';

        if (compareRequest.source === 'pending' && pendingLoot) {
          if (inventory.length >= INVENTORY_CAPACITY) return 'full';
          set({
            inventory: [...inventory, toInventoryItem(pendingLoot, selectedDepth)],
            pendingLoot: null,
            compareRequest: null,
            showResult: false,
            runPhase: 'idle',
          });
          return 'ok';
        }

        set({ compareRequest: null });
        return 'ok';
      },

      stashPendingLoot: () => {
        const { pendingLoot, inventory, selectedDepth } = get();
        if (!pendingLoot) return 'not_found';
        if (inventory.length >= INVENTORY_CAPACITY) return 'full';
        set({
          inventory: [...inventory, toInventoryItem(pendingLoot, selectedDepth)],
          pendingLoot: null,
          showResult: false,
          runPhase: 'idle',
        });
        return 'ok';
      },

      unequipSlot: (slot) => {
        const { equipment, inventory, depth } = get();
        const item = equipment[slot];
        if (!item) return 'not_found';
        if (inventory.length >= INVENTORY_CAPACITY) return 'full';

        const nextEquipment = { ...equipment };
        delete nextEquipment[slot];
        set({
          equipment: nextEquipment,
          inventory: [...inventory, toInventoryItem(item, depth)],
        });
        return 'ok';
      },

      toggleFavorite: (itemId) => {
        const { inventory } = get();
        set({
          inventory: inventory.map((item) =>
            item.id === itemId ? { ...item, favorite: !item.favorite } : item,
          ),
        });
      },

      deleteInventoryItem: (itemId) => {
        const { inventory, equipment } = get();
        const item = inventory.find((i) => i.id === itemId);
        if (!item || item.favorite) return false;
        if (Object.values(equipment).some((e) => e?.id === itemId)) return false;
        set({ inventory: inventory.filter((i) => i.id !== itemId) });
        return true;
      },

      bulkDeleteByRarity: (rarity) => {
        const { inventory, equipment } = get();
        const candidates = getBulkDeleteCandidates(inventory, rarity, equipment);
        const ids = new Set(candidates.map((i) => i.id));
        set({ inventory: inventory.filter((i) => !ids.has(i.id)) });
        return candidates.length;
      },

      markCollectionViewed: (fingerprint) => {
        const { collection } = get();
        const entry = collection[fingerprint];
        if (!entry || entry.viewed) return;
        set({
          collection: {
            ...collection,
            [fingerprint]: { ...entry, viewed: true },
          },
        });
      },

      dismissResult: () => {
        get().stashPendingLoot();
      },

      setInventorySort: (sort) => set({ inventorySort: sort }),
      setInventorySlotFilter: (filter) => set({ inventorySlotFilter: filter }),
      setInventoryRarityFilter: (filter) => set({ inventoryRarityFilter: filter }),

      clearSalvageToast: () => {
        set({ lastSalvageDust: null });
      },

      setSelectedDepth: (nextDepth: number) => {
        const { depth, runPhase, showResult } = get();
        if (runPhase !== 'idle' || showResult) return;
        const clamped = Math.max(1, Math.min(nextDepth, depth));
        set({ selectedDepth: clamped });
      },

      dismissArenaVictory: () => {
        set({
          runPhase: 'idle',
          runMode: 'dungeon',
          combatResult: null,
          combatLogIndex: 0,
        });
      },

      resetAll: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'loot-save',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playerName: state.playerName,
        dust: state.dust,
        totalRuns: state.totalRuns,
        depth: state.depth,
        selectedDepth: state.selectedDepth ?? state.depth ?? 1,
        equipment: state.equipment,
        inventory: state.inventory,
        inventorySort: state.inventorySort,
        inventorySlotFilter: state.inventorySlotFilter,
        inventoryRarityFilter: state.inventoryRarityFilter,
        collection: state.collection,
        collectionCounters: state.collectionCounters,
        arenaRating: state.arenaRating,
        arenaWins: state.arenaWins,
        arenaLosses: state.arenaLosses,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const migrated = applyPersistedMigration({
          playerName: state.playerName ?? 'Adventurer',
          dust: state.dust ?? 0,
          totalRuns: state.totalRuns ?? 0,
          depth: state.depth ?? 1,
          selectedDepth: state.selectedDepth ?? state.depth ?? 1,
          equipment: state.equipment ?? {},
          inventory: state.inventory ?? [],
          inventorySort: state.inventorySort ?? 'newest',
          inventorySlotFilter: state.inventorySlotFilter ?? 'all',
          inventoryRarityFilter: state.inventoryRarityFilter ?? 'all',
          collection: state.collection ?? {},
          collectionCounters: state.collectionCounters ?? { ...EMPTY_COUNTERS },
          arenaRating: state.arenaRating ?? 1000,
          arenaWins: state.arenaWins ?? 0,
          arenaLosses: state.arenaLosses ?? 0,
        });
        useGameStore.setState({
          ...migrated,
          compareRequest: null,
          leaderboard: [],
          feedLog: [],
          runPhase: 'idle',
          runMode: 'dungeon',
          combatResult: null,
          combatLogIndex: 0,
        });
      },
    },
  ),
);
