import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BUILD_AFFIX_LABELS, SPECIAL_EFFECT_LABELS } from '../constants/statRegistry';
import { colors } from '../constants/theme';
import {
  getBlockChance,
  getDodgeChance,
  getExecuteChance,
  getLifeSteal,
  getThornsDamage,
} from '../systems/characterStatsCalculator';
import type {
  BuildCombatState,
  CombatEffect,
  CombatEffectType,
  CombatResists,
  CombatStats,
} from '../types/game';

interface CharacterStatsPanelProps {
  stats: CombatStats;
  effects: CombatEffect[];
  resists: CombatResists;
  build: BuildCombatState;
}

interface StatRow {
  label: string;
  value: string;
  accent?: boolean;
}

function sumEffect(effects: CombatEffect[], type: CombatEffectType): number {
  return effects.filter((e) => e.type === type).reduce((sum, e) => sum + e.value, 0);
}

function buildRows(
  stats: CombatStats,
  effects: CombatEffect[],
  resists: CombatResists,
  build: BuildCombatState,
): StatRow[] {
  const rows: StatRow[] = [
    { label: 'Crit', value: `${stats.critChance}%` },
    { label: 'Crit Dmg', value: `${stats.critDamage}%` },
  ];

  if (stats.attackSpeed > 0) {
    rows.push({ label: 'Atk Speed', value: `${stats.attackSpeed}%` });
  }
  if (stats.healthRegen > 0) {
    rows.push({ label: 'Regen', value: `${stats.healthRegen}` });
  }

  const dodge = getDodgeChance(effects);
  const block = getBlockChance(effects);
  const lifeSteal = getLifeSteal(effects);
  const thorns = getThornsDamage(effects);
  const execute = getExecuteChance(effects);

  if (dodge > 0) rows.push({ label: 'Dodge', value: `${dodge}%`, accent: true });
  if (block > 0) rows.push({ label: 'Block', value: `${block}%`, accent: true });
  if (lifeSteal > 0) rows.push({ label: 'Life Steal', value: `${lifeSteal}%` });
  if (thorns.total > 0) rows.push({ label: 'Thorns', value: `${thorns.total}` });
  if (execute > 0) rows.push({ label: 'Execute', value: `${execute}%` });

  const fireDmg = sumEffect(effects, 'fireDamage');
  const frostDmg = sumEffect(effects, 'frostDamage');
  const lightningDmg = sumEffect(effects, 'lightningDamage');
  const poisonDmg = sumEffect(effects, 'poisonDamage');
  const bleedDmg = sumEffect(effects, 'bleedDamage');

  if (fireDmg > 0) rows.push({ label: 'Fire Dmg', value: `+${fireDmg}%` });
  if (frostDmg > 0) rows.push({ label: 'Frost Dmg', value: `+${frostDmg}%` });
  if (lightningDmg > 0) rows.push({ label: 'Lightning', value: `+${lightningDmg}%` });
  if (poisonDmg > 0) rows.push({ label: 'Poison Dmg', value: `+${poisonDmg}%` });
  if (bleedDmg > 0) rows.push({ label: 'Bleed Dmg', value: `+${bleedDmg}%` });

  if (resists.fire > 0) rows.push({ label: 'Fire Res', value: `${resists.fire}%`, accent: true });
  if (resists.cold > 0) rows.push({ label: 'Frost Res', value: `${resists.cold}%`, accent: true });
  if (resists.lightning > 0) rows.push({ label: 'Lightning Res', value: `${resists.lightning}%`, accent: true });
  if (resists.poison > 0) rows.push({ label: 'Poison Res', value: `${resists.poison}%`, accent: true });
  if (resists.bleed > 0) rows.push({ label: 'Bleed Res', value: `${resists.bleed}%`, accent: true });

  for (const affix of build.buildAffixes) {
    rows.push({
      label: 'Build',
      value: BUILD_AFFIX_LABELS[affix] ?? affix,
      accent: true,
    });
  }
  for (const fx of build.specialEffects) {
    rows.push({
      label: 'Special',
      value: SPECIAL_EFFECT_LABELS[fx] ?? fx,
      accent: true,
    });
  }

  return rows;
}

function StatLine({ label, value, accent }: StatRow) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, accent && styles.valueAccent]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function StatColumn({ rows }: { rows: StatRow[] }) {
  return (
    <>
      {rows.map((row, i) => (
        <View key={`${row.label}-${row.value}-${i}`} style={styles.gridCell}>
          <StatLine {...row} />
        </View>
      ))}
    </>
  );
}

export function CharacterStatsPanel({ stats, effects, resists, build }: CharacterStatsPanelProps) {
  const rows = buildRows(stats, effects, resists, build);
  const mid = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, mid);
  const rightRows = rows.slice(mid);

  return (
    <View style={styles.panel}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <StatColumn rows={leftRows} />
          </View>
          <View style={styles.gridCol}>
            <StatColumn rows={rightRows} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 2,
    minWidth: 0,
    width: '100%',
  },
  heading: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: 2,
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  gridCol: {
    width: '50%',
    flexShrink: 0,
    alignItems: 'center',
  },
  gridCell: {
    marginBottom: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    width: '100%',
  },
  row: {
    gap: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 14,
    textAlign: 'center',
  },
  valueAccent: {
    color: colors.cta,
  },
});
