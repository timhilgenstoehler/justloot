import {
  STAT_BY_ID,
  isArmorSlot,
  rollDefense,
  rollStatValue,
} from '../constants/statRegistry';
import type { Item, StatId } from '../types/game';

export interface AffixRollRow {
  label: string;
  value: number;
  max: number;
  pct: number;
}

export interface AffixQualityReport {
  rows: AffixRollRow[];
  overallPct: number;
  verdict: string;
}

function getStatLabel(id: StatId): string {
  const def = STAT_BY_ID[id];
  if (!def) return id;
  return def
    .format(1)
    .replace(/^\+?\d+%?\s*/, '')
    .replace(/ Per Hit$/, '');
}

function rollPct(value: number, min: number, max: number): number {
  if (max <= min) return 100;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function formatVerdict(pct: number): string {
  const rounded = Math.round(pct);
  if (rounded >= 95) return `${rounded}% Perfect`;
  if (rounded >= 85) return `${rounded}% Great`;
  if (rounded >= 70) return `${rounded}% Good`;
  if (rounded >= 50) return `${rounded}% Fair`;
  return `${rounded}% Poor`;
}

export function computeAffixQuality(item: Item, foundDepth: number): AffixQualityReport {
  const depth = Math.max(1, foundDepth);
  const rows: AffixRollRow[] = [];

  for (const stat of item.stats) {
    const max = rollStatValue(stat.id, item.rarity, item.quality, depth, 1);
    const min = rollStatValue(stat.id, item.rarity, item.quality, depth, 0);
    rows.push({
      label: getStatLabel(stat.id),
      value: stat.value,
      max,
      pct: rollPct(stat.value, min, max),
    });
  }

  if (item.defense !== undefined && isArmorSlot(item.slot)) {
    const max = rollDefense(item.slot, item.rarity, item.quality, depth, 1) ?? 0;
    const min = rollDefense(item.slot, item.rarity, item.quality, depth, 0) ?? 0;
    rows.push({
      label: 'Defense',
      value: item.defense,
      max,
      pct: rollPct(item.defense, min, max),
    });
  }

  const overallPct =
    rows.length > 0 ? rows.reduce((sum, row) => sum + row.pct, 0) / rows.length : 0;

  return {
    rows,
    overallPct,
    verdict: formatVerdict(overallPct),
  };
}
