import type { ItemQuality, Rarity, Slot, StatCategory, StatId } from '../types/game';

export interface StatRollRange {
  min: number;
  max: number;
}

export interface StatDefinition {
  id: StatId;
  category: StatCategory;
  format: (value: number) => string;
  powerPerPoint: number;
  slots?: Slot[];
  isPercent?: boolean;
  rollByRarity?: Partial<Record<Rarity, StatRollRange>>;
  hardCap?: number;
  deprecated?: boolean;
}

const PRIMARY_ROLLS: Record<Rarity, StatRollRange> = {
  common: { min: 1, max: 5 },
  rare: { min: 3, max: 10 },
  epic: { min: 8, max: 20 },
  legendary: { min: 15, max: 40 },
  mythic: { min: 25, max: 80 },
};

const RESIST_ROLLS: Record<Rarity, StatRollRange> = {
  common: { min: 1, max: 15 },
  rare: { min: 3, max: 20 },
  epic: { min: 5, max: 25 },
  legendary: { min: 8, max: 40 },
  mythic: { min: 12, max: 50 },
};

const ALL_RESIST_ROLLS: Record<Rarity, StatRollRange> = {
  common: { min: 0, max: 0 },
  rare: { min: 2, max: 5 },
  epic: { min: 5, max: 10 },
  legendary: { min: 10, max: 20 },
  mythic: { min: 15, max: 30 },
};

export const STAT_REGISTRY: StatDefinition[] = [
  { id: 'vitality', category: 'primary', format: (v) => `+${v} Vitality`, powerPerPoint: 2.5, rollByRarity: PRIMARY_ROLLS },
  { id: 'strength', category: 'primary', format: (v) => `+${v} Strength`, powerPerPoint: 2.5, rollByRarity: PRIMARY_ROLLS },
  { id: 'fortitude', category: 'primary', format: (v) => `+${v} Fortitude`, powerPerPoint: 2.5, rollByRarity: PRIMARY_ROLLS },
  { id: 'dexterity', category: 'primary', format: (v) => `+${v} Dexterity`, powerPerPoint: 2.5, rollByRarity: PRIMARY_ROLLS },
  { id: 'critChance', category: 'offensive', format: (v) => `+${v}% Critical Hit Chance`, powerPerPoint: 3, isPercent: true, hardCap: 50, rollByRarity: { common: { min: 1, max: 8 }, rare: { min: 3, max: 12 }, epic: { min: 5, max: 18 }, legendary: { min: 8, max: 22 }, mythic: { min: 12, max: 25 } } },
  { id: 'critDamage', category: 'offensive', format: (v) => `+${v}% Critical Damage`, powerPerPoint: 2.5, isPercent: true, rollByRarity: { common: { min: 5, max: 15 }, rare: { min: 8, max: 25 }, epic: { min: 12, max: 35 }, legendary: { min: 20, max: 45 }, mythic: { min: 30, max: 50 } } },
  { id: 'fireDamage', category: 'offensive', format: (v) => `+${v}% Fire Damage`, powerPerPoint: 2.8, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 5, max: 15 }, epic: { min: 8, max: 20 }, legendary: { min: 12, max: 28 }, mythic: { min: 18, max: 35 } } },
  { id: 'frostDamage', category: 'offensive', format: (v) => `+${v}% Frost Damage`, powerPerPoint: 2.8, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 5, max: 15 }, epic: { min: 8, max: 20 }, legendary: { min: 12, max: 28 }, mythic: { min: 18, max: 35 } } },
  { id: 'lightningDamage', category: 'offensive', format: (v) => `+${v}% Lightning Damage`, powerPerPoint: 2.8, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 5, max: 15 }, epic: { min: 8, max: 20 }, legendary: { min: 12, max: 28 }, mythic: { min: 18, max: 35 } } },
  { id: 'poisonDamage', category: 'offensive', format: (v) => `+${v}% Poison Damage`, powerPerPoint: 2.8, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 5, max: 15 }, epic: { min: 8, max: 20 }, legendary: { min: 12, max: 28 }, mythic: { min: 18, max: 35 } } },
  { id: 'bleedDamage', category: 'offensive', format: (v) => `+${v}% Bleed Damage`, powerPerPoint: 2.8, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 5, max: 15 }, epic: { min: 8, max: 20 }, legendary: { min: 12, max: 28 }, mythic: { min: 18, max: 35 } } },
  { id: 'lifeSteal', category: 'offensive', format: (v) => `${v}% Life Stolen Per Hit`, powerPerPoint: 5, isPercent: true, hardCap: 20, slots: ['weapon', 'gloves', 'ring1', 'ring2'], rollByRarity: { common: { min: 1, max: 4 }, rare: { min: 2, max: 6 }, epic: { min: 4, max: 8 }, legendary: { min: 6, max: 15 }, mythic: { min: 10, max: 20 } } },
  { id: 'executeChance', category: 'offensive', format: (v) => `+${v}% Execute Chance`, powerPerPoint: 4, isPercent: true, slots: ['weapon', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 1, max: 3 }, rare: { min: 2, max: 5 }, epic: { min: 3, max: 8 }, legendary: { min: 5, max: 12 }, mythic: { min: 8, max: 15 } } },
  { id: 'blockChance', category: 'defensive', format: (v) => `+${v}% Block Chance`, powerPerPoint: 3, isPercent: true, hardCap: 35, slots: ['helmet', 'chest', 'bracers', 'gloves', 'waist', 'legs', 'boots'], rollByRarity: { common: { min: 1, max: 8 }, rare: { min: 3, max: 10 }, epic: { min: 5, max: 12 }, legendary: { min: 8, max: 18 }, mythic: { min: 12, max: 20 } } },
  { id: 'dodgeChance', category: 'defensive', format: (v) => `+${v}% Dodge Chance`, powerPerPoint: 3, isPercent: true, hardCap: 35, rollByRarity: { common: { min: 1, max: 8 }, rare: { min: 3, max: 10 }, epic: { min: 5, max: 12 }, legendary: { min: 8, max: 18 }, mythic: { min: 12, max: 20 } } },
  { id: 'healthRegen', category: 'defensive', format: (v) => `+${v} Health Regeneration`, powerPerPoint: 2, rollByRarity: { common: { min: 1, max: 4 }, rare: { min: 2, max: 6 }, epic: { min: 4, max: 8 }, legendary: { min: 6, max: 25 }, mythic: { min: 10, max: 50 } } },
  { id: 'armorPercent', category: 'defensive', format: (v) => `+${v}% Armor`, powerPerPoint: 2.2, isPercent: true, slots: ['helmet', 'shoulders', 'chest', 'bracers', 'gloves', 'waist', 'legs', 'boots'], rollByRarity: { common: { min: 2, max: 8 }, rare: { min: 4, max: 12 }, epic: { min: 6, max: 18 }, legendary: { min: 10, max: 25 }, mythic: { min: 15, max: 35 } } },
  { id: 'fireResist', category: 'defensive', format: (v) => `+${v}% Fire Resistance`, powerPerPoint: 1.8, isPercent: true, hardCap: 50, rollByRarity: RESIST_ROLLS },
  { id: 'frostResist', category: 'defensive', format: (v) => `+${v}% Frost Resistance`, powerPerPoint: 1.8, isPercent: true, hardCap: 50, rollByRarity: RESIST_ROLLS },
  { id: 'lightningResist', category: 'defensive', format: (v) => `+${v}% Lightning Resistance`, powerPerPoint: 1.8, isPercent: true, hardCap: 50, rollByRarity: RESIST_ROLLS },
  { id: 'poisonResist', category: 'defensive', format: (v) => `+${v}% Poison Resistance`, powerPerPoint: 1.8, isPercent: true, hardCap: 50, rollByRarity: RESIST_ROLLS },
  { id: 'bleedResist', category: 'defensive', format: (v) => `+${v}% Bleed Resistance`, powerPerPoint: 1.8, isPercent: true, hardCap: 50, rollByRarity: RESIST_ROLLS },
  { id: 'allResist', category: 'defensive', format: (v) => `+${v} All Resistances`, powerPerPoint: 4, isPercent: true, hardCap: 30, rollByRarity: ALL_RESIST_ROLLS },
  { id: 'attackSpeed', category: 'offensive', format: (v) => `+${v}% Attack Speed`, powerPerPoint: 2.5, isPercent: true, slots: ['weapon', 'gloves', 'ring1', 'ring2'], rollByRarity: { common: { min: 1, max: 6 }, rare: { min: 3, max: 10 }, epic: { min: 5, max: 12 }, legendary: { min: 8, max: 18 }, mythic: { min: 12, max: 25 } } },
  { id: 'thorns', category: 'defensive', format: (v) => `Attacker Takes ${v} Damage`, powerPerPoint: 1.5, rollByRarity: { common: { min: 1, max: 4 }, rare: { min: 2, max: 6 }, epic: { min: 4, max: 10 }, legendary: { min: 6, max: 15 }, mythic: { min: 10, max: 20 } } },
  { id: 'lootQuality', category: 'utility', format: (v) => `+${v}% Loot Quality`, powerPerPoint: 2, isPercent: true, slots: ['ring1', 'ring2', 'necklace', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 1, max: 4 }, rare: { min: 2, max: 6 }, epic: { min: 4, max: 8 }, legendary: { min: 6, max: 15 }, mythic: { min: 10, max: 20 } } },
  { id: 'lootRarity', category: 'utility', format: (v) => `+${v}% Loot Rarity`, powerPerPoint: 3, isPercent: true, slots: ['ring1', 'ring2', 'necklace', 'trinket1', 'trinket2'], rollByRarity: { common: { min: 1, max: 4 }, rare: { min: 2, max: 6 }, epic: { min: 4, max: 8 }, legendary: { min: 6, max: 15 }, mythic: { min: 10, max: 20 } } },
  { id: 'goldFind', category: 'utility', format: (v) => `+${v}% Gold Find`, powerPerPoint: 1.2, isPercent: true, slots: ['ring1', 'ring2', 'waist', 'boots'], rollByRarity: { common: { min: 3, max: 10 }, rare: { min: 6, max: 15 }, epic: { min: 10, max: 22 }, legendary: { min: 15, max: 30 }, mythic: { min: 20, max: 40 } } },
  { id: 'arenaRatingGain', category: 'utility', format: (v) => `+${v}% Arena Rating Gain`, powerPerPoint: 2.5, isPercent: true, slots: ['trinket1', 'trinket2', 'necklace'], rollByRarity: { common: { min: 1, max: 5 }, rare: { min: 3, max: 8 }, epic: { min: 5, max: 12 }, legendary: { min: 8, max: 18 }, mythic: { min: 12, max: 25 } } },
  // Legacy — migration display only
  { id: 'dustFind', category: 'utility', format: (v) => `+${v}% Dust Find`, powerPerPoint: 1.5, isPercent: true, deprecated: true },
  { id: 'experienceGain', category: 'utility', format: (v) => `+${v}% Experience Gain`, powerPerPoint: 1, isPercent: true, deprecated: true },
  { id: 'bossDamage', category: 'offensive', format: (v) => `+${v}% Boss Damage`, powerPerPoint: 3.5, isPercent: true, deprecated: true },
  { id: 'attackRating', category: 'offensive', format: (v) => `+${v} Attack Rating`, powerPerPoint: 0.5, deprecated: true },
  { id: 'enhancedDefense', category: 'defensive', format: (v) => `+${v}% Enhanced Defense`, powerPerPoint: 2, isPercent: true, deprecated: true },
  { id: 'enhancedDamage', category: 'offensive', format: (v) => `+${v}% Enhanced Damage`, powerPerPoint: 2, isPercent: true, deprecated: true },
  { id: 'maxLife', category: 'primary', format: (v) => `+${v} Maximum Life`, powerPerPoint: 0.8, deprecated: true },
  { id: 'coldResist', category: 'defensive', format: (v) => `+${v}% Cold Resist`, powerPerPoint: 1.8, isPercent: true, deprecated: true },
  { id: 'magicFind', category: 'utility', format: (v) => `+${v}% Magic Find`, powerPerPoint: 2, isPercent: true, deprecated: true },
  { id: 'fasterHitRecovery', category: 'offensive', format: (v) => `+${v}% Faster Hit Recovery`, powerPerPoint: 2, isPercent: true, deprecated: true },
  { id: 'manaSteal', category: 'offensive', format: (v) => `${v}% Mana Steal`, powerPerPoint: 4, isPercent: true, deprecated: true },
  { id: 'maxStamina', category: 'utility', format: (v) => `+${v} Max Stamina`, powerPerPoint: 0.3, deprecated: true },
  { id: 'maxMana', category: 'utility', format: (v) => `+${v} Max Mana`, powerPerPoint: 0.3, deprecated: true },
  { id: 'lightRadius', category: 'utility', format: (v) => `+${v} Light Radius`, powerPerPoint: 1, deprecated: true },
];

export const STAT_BY_ID = Object.fromEntries(
  STAT_REGISTRY.map((d) => [d.id, d]),
) as Record<StatId, StatDefinition>;

export const RARITY_AFFIX_COUNT: Record<Rarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

const ARMOR_SLOTS: Slot[] = ['helmet', 'shoulders', 'chest', 'bracers', 'gloves', 'waist', 'legs', 'boots'];
const WEAPON_SLOTS: Slot[] = ['weapon'];
const JEWELRY_SLOTS: Slot[] = ['ring1', 'ring2', 'necklace', 'trinket1', 'trinket2'];

const SLOT_CATEGORY_WEIGHTS: Record<Slot, Partial<Record<StatCategory, number>>> = {
  weapon: { primary: 1, offensive: 4, defensive: 0.5, utility: 0.5 },
  helmet: { primary: 1, offensive: 0.5, defensive: 3, utility: 1 },
  shoulders: { primary: 1, offensive: 0.5, defensive: 3, utility: 0.5 },
  chest: { primary: 1.5, offensive: 0.5, defensive: 4, utility: 0.5 },
  bracers: { primary: 1, offensive: 1, defensive: 2.5, utility: 0.5 },
  gloves: { primary: 1, offensive: 2.5, defensive: 1.5, utility: 0.5 },
  waist: { primary: 1, offensive: 0.5, defensive: 2, utility: 2 },
  legs: { primary: 1.5, offensive: 0.5, defensive: 3.5, utility: 0.5 },
  boots: { primary: 1, offensive: 0.5, defensive: 2, utility: 2 },
  ring1: { primary: 1, offensive: 2, defensive: 1.5, utility: 3 },
  ring2: { primary: 1, offensive: 2, defensive: 1.5, utility: 3 },
  necklace: { primary: 1.5, offensive: 1.5, defensive: 2, utility: 2.5 },
  trinket1: { primary: 1, offensive: 2, defensive: 1, utility: 3 },
  trinket2: { primary: 1, offensive: 2, defensive: 1, utility: 3 },
};

const QUALITY_ROLL_BAND: Record<ItemQuality, { minPct: number; maxPct: number }> = {
  poor: { minPct: 0, maxPct: 0.35 },
  normal: { minPct: 0.3, maxPct: 0.65 },
  great: { minPct: 0.55, maxPct: 0.85 },
  perfect: { minPct: 0.75, maxPct: 0.95 },
  ancient: { minPct: 0.9, maxPct: 1 },
};

const ANCIENT_QUALITY_CHANCE: Record<Rarity, number> = {
  common: 0,
  rare: 0.01,
  epic: 0.02,
  legendary: 0.05,
  mythic: 0.1,
};

export function getStatsForSlot(slot: Slot, category?: StatCategory): StatDefinition[] {
  return STAT_REGISTRY.filter((def) => {
    if (def.deprecated) return false;
    if (def.slots && !def.slots.includes(slot)) return false;
    if (category && def.category !== category) return false;
    return true;
  });
}

export function pickWeightedStatForSlot(
  slot: Slot,
  usedIds: Set<string>,
): StatDefinition | null {
  const pool = getStatsForSlot(slot).filter((d) => !usedIds.has(d.id));
  if (pool.length === 0) return null;

  const weights = SLOT_CATEGORY_WEIGHTS[slot];
  let total = 0;
  const weighted = pool.map((def) => {
    const w = weights[def.category] ?? 1;
    total += w;
    return { def, w };
  });

  let roll = Math.random() * total;
  for (const { def, w } of weighted) {
    roll -= w;
    if (roll <= 0) return def;
  }
  return pool[0];
}

export function rollItemQuality(rarity: Rarity): ItemQuality {
  if (Math.random() < ANCIENT_QUALITY_CHANCE[rarity]) return 'ancient';

  const roll = Math.random();
  if (roll < 0.1) return 'poor';
  if (roll < 0.55) return 'normal';
  if (roll < 0.85) return 'great';
  return 'perfect';
}

export function rollStatValue(
  statId: StatId,
  rarity: Rarity,
  quality: ItemQuality,
  depth: number,
): number {
  const def = STAT_BY_ID[statId];
  if (!def?.rollByRarity) return 1;

  const range = def.rollByRarity[rarity] ?? def.rollByRarity.common ?? { min: 1, max: 3 };
  if (range.max <= 0) return 0;

  const depthBonus = 1 + Math.log10(Math.max(1, depth)) * 0.15;
  const band = QUALITY_ROLL_BAND[quality];
  const t = band.minPct + Math.random() * (band.maxPct - band.minPct);

  let value = range.min + (range.max - range.min) * t;
  value *= depthBonus;

  if (def.hardCap) value = Math.min(value, def.hardCap);
  if (def.isPercent) return Math.max(1, Math.round(value));
  return Math.max(1, Math.round(value));
}

export function rollDefense(slot: Slot, rarity: Rarity, quality: ItemQuality, depth: number): number | undefined {
  if (!ARMOR_SLOTS.includes(slot)) return undefined;

  const baseByRarity: Record<Rarity, number> = {
    common: 2,
    rare: 4,
    epic: 7,
    legendary: 12,
    mythic: 18,
  };

  const base = baseByRarity[rarity] * (1 + Math.log10(Math.max(1, depth)) * 0.2);
  const band = QUALITY_ROLL_BAND[quality];
  const t = band.minPct + Math.random() * (band.maxPct - band.minPct);
  return Math.max(1, Math.round(base * (0.8 + t * 0.8)));
}

export function getStatCategory(statId: StatId): StatCategory {
  return STAT_BY_ID[statId]?.category ?? 'offensive';
}

export function isArmorSlot(slot: Slot): boolean {
  return ARMOR_SLOTS.includes(slot);
}

export function isWeaponSlot(slot: Slot): boolean {
  return WEAPON_SLOTS.includes(slot);
}

export function isJewelrySlot(slot: Slot): boolean {
  return JEWELRY_SLOTS.includes(slot);
}

export const BUILD_AFFIX_LABELS: Record<string, string> = {
  fireball: '+1 Fireball',
  poisonNova: '+1 Poison Nova',
  chainLightning: '+1 Chain Lightning',
  berserk: '+1 Berserk',
};

export const SPECIAL_EFFECT_LABELS: Record<string, string> = {
  critAppliesBurn: 'Critical hits apply Burn',
  immunePoison: 'Immune to Poison',
  immuneBurn: 'Immune to Burn',
  immuneFrost: 'Immune to Frost',
  reviveOncePerRun: 'Revive once per run',
  fireIgnoresArmor: 'Fire damage ignores Armor',
  attackTwiceEveryThirdTurn: 'Attack twice every third turn',
};
