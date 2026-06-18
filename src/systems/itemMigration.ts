import type { StatId } from '../types/game';

const LEGACY_STAT_MAP: Partial<Record<string, StatId>> = {
  attackRating: 'strength',
  enhancedDefense: 'armorPercent',
  enhancedDamage: 'fireDamage',
  maxLife: 'vitality',
  maxStamina: 'vitality',
  maxMana: 'vitality',
  coldResist: 'frostResist',
  fasterHitRecovery: 'attackSpeed',
  magicFind: 'lootRarity',
  manaSteal: 'lifeSteal',
};

export const REMOVED_STAT_IDS = new Set<StatId>([
  'dustFind',
  'experienceGain',
  'lightRadius',
  'bossDamage',
]);

export function migrateLegacyStatId(id: string): StatId {
  return (LEGACY_STAT_MAP[id] ?? id) as StatId;
}

export function clampLegacyStatValue(id: StatId, value: number): number {
  const caps: Partial<Record<StatId, number>> = {
    fireResist: 50,
    frostResist: 50,
    coldResist: 50,
    lightningResist: 50,
    poisonResist: 50,
    bleedResist: 50,
    allResist: 30,
    critChance: 50,
    dodgeChance: 35,
    blockChance: 35,
    lifeSteal: 20,
    armorPercent: 45,
    enhancedDefense: 45,
  };
  const cap = caps[id];
  if (cap !== undefined) return Math.min(cap, Math.max(1, Math.round(value)));
  return Math.max(1, Math.round(value));
}
