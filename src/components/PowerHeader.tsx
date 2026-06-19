import { StyleSheet, Text, View } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import type { CombatStats } from '../types/game';
import { colors } from '../constants/theme';

interface PowerHeaderProps {
  playerName: string;
  selectedDepth: number;
  maxUnlockedDepth: number;
  powerScore: number;
  combatStats: CombatStats;
  arenaRating?: number;
  dust?: number;
}

export function PowerHeader({
  playerName,
  selectedDepth,
  maxUnlockedDepth,
  powerScore,
  combatStats,
  arenaRating,
  dust,
}: PowerHeaderProps) {
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

      <Text style={styles.powerLabel}>Power {powerScore.toLocaleString()}</Text>
      {dust !== undefined && (
        <Text style={styles.dust}>{dust.toLocaleString()} Dust</Text>
      )}
      {arenaRating !== undefined && (
        <Text style={styles.arena}>Arena {arenaRating}</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 20,
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
    fontSize: 13,
    fontWeight: '700',
    color: colors.cta,
    marginTop: 6,
    letterSpacing: 1,
  },
});
