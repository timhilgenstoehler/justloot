import {
  BUILD_AFFIX_LABELS,
  RARITY_AFFIX_COUNT,
  pickWeightedStatForSlot,
  rollDefense,
  rollItemQuality,
  rollStatValue,
  SPECIAL_EFFECT_LABELS,
} from '../constants/statRegistry';
import { ALL_SLOTS } from '../constants/slots';
import {
  getBaseNameForSlot,
  OF_CONNECTORS,
  PREFIXES,
  SUFFIXES,
} from '../constants/nameTables';
import { calculateItemPower } from './powerCalculator';
import { clampLegacyStatValue, migrateLegacyStatId, REMOVED_STAT_IDS } from './itemMigration';
import { STAT_BY_ID } from '../constants/statRegistry';
import { pickFromRarityWeights } from '../constants/lootPacks';
import { useDebugStore } from '../store/debugStore';
import type {
  BuildAffixId,
  Item,
  ItemQuality,
  LootBonuses,
  Rarity,
  SecondaryStat,
  Slot,
  SpecialEffectId,
} from '../types/game';

const BUILD_AFFIX_POOL: BuildAffixId[] = ['fireball', 'poisonNova', 'chainLightning', 'berserk'];
const SPECIAL_EFFECT_POOL: SpecialEffectId[] = [
  'critAppliesBurn',
  'immunePoison',
  'immuneBurn',
  'immuneFrost',
  'reviveOncePerRun',
  'fireIgnoresArmor',
  'attackTwiceEveryThirdTurn',
];

function generateItemName(slot: Slot): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const base = getBaseNameForSlot(slot);

  if (Math.random() < 0.35) {
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    if (suffix === 'of the Fallen King' || suffix === 'of Eternity') {
      return `${prefix} ${base} ${suffix}`;
    }
    return `${prefix} ${base} ${suffix}`;
  }

  if (Math.random() < 0.4) {
    const connector = OF_CONNECTORS[Math.floor(Math.random() * OF_CONNECTORS.length)];
    return `${prefix} ${base} of ${connector}`;
  }

  if (Math.random() < 0.15) {
    return `${prefix}'s ${base}`;
  }

  return `${prefix} ${base}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rollBuildAffix(rarity: Rarity, quality: ItemQuality): BuildAffixId | undefined {
  const chance =
    rarity === 'mythic' ? 0.08 : rarity === 'legendary' && quality === 'ancient' ? 0.05 : 0;
  if (Math.random() >= chance) return undefined;
  return BUILD_AFFIX_POOL[Math.floor(Math.random() * BUILD_AFFIX_POOL.length)];
}

function rollSpecialEffects(rarity: Rarity, quality: ItemQuality): SpecialEffectId[] {
  const chance =
    rarity === 'mythic' ? 0.06 : rarity === 'legendary' && quality === 'ancient' ? 0.04 : 0;
  if (Math.random() >= chance) return [];

  const count = Math.random() < 0.3 ? 2 : 1;
  const picked = new Set<SpecialEffectId>();
  while (picked.size < count) {
    picked.add(SPECIAL_EFFECT_POOL[Math.floor(Math.random() * SPECIAL_EFFECT_POOL.length)]);
  }
  return [...picked];
}

function rollSecondaryStats(
  slot: Slot,
  rarity: Rarity,
  quality: ItemQuality,
  depth: number,
  rollPercentile?: number,
): SecondaryStat[] {
  const count = RARITY_AFFIX_COUNT[rarity];
  const usedIds = new Set<string>();
  const stats: SecondaryStat[] = [];

  while (stats.length < count) {
    const def = pickWeightedStatForSlot(slot, usedIds);
    if (!def) break;
    usedIds.add(def.id);

    const value = rollStatValue(def.id, rarity, quality, depth, rollPercentile);
    if (value <= 0) continue;

    stats.push({
      id: def.id,
      value,
      display: def.format(value),
    });
  }

  return stats;
}

export interface GenerateItemOptions {
  powerScore?: number;
  depth: number;
  lootBonuses?: LootBonuses;
  forceSlot?: Slot;
  forceRarity?: Rarity;
  forceQuality?: ItemQuality;
  /** 0 = bottom of quality band, 1 = top */
  rollPercentile?: number;
  /** Override drop weights (e.g. loot packs) */
  rarityWeights?: Record<Rarity, number>;
}

export function generateItem(
  powerScoreOrDepth: number,
  depthOrOptions?: number | GenerateItemOptions,
  maybeOptions?: GenerateItemOptions,
): Item {
  let powerScore = 0;
  let depth = 1;
  let options: GenerateItemOptions = { depth: 1 };

  if (typeof depthOrOptions === 'number') {
    powerScore = powerScoreOrDepth;
    depth = depthOrOptions;
    options = { ...maybeOptions, depth, powerScore };
  } else {
    options = depthOrOptions ?? { depth: powerScoreOrDepth };
    depth = options.depth;
    powerScore = options.powerScore ?? 0;
  }

  const lootBonuses = options.lootBonuses ?? { lootQuality: 0, lootRarity: 0 };
  const slot = options.forceSlot ?? ALL_SLOTS[Math.floor(Math.random() * ALL_SLOTS.length)];
  const rarity =
    options.forceRarity ??
    (options.rarityWeights
      ? pickFromRarityWeights(options.rarityWeights)
      : useDebugStore.getState().pickLootRarity(depth, lootBonuses.lootRarity));
  const quality = options.forceQuality ?? rollItemQuality(rarity);

  const name = generateItemName(slot);
  const defense = rollDefense(slot, rarity, quality, depth, options.rollPercentile);
  const stats = rollSecondaryStats(slot, rarity, quality, depth, options.rollPercentile);
  const buildAffix = rollBuildAffix(rarity, quality);
  const specialEffects = rollSpecialEffects(rarity, quality);

  const item: Item = {
    id: generateId(),
    slot,
    rarity,
    quality,
    name,
    defense,
    stats,
    buildAffix,
    specialEffects: specialEffects.length > 0 ? specialEffects : undefined,
    power: 0,
  };

  item.power = calculateItemPower(item);
  return item;
}

export function getItemFingerprint(item: Pick<Item, 'name' | 'slot' | 'rarity' | 'stats' | 'buildAffix'>): string {
  const affixKey = [...item.stats]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => `${s.id}:${s.value}`)
    .join('|');
  return `${item.slot}:${item.rarity}:${item.name}:${item.buildAffix ?? ''}:${affixKey}`;
}

export function migrateItem(item: Partial<Item> & { power?: number }): Item {
  const quality = item.quality ?? 'normal';
  const stats = (item.stats ?? [])
    .map((stat) => {
      const id = migrateLegacyStatId(stat.id);
      const value = clampLegacyStatValue(id, stat.value);
      const def = STAT_BY_ID[id];
      return { id, value, display: def?.format(value) ?? stat.display };
    })
    .filter((stat) => !REMOVED_STAT_IDS.has(stat.id));

  const migrated: Item = {
    id: item.id!,
    slot: item.slot!,
    rarity: item.rarity!,
    quality,
    name: item.name!,
    defense: item.defense,
    stats: stats.length > 0 ? stats : [{
      id: 'strength',
      value: Math.max(1, Math.round((item.power ?? 10) / 3)),
      display: `+${Math.max(1, Math.round((item.power ?? 10) / 3))} Strength`,
    }],
    buildAffix: item.buildAffix,
    specialEffects: item.specialEffects,
    power: 0,
  };

  migrated.power = calculateItemPower(migrated);
  return migrated;
}
