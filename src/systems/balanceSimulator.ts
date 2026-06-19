import { ALL_SLOTS } from '../constants/slots';
import { calculateCharacterLoadout } from './characterStatsCalculator';
import { calculatePowerScore } from './powerCalculator';
import { simulateCombat } from './combatSimulator';
import { generateEnemy } from './enemyGenerator';
import { generateItem } from './lootGenerator';
import type { Enemy, Item, ItemQuality, Rarity, Slot } from '../types/game';

export type SimGearTier = 'epic' | 'legendary' | 'mythic';

const SIM_TIERS: SimGearTier[] = ['epic', 'legendary', 'mythic'];

export interface GearBuildSpec {
  id: string;
  label: string;
  rarity: Rarity;
  forceQuality?: ItemQuality;
  rollPercentile?: number;
}

export const EPIC_GOD_ROLLS: GearBuildSpec = {
  id: 'epicGod',
  label: 'Epic · God Rolls',
  rarity: 'epic',
  forceQuality: 'perfect',
  rollPercentile: 1,
};

export const LEG_TRASH_ROLLS: GearBuildSpec = {
  id: 'legTrash',
  label: 'Legendary · Trash Rolls',
  rarity: 'legendary',
  forceQuality: 'poor',
  rollPercentile: 0,
};

export interface BalanceSimConfig {
  lootDepth: number;
  maxSimDepth: number;
  gearSamples: number;
  runsPerDepth: number;
}

export interface DepthSimRow {
  depth: number;
  wins: number;
  total: number;
  winRate: number;
  avgHpPctOnWin: number;
  avgRounds: number;
  avgEnemyHpLeftOnLoss: number;
}

export interface ProfileSimResult {
  spec: GearBuildSpec;
  avgPower: number;
  minPower: number;
  maxPower: number;
  rows: DepthSimRow[];
  depthLimit100: number | null;
  depthLimit90: number | null;
  depthLimit50: number | null;
  firstFailDepth: number | null;
}

export interface TierSimResult extends ProfileSimResult {
  tier: SimGearTier;
}

export interface BalanceSimResult {
  config: BalanceSimConfig;
  tiers: TierSimResult[];
  totalCombats: number;
  durationMs: number;
}

export interface RollCompareDepthRow {
  depth: number;
  epicGodWinRate: number;
  legTrashWinRate: number;
  epicAhead: boolean;
  epicGodWins: number;
  legTrashWins: number;
  bothLose: number;
}

export interface RollCompareResult {
  config: BalanceSimConfig;
  epicGod: ProfileSimResult;
  legTrash: ProfileSimResult;
  pairedRows: RollCompareDepthRow[];
  crossoverDepth: number | null;
  epicAheadDepths: number;
  maxEpicAdvantage: number;
  verdict: string;
  totalCombats: number;
  durationMs: number;
}

function generateFullSet(spec: GearBuildSpec, lootDepth: number): Partial<Record<Slot, Item>> {
  const equipment: Partial<Record<Slot, Item>> = {};
  for (const slot of ALL_SLOTS) {
    equipment[slot] = generateItem(0, {
      depth: lootDepth,
      forceSlot: slot,
      forceRarity: spec.rarity,
      forceQuality: spec.forceQuality,
      rollPercentile: spec.rollPercentile,
    });
  }
  return equipment;
}

function findHighestDepthAtWinRate(rows: DepthSimRow[], threshold: number): number | null {
  let best: number | null = null;
  for (const row of rows) {
    if (row.winRate >= threshold) best = row.depth;
  }
  return best;
}

function findFirstFailDepth(rows: DepthSimRow[]): number | null {
  for (const row of rows) {
    if (row.winRate < 1) return row.depth;
  }
  return null;
}

function simulateProfile(
  spec: GearBuildSpec,
  config: BalanceSimConfig,
): ProfileSimResult {
  const samples: Partial<Record<Slot, Item>>[] = [];
  const powers: number[] = [];

  for (let g = 0; g < config.gearSamples; g++) {
    const equipment = generateFullSet(spec, config.lootDepth);
    samples.push(equipment);
    powers.push(calculatePowerScore(equipment));
  }

  const rows: DepthSimRow[] = [];

  for (let depth = 1; depth <= config.maxSimDepth; depth++) {
    let wins = 0;
    let hpPctSum = 0;
    let roundsSum = 0;
    let lossEnemyHpPctSum = 0;
    let lossCount = 0;
    const total = config.runsPerDepth;

    for (let run = 0; run < total; run++) {
      const equipment = samples[run % samples.length];
      const loadout = calculateCharacterLoadout(equipment);
      const weaponName = equipment.weapon?.name ?? 'Your Strikes';
      const enemy = generateEnemy(depth);
      const result = simulateCombat(loadout, enemy, { depth, weaponName });

      roundsSum += result.rounds;
      if (result.victory) {
        wins += 1;
        hpPctSum += result.playerFinalHp / Math.max(1, result.playerMaxHp);
      } else {
        lossCount += 1;
        lossEnemyHpPctSum += result.enemyFinalHp / Math.max(1, result.enemyMaxHp);
      }
    }

    rows.push({
      depth,
      wins,
      total,
      winRate: wins / total,
      avgHpPctOnWin: wins > 0 ? hpPctSum / wins : 0,
      avgRounds: roundsSum / total,
      avgEnemyHpLeftOnLoss: lossCount > 0 ? lossEnemyHpPctSum / lossCount : 0,
    });
  }

  const powerTotal = powers.reduce((sum, p) => sum + p, 0);

  return {
    spec,
    avgPower: powerTotal / powers.length,
    minPower: Math.min(...powers),
    maxPower: Math.max(...powers),
    rows,
    depthLimit100: findHighestDepthAtWinRate(rows, 1),
    depthLimit90: findHighestDepthAtWinRate(rows, 0.9),
    depthLimit50: findHighestDepthAtWinRate(rows, 0.5),
    firstFailDepth: findFirstFailDepth(rows),
  };
}

function cloneEnemy(enemy: Enemy): Enemy {
  return { ...enemy };
}

function runPairedCombats(
  epicSamples: Partial<Record<Slot, Item>>[],
  legSamples: Partial<Record<Slot, Item>>[],
  depth: number,
  runs: number,
): Omit<RollCompareDepthRow, 'depth' | 'epicGodWinRate' | 'legTrashWinRate' | 'epicAhead'> {
  let epicGodWins = 0;
  let legTrashWins = 0;
  let bothLose = 0;

  for (let run = 0; run < runs; run++) {
    const epicEq = epicSamples[run % epicSamples.length];
    const legEq = legSamples[run % legSamples.length];
    const epicLoadout = calculateCharacterLoadout(epicEq);
    const legLoadout = calculateCharacterLoadout(legEq);
    const epicWeapon = epicEq.weapon?.name ?? 'Your Strikes';
    const legWeapon = legEq.weapon?.name ?? 'Your Strikes';

    const enemyTemplate = generateEnemy(depth);
    const epicResult = simulateCombat(epicLoadout, cloneEnemy(enemyTemplate), {
      depth,
      weaponName: epicWeapon,
    });
    const legResult = simulateCombat(legLoadout, cloneEnemy(enemyTemplate), {
      depth,
      weaponName: legWeapon,
    });

    if (epicResult.victory && !legResult.victory) epicGodWins += 1;
    else if (legResult.victory && !epicResult.victory) legTrashWins += 1;
    else if (!epicResult.victory && !legResult.victory) bothLose += 1;
  }

  return { epicGodWins, legTrashWins, bothLose };
}

function buildRollCompareVerdict(
  epicGod: ProfileSimResult,
  legTrash: ProfileSimResult,
  crossoverDepth: number | null,
  epicAheadDepths: number,
  maxDepth: number,
): string {
  if (crossoverDepth !== null) {
    return `Gold — Epic god rolls overtake trash legendaries from depth ${crossoverDepth}. Players should inspect affixes, not just color.`;
  }

  if (epicAheadDepths > 0) {
    return `Partial — Epic god wins at ${epicAheadDepths}/${maxDepth} depths but never pulls ahead overall. Tune roll spread or affix counts.`;
  }

  if (epicGod.avgPower >= legTrash.avgPower) {
    return `Weak — Epic god has higher power (${Math.round(epicGod.avgPower)} vs ${Math.round(legTrash.avgPower)}) but loses every depth. Combat scaling may dwarf item stats.`;
  }

  return `Rarity wins — Trash legendaries dominate at all depths. Players will only chase orange text.`;
}

export function runBalanceSimulation(config: BalanceSimConfig): BalanceSimResult {
  const start = Date.now();
  const tiers = SIM_TIERS.map((tier) => {
    const result = simulateProfile({ id: tier, label: tier, rarity: tier }, config);
    return { ...result, tier };
  });
  const totalCombats = config.maxSimDepth * config.runsPerDepth * SIM_TIERS.length;

  return {
    config,
    tiers,
    totalCombats,
    durationMs: Date.now() - start,
  };
}

export function runRollCompareSimulation(config: BalanceSimConfig): RollCompareResult {
  const start = Date.now();
  const epicGod = simulateProfile(EPIC_GOD_ROLLS, config);
  const legTrash = simulateProfile(LEG_TRASH_ROLLS, config);

  const epicSamples: Partial<Record<Slot, Item>>[] = [];
  const legSamples: Partial<Record<Slot, Item>>[] = [];
  for (let g = 0; g < config.gearSamples; g++) {
    epicSamples.push(generateFullSet(EPIC_GOD_ROLLS, config.lootDepth));
    legSamples.push(generateFullSet(LEG_TRASH_ROLLS, config.lootDepth));
  }

  const pairedRows: RollCompareDepthRow[] = [];
  let crossoverDepth: number | null = null;
  let epicAheadDepths = 0;
  let maxEpicAdvantage = -1;

  for (let depth = 1; depth <= config.maxSimDepth; depth++) {
    const epicRow = epicGod.rows.find((r) => r.depth === depth)!;
    const legRow = legTrash.rows.find((r) => r.depth === depth)!;
    const epicAhead = epicRow.winRate > legRow.winRate;
    const advantage = epicRow.winRate - legRow.winRate;

    if (epicAhead) {
      epicAheadDepths += 1;
      if (crossoverDepth === null) crossoverDepth = depth;
    }
    if (advantage > maxEpicAdvantage) maxEpicAdvantage = advantage;

    const paired = runPairedCombats(epicSamples, legSamples, depth, config.runsPerDepth);

    pairedRows.push({
      depth,
      epicGodWinRate: epicRow.winRate,
      legTrashWinRate: legRow.winRate,
      epicAhead,
      ...paired,
    });
  }

  const soloCombats = config.maxSimDepth * config.runsPerDepth * 2;
  const pairedCombats = config.maxSimDepth * config.runsPerDepth;
  const totalCombats = soloCombats + pairedCombats;

  const verdict = buildRollCompareVerdict(
    epicGod,
    legTrash,
    crossoverDepth,
    epicAheadDepths,
    config.maxSimDepth,
  );

  return {
    config,
    epicGod,
    legTrash,
    pairedRows,
    crossoverDepth,
    epicAheadDepths,
    maxEpicAdvantage,
    verdict,
    totalCombats,
    durationMs: Date.now() - start,
  };
}

export function formatBalanceSimSummary(result: BalanceSimResult): string {
  const { config, tiers, totalCombats, durationMs } = result;
  const lines: string[] = [
    `Balance simulation (${totalCombats.toLocaleString()} combats, ${durationMs}ms)`,
    `Gear rolled at depth ${config.lootDepth} · ${config.gearSamples} sets/tier · ${config.runsPerDepth} runs/depth`,
    '',
    'Tier       Power(avg)   100%   90%   50%   1st fail',
  ];

  for (const t of tiers) {
    const fmt = (n: number | null) => (n === null ? '—' : String(n));
    lines.push(
      `${t.tier.padEnd(10)} ${Math.round(t.avgPower).toString().padStart(8)}   ${fmt(t.depthLimit100).padStart(4)}  ${fmt(t.depthLimit90).padStart(4)}  ${fmt(t.depthLimit50).padStart(4)}   ${fmt(t.firstFailDepth).padStart(4)}`,
    );
  }

  lines.push('', 'Win rate by depth (every 5):');
  const depths = tiers[0]?.rows.filter((r) => r.depth % 5 === 0 || r.depth === 1) ?? [];

  for (const row of depths) {
    const cells = tiers.map((t) => {
      const d = t.rows.find((r) => r.depth === row.depth);
      return d ? `${Math.round(d.winRate * 100)}%` : '—';
    });
    lines.push(`D${String(row.depth).padStart(3)}  epic ${cells[0]}  leg ${cells[1]}  myth ${cells[2]}`);
  }

  return lines.join('\n');
}

export function formatRollCompareSummary(result: RollCompareResult): string {
  const { config, epicGod, legTrash, crossoverDepth, epicAheadDepths, maxEpicAdvantage, verdict, totalCombats, durationMs } =
    result;

  const lines: string[] = [
    `Roll compare (${totalCombats.toLocaleString()} combats, ${durationMs}ms)`,
    `Gear at depth ${config.lootDepth} · ${config.gearSamples} sets · ${config.runsPerDepth} runs/depth`,
    '',
    verdict,
    '',
    `Epic God: power ${Math.round(epicGod.avgPower)} (${epicGod.minPower}–${epicGod.maxPower}) · 100% to D${epicGod.depthLimit100 ?? '—'} · 90% to D${epicGod.depthLimit90 ?? '—'}`,
    `Leg Trash: power ${Math.round(legTrash.avgPower)} (${legTrash.minPower}–${legTrash.maxPower}) · 100% to D${legTrash.depthLimit100 ?? '—'} · 90% to D${legTrash.depthLimit90 ?? '—'}`,
    '',
    `Crossover: ${crossoverDepth ?? 'never'} · Epic ahead at ${epicAheadDepths}/${config.maxSimDepth} depths · Max win-rate gap: ${Math.round(maxEpicAdvantage * 100)}%`,
    '',
    'Depth   Epic%  Leg%   Epic wins paired',
  ];

  for (const row of result.pairedRows.filter((r) => r.depth % 5 === 0 || r.depth === 1 || r.epicAhead)) {
    lines.push(
      `D${String(row.depth).padStart(3)}  ${String(Math.round(row.epicGodWinRate * 100)).padStart(4)}%  ${String(Math.round(row.legTrashWinRate * 100)).padStart(4)}%  ${row.epicGodWins}/${row.epicGodWins + row.legTrashWins + row.bothLose} head-to-head`,
    );
  }

  return lines.join('\n');
}
