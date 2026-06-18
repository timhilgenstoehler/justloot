import type { CombatContribution, CombatMvpItem } from '../types/game';

export interface CombatTracker {
  contributions: CombatContribution[];
  damageDealt: number;
  damageTaken: number;
}

export function createCombatTracker(): CombatTracker {
  return { contributions: [], damageDealt: 0, damageTaken: 0 };
}

export function recordContribution(
  tracker: CombatTracker,
  itemName: string,
  label: string,
  amount: number,
): void {
  if (amount <= 0) return;
  const entry = tracker.contributions.find(
    (c) => c.itemName === itemName && c.label === label,
  );
  if (entry) {
    entry.amount += amount;
  } else {
    tracker.contributions.push({ itemName, label, amount });
  }
}

export function recordEnemyDamage(
  tracker: CombatTracker,
  amount: number,
  itemName: string,
  label: string,
): void {
  tracker.damageDealt += amount;
  recordContribution(tracker, itemName, label, amount);
}

export function recordPlayerDamage(tracker: CombatTracker, amount: number): void {
  tracker.damageTaken += amount;
}

export function getTopContributors(
  contributions: CombatContribution[],
  count = 3,
): CombatContribution[] {
  return [...contributions].sort((a, b) => b.amount - a.amount).slice(0, count);
}

export function getMvpItem(contributions: CombatContribution[]): CombatMvpItem | null {
  const top = getTopContributors(contributions, 1);
  return top[0] ?? null;
}
