import type { BuildCombatState, CombatEffect, CombatEffectType, CombatResists, CombatStats } from '../types/game';
import {
  getBlockChance,
  getDodgeChance,
  getExecuteChance,
  getLifeSteal,
  getThornsDamage,
} from './characterStatsCalculator';

const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fire',
  frost: 'Frost',
  lightning: 'Lightning',
  poison: 'Poison',
  bleed: 'Bleed',
};

function sumEffect(effects: CombatEffect[], type: CombatEffectType): number {
  return effects.filter((e) => e.type === type).reduce((sum, e) => sum + e.value, 0);
}

function pickBestElement(scores: Record<string, number>, min = 15): string | null {
  const elements = ['fire', 'frost', 'lightning', 'poison', 'bleed'] as const;
  let best: string | null = null;
  let bestScore = min;
  for (const key of elements) {
    if (scores[key] > bestScore) {
      bestScore = scores[key];
      best = key;
    }
  }
  return best;
}

/** Auto-generated build identity from equipped gear (e.g. "CRIT FROST BUILD", "THORNS TANK"). */
export function generateBuildArchetype(
  stats: CombatStats,
  effects: CombatEffect[],
  resists: CombatResists,
  build: BuildCombatState,
): string {
  const fire = sumEffect(effects, 'fireDamage');
  const frost = sumEffect(effects, 'frostDamage');
  const lightning = sumEffect(effects, 'lightningDamage');
  const poison = sumEffect(effects, 'poisonDamage');
  const bleed = sumEffect(effects, 'bleedDamage');
  const execute = getExecuteChance(effects);
  const lifeSteal = getLifeSteal(effects);
  const thorns = getThornsDamage(effects).total;
  const dodge = getDodgeChance(effects);
  const block = getBlockChance(effects);

  const critScore = stats.critChance * 1.4 + Math.max(0, stats.critDamage - 150) / 3;
  const tankScore = dodge + block + thorns * 0.9 + stats.healthRegen * 1.5 + stats.defense * 0.12;

  const elementScores = { fire, frost, lightning, poison, bleed };
  const element = pickBestElement(elementScores, 12);

  const critStrong = critScore >= 28 || stats.critChance >= 40;
  const executeStrong = execute >= 7;
  const thornsStrong = thorns >= 12;
  const tankStrong = tankScore >= 228;
  const lifeStealStrong = lifeSteal >= 8;

  if (build.buildAffixes.includes('berserk') && (critStrong || tankStrong)) {
    return 'BERSERKER';
  }

  if (element && executeStrong) {
    return `${ELEMENT_LABELS[element]} Execute`.toUpperCase();
  }

  if (critStrong && element) {
    return `CRIT ${ELEMENT_LABELS[element]} BUILD`;
  }

  if (critStrong && executeStrong) {
    return 'CRIT EXECUTE';
  }

  if (lifeStealStrong && element) {
    return `${ELEMENT_LABELS[element]} VAMPIRE`;
  }

  if (element && elementScores[element as keyof typeof elementScores] >= 28) {
    return `${ELEMENT_LABELS[element]} Slayer`.toUpperCase();
  }

  if (critStrong) return 'CRIT BUILD';
  if (executeStrong) return 'EXECUTIONER';
  if (thornsStrong) return 'THORNS WARDEN';
  if (lifeStealStrong) return 'BLOOD DRINKER';

  const resistTotal = resists.fire + resists.cold + resists.lightning + resists.poison + resists.bleed;
  if (resistTotal >= 180) return 'ELEMENTAL BULWARK';

  if (build.buildAffixes.includes('fireball')) return 'FIRE MAGE';
  if (build.buildAffixes.includes('poisonNova')) return 'POISON CULTIST';
  if (build.buildAffixes.includes('chainLightning')) return 'STORM CALLER';

  return 'DUNGEON DELVER';
}
