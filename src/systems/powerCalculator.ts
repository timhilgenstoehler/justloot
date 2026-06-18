import { QUALITY_POWER_MULTIPLIERS, RARITY_POWER_MULTIPLIERS } from '../constants/rarities';
import { STAT_BY_ID, BUILD_AFFIX_LABELS, SPECIAL_EFFECT_LABELS } from '../constants/statRegistry';
import type { Item, SecondaryStat } from '../types/game';

export function calculateStatPower(stat: SecondaryStat): number {
  const def = STAT_BY_ID[stat.id];
  if (!def) return 0;
  return Math.round(stat.value * def.powerPerPoint);
}

export function calculateItemPower(
  item: Pick<Item, 'stats' | 'defense' | 'power' | 'rarity' | 'quality' | 'buildAffix' | 'specialEffects'>,
): number {
  if (!item.stats || item.stats.length === 0) {
    return item.power ?? 0;
  }

  const statPower = item.stats.reduce((sum, stat) => sum + calculateStatPower(stat), 0);
  const defensePower = item.defense ? Math.round(item.defense * 0.8) : 0;
  const buildBonus = item.buildAffix ? 25 : 0;
  const specialBonus = (item.specialEffects?.length ?? 0) * 15;

  const rarityMult = RARITY_POWER_MULTIPLIERS[item.rarity] ?? 1;
  const qualityMult = QUALITY_POWER_MULTIPLIERS[item.quality] ?? 1;

  return Math.round((statPower + defensePower + buildBonus + specialBonus) * rarityMult * qualityMult);
}

export function calculatePowerScore(
  equipment: Partial<Record<string, Item>>,
): number {
  return Object.values(equipment).reduce(
    (sum, item) => sum + (item ? calculateItemPower(item) : 0),
    0,
  );
}

export function sumEquippedLootBonuses(
  equipment: Partial<Record<string, Item>>,
): { lootQuality: number; lootRarity: number; arenaRatingGain: number } {
  let lootQuality = 0;
  let lootRarity = 0;
  let arenaRatingGain = 0;

  for (const item of Object.values(equipment)) {
    if (!item) continue;
    for (const stat of item.stats) {
      if (stat.id === 'lootQuality') lootQuality += stat.value;
      if (stat.id === 'lootRarity') lootRarity += stat.value;
      if (stat.id === 'arenaRatingGain') arenaRatingGain += stat.value;
    }
  }

  return { lootQuality, lootRarity, arenaRatingGain };
}

export function getAffixDisplayLines(item: Item): { category: string; lines: string[] }[] {
  const groups: Record<string, string[]> = {
    Primary: [],
    Offensive: [],
    Defensive: [],
    Utility: [],
    Build: [],
    Special: [],
  };

  for (const stat of item.stats) {
    const def = STAT_BY_ID[stat.id];
    const cat = def?.category ?? 'offensive';
    const key =
      cat === 'primary' ? 'Primary' :
      cat === 'defensive' ? 'Defensive' :
      cat === 'utility' ? 'Utility' : 'Offensive';
    groups[key].push(stat.display);
  }

  if (item.buildAffix) groups.Build.push(BUILD_AFFIX_LABELS[item.buildAffix] ?? item.buildAffix);
  for (const fx of item.specialEffects ?? []) {
    groups.Special.push(SPECIAL_EFFECT_LABELS[fx] ?? fx);
  }

  return Object.entries(groups)
    .filter(([, lines]) => lines.length > 0)
    .map(([category, lines]) => ({ category, lines }));
}
