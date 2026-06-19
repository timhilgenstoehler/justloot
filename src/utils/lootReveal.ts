import { BUILD_AFFIX_LABELS, SPECIAL_EFFECT_LABELS, STAT_BY_ID } from '../constants/statRegistry';
import { SALVAGE_DUST } from '../constants/rarities';
import { rarityLabels } from '../constants/theme';
import type { Item, Rarity } from '../types/game';

export type PowerVerdict = 'upgrade' | 'sidegrade' | 'downgrade';

export function getFlatAffixLines(item: Item): string[] {
  const lines: string[] = [];
  for (const stat of item.stats) {
    lines.push(stat.display);
  }
  if (item.buildAffix) {
    lines.push(BUILD_AFFIX_LABELS[item.buildAffix] ?? item.buildAffix);
  }
  for (const fx of item.specialEffects ?? []) {
    lines.push(SPECIAL_EFFECT_LABELS[fx] ?? fx);
  }
  if (item.defense !== undefined) {
    lines.push(`+${item.defense} Defense`);
  }
  return lines;
}

export function getPowerVerdict(newPower: number, currentPower?: number): PowerVerdict {
  if (currentPower === undefined) return 'upgrade';
  const diff = newPower - currentPower;
  if (diff > 0) return 'upgrade';
  if (diff === 0) return 'sidegrade';
  const threshold = Math.max(5, Math.round(currentPower * 0.05));
  if (diff >= -threshold) return 'sidegrade';
  return 'downgrade';
}

export const POWER_VERDICT_COLORS: Record<PowerVerdict, string> = {
  upgrade: '#4ADE80',
  sidegrade: '#C9A227',
  downgrade: '#6B6B7B',
};

export const POWER_VERDICT_LABELS: Record<PowerVerdict, string> = {
  upgrade: 'UPGRADE',
  sidegrade: 'SIDEGRADE',
  downgrade: 'DOWNGRADE',
};

export function formatLootFeedEntry(
  playerName: string,
  item: Pick<Item, 'name' | 'rarity'>,
  depth: number,
): string | null {
  if (item.rarity !== 'legendary' && item.rarity !== 'mythic') return null;
  return `${playerName} found\n${rarityLabels[item.rarity]}\n${item.name}\nDepth ${depth}`;
}

export function getSalvageDust(item: Pick<Item, 'rarity'>): number {
  return SALVAGE_DUST[item.rarity] ?? SALVAGE_DUST.common;
}

export function isHighRarityReveal(rarity: Rarity): boolean {
  return rarity === 'legendary' || rarity === 'mythic';
}

export function isFullRevealRarity(rarity: Rarity): boolean {
  return rarity === 'epic' || rarity === 'legendary' || rarity === 'mythic';
}
