import { create } from 'zustand';
import { ALL_SLOTS } from '../constants/slots';
import { generateItem } from '../systems/lootGenerator';
import { getRarityWeightsAtDepth } from '../constants/rarities';
import type { Rarity, Slot } from '../types/game';
import { useGameStore } from './gameStore';

export type DebugForceRarity = Rarity | 'off';

export interface DebugRarityWeights {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

export const DEBUG_WEIGHT_PRESETS: Record<string, DebugRarityWeights> = {
  default: { common: 65, rare: 25, epic: 8, legendary: 1.8, mythic: 0.2 },
  allLegendary: { common: 0, rare: 0, epic: 0, legendary: 100, mythic: 0 },
  allMythic: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 100 },
  allEpic: { common: 0, rare: 0, epic: 100, legendary: 0, mythic: 0 },
  balancedHigh: { common: 10, rare: 20, epic: 30, legendary: 35, mythic: 5 },
};

interface DebugState {
  active: boolean;
  useCustomWeights: boolean;
  customWeights: DebugRarityWeights;
  forceRarity: DebugForceRarity;
  depthOverride: number;

  enterDebug: () => void;
  exitDebug: () => void;
  setUseCustomWeights: (value: boolean) => void;
  setCustomWeights: (weights: Partial<DebugRarityWeights>) => void;
  applyWeightPreset: (preset: keyof typeof DEBUG_WEIGHT_PRESETS) => void;
  setForceRarity: (rarity: DebugForceRarity) => void;
  setDepthOverride: (depth: number) => void;
  resetFreshCharacter: () => void;
  equipFullRarity: (rarity: Rarity) => void;
  resolveLootDepth: (selectedDepth: number) => number;
  pickLootRarity: (depth: number, lootRarityBonus: number, forceRarity?: Rarity) => Rarity;
}

function pickFromWeights(weights: Record<Rarity, number>): Rarity {
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

function freshDebugGameState(depth: number) {
  useGameStore.getState().resetAll();
  useGameStore.setState({
    playerName: 'Debug',
    depth,
    selectedDepth: depth,
    dust: 9999,
    arenaRating: 1000,
    runPhase: 'idle',
    showResult: false,
    pendingLoot: null,
    combatResult: null,
    feedLog: [],
    leaderboard: [],
  });
}

export const useDebugStore = create<DebugState>((set, get) => ({
  active: false,
  useCustomWeights: false,
  customWeights: { ...DEBUG_WEIGHT_PRESETS.default },
  forceRarity: 'off',
  depthOverride: 50,

  enterDebug: () => {
    set({
      active: true,
      useCustomWeights: false,
      customWeights: { ...DEBUG_WEIGHT_PRESETS.default },
      forceRarity: 'off',
      depthOverride: 50,
    });
    freshDebugGameState(50);
  },

  exitDebug: () => {
    set({
      active: false,
      useCustomWeights: false,
      forceRarity: 'off',
    });
    useGameStore.getState().resetAll();
  },

  setUseCustomWeights: (value) => set({ useCustomWeights: value }),

  setCustomWeights: (weights) =>
    set((state) => ({
      customWeights: { ...state.customWeights, ...weights },
      useCustomWeights: true,
      forceRarity: 'off',
    })),

  applyWeightPreset: (preset) =>
    set({
      customWeights: { ...DEBUG_WEIGHT_PRESETS[preset] },
      useCustomWeights: true,
      forceRarity: 'off',
    }),

  setForceRarity: (rarity) =>
    set({
      forceRarity: rarity,
      useCustomWeights: rarity === 'off',
    }),

  setDepthOverride: (depth) => {
    const clamped = Math.max(1, Math.min(1000, Math.round(depth)));
    set({ depthOverride: clamped });
    useGameStore.setState({ depth: clamped, selectedDepth: clamped });
  },

  resetFreshCharacter: () => {
    freshDebugGameState(get().depthOverride);
  },

  equipFullRarity: (rarity) => {
    const depth = get().depthOverride;
    const equipment: Partial<Record<Slot, import('../types/game').Item>> = {};
    for (const slot of ALL_SLOTS) {
      equipment[slot] = generateItem(0, {
        depth,
        forceSlot: slot,
        forceRarity: rarity,
      });
    }
    useGameStore.setState({
      equipment,
      inventory: [],
      pendingLoot: null,
      showResult: false,
      runPhase: 'idle',
      combatResult: null,
      compareRequest: null,
    });
  },

  resolveLootDepth: (selectedDepth) =>
    get().active ? get().depthOverride : selectedDepth,

  pickLootRarity: (depth, lootRarityBonus, forceRarity) => {
    if (forceRarity) return forceRarity;
    const state = get();
    if (!state.active) {
      return pickFromWeights(getRarityWeightsAtDepth(depth, lootRarityBonus));
    }
    if (state.forceRarity !== 'off') return state.forceRarity;
    if (state.useCustomWeights) {
      return pickFromWeights(state.customWeights);
    }
    return pickFromWeights(
      getRarityWeightsAtDepth(state.depthOverride, lootRarityBonus),
    );
  },
}));
