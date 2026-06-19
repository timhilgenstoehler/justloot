import { scaleEnemyStat } from '../constants/combatBalance';
import { getRarityWeightsAtDepth } from '../constants/rarities';

export interface EnemyCurveRow {
  depth: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface RarityCurveRow {
  depth: number;
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  mythic: number;
}

const CURVE_DEPTHS = [1, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 200, 500, 1000];

export function getEnemyCurveRows(depths = CURVE_DEPTHS): EnemyCurveRow[] {
  return depths.map((depth) => ({
    depth,
    ...scaleEnemyStat(depth),
  }));
}

export function getRarityCurveRows(depths = CURVE_DEPTHS): RarityCurveRow[] {
  return depths.map((depth) => {
    const w = getRarityWeightsAtDepth(depth);
    return {
      depth,
      common: w.common,
      rare: w.rare,
      epic: w.epic,
      legendary: w.legendary,
      mythic: w.mythic,
    };
  });
}

export function formatBalanceCurvesSummary(): string {
  const enemy = getEnemyCurveRows();
  const rarity = getRarityCurveRows();

  const lines: string[] = [
    '=== ENEMY SCALING (combatBalance.ts — why gear falls off) ===',
    'Depth   HP    ATK   DEF   SPD',
  ];

  for (const row of enemy) {
    lines.push(
      `${String(row.depth).padStart(5)}  ${String(row.health).padStart(4)}  ${String(row.attack).padStart(4)}  ${String(row.defense).padStart(4)}  ${String(row.speed).padStart(3)}`,
    );
  }

  lines.push(
    '',
    'Formula (depth 4+): t = depth - 3',
    '  HP  = 40 + t*10 + t^1.48 * 4.8',
    '  ATK = 9 + t*3 + t^1.4 * 2.7',
    '  DEF = 2 + t*0.9 + t^1.17 * 1.2',
    '',
    '=== RARITY DROP RATES (% of drops — rarities.ts) ===',
    'Depth   Com   Rare  Epic  Leg   Myth',
  );

  for (const row of rarity) {
    lines.push(
      `${String(row.depth).padStart(5)}  ${row.common.toFixed(1).padStart(4)}  ${row.rare.toFixed(1).padStart(4)}  ${row.epic.toFixed(1).padStart(4)}  ${row.legendary.toFixed(2).padStart(5)}  ${row.mythic.toFixed(2).padStart(5)}`,
    );
  }

  lines.push(
    '',
    'Legendary/Mythic anchors (lerped):',
    '  D1: 0.2% leg · D50: 1% leg · D100: 2% leg · D500: 5% · D1000: 10%',
    '  Epic/Rare fixed at 8% / 25%; common fills remainder.',
  );

  return lines.join('\n');
}
