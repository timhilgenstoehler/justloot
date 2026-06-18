import { StyleSheet, Text, View } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import type { CombatEffect, CombatResists, CombatStats } from '../types/game';
import { colors } from '../constants/theme';
import { getBlockChance, getDodgeChance } from '../systems/characterStatsCalculator';

interface PowerHeaderProps {
  playerName: string;
  selectedDepth: number;
  maxUnlockedDepth: number;
  powerScore: number;
  combatStats: CombatStats;
  combatEffects?: CombatEffect[];
  combatResists?: CombatResists;
  arenaRating?: number;
  dust?: number;
}

function formatBonuses(effects: CombatEffect[], resists: CombatResists): string | null {
  const parts: string[] = [];
  const dodge = getDodgeChance(effects);
  const block = getBlockChance(effects);

  if (dodge > 0) parts.push(`Dodge ${dodge}%`);
  if (block > 0) parts.push(`Block ${block}%`);
  if (resists.poison > 0) parts.push(`Poison ${resists.poison}%`);
  if (resists.fire > 0) parts.push(`Fire ${resists.fire}%`);
  if (resists.cold > 0) parts.push(`Frost ${resists.cold}%`);

  return parts.length > 0 ? parts.join(' · ') : null;
}

export function PowerHeader({
  playerName,
  selectedDepth,
  maxUnlockedDepth,
  powerScore,
  combatStats,
  combatEffects = [],
  combatResists = { fire: 0, cold: 0, lightning: 0, poison: 0, bleed: 0 },
  arenaRating,
  dust,
}: PowerHeaderProps) {
  const bonuses = formatBonuses(combatEffects, combatResists);

  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{playerName}</Text>
      <Text style={styles.depth}>Depth {selectedDepth}</Text>
      {maxUnlockedDepth > selectedDepth && (
        <Text style={styles.unlocked}>Unlocked to {maxUnlockedDepth}</Text>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Health</Text>
          <Text style={styles.statValue}>{combatStats.health}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Attack</Text>
          <Text style={styles.statValue}>{combatStats.attack}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Defense</Text>
          <Text style={styles.statValue}>{combatStats.defense}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Speed</Text>
          <Text style={styles.statValue}>{combatStats.speed}</Text>
        </View>
      </View>

      <Text style={styles.secondary} numberOfLines={2}>
        Crit {combatStats.critChance}% · Crit Dmg {combatStats.critDamage}%
        {combatStats.healthRegen > 0 ? ` · Regen ${combatStats.healthRegen}` : ''}
      </Text>
      {bonuses && (
        <Text style={styles.bonuses} numberOfLines={2}>
          {bonuses}
        </Text>
      )}

      <Text style={styles.powerLabel}>Power {powerScore.toLocaleString()}</Text>
      {arenaRating !== undefined && (
        <Text style={styles.arena}>Arena {arenaRating}</Text>
      )}
      {dust !== undefined && dust > 0 && (
        <Text style={styles.dust}>{dust.toLocaleString()} Dust</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: SCREEN_PADDING,
  },
  playerName: {
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  depth: {
    fontSize: 12,
    color: colors.cta,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  unlocked: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 4,
    width: '100%',
    maxWidth: 360,
  },
  statCol: {
    alignItems: 'center',
    minWidth: 56,
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  secondary: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  bonuses: {
    fontSize: 10,
    color: colors.cta,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
  },
  powerLabel: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  arena: {
    fontSize: 11,
    color: colors.cta,
    marginTop: 4,
    letterSpacing: 1,
  },
  dust: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
});
