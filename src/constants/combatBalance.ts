// Tunable combat balance — item affixes are large numbers; combat stats use softened conversion.

export const COMBAT_BALANCE = {
  attackRatingScale: 0.07,
  strengthScale: 0.5,
  defenseFromItemScale: 0.35,
  maxLifeScale: 1.0,
  vitalityHealthMult: 3,
  dexteritySpeedScale: 1.0,
  maxEnhancedDamagePercent: 80,
  maxEnhancedDefensePercent: 45,
  maxSpeedBonusPercent: 40,
} as const;

const EARLY_DEPTH_STATS: Record<
  number,
  { health: number; attack: number; defense: number; speed: number }
> = {
  1: { health: 20, attack: 5, defense: 0, speed: 7 },
  2: { health: 26, attack: 7, defense: 1, speed: 8 },
  3: { health: 34, attack: 9, defense: 2, speed: 9 },
};

export function scaleEnemyStat(depth: number): {
  health: number;
  attack: number;
  defense: number;
  speed: number;
} {
  const d = Math.max(1, depth);

  const early = EARLY_DEPTH_STATS[d];
  if (early) return early;

  // Exponential curve from depth 4+ — tuned so full legendary (D50 gear) pushes past ~D30
  const t = d - 3;
  const health = Math.round(40 + t * 10 + Math.pow(t, 1.48) * 4.8);
  const attack = Math.round(9 + t * 3 + Math.pow(t, 1.4) * 2.7);
  const defense = Math.round(2 + t * 0.9 + Math.pow(t, 1.17) * 1.2);
  const speed = Math.round(9 + t * 0.55 + Math.pow(t, 0.9) * 0.45);

  return { health, attack, defense, speed };
}
