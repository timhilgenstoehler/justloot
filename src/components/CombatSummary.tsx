import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { getTopContributors } from '../systems/combatTracker';
import type { CombatResult } from '../types/game';

interface CombatSummaryProps {
  result: CombatResult;
  variant: 'victory' | 'defeat';
  lastDefeatDust?: number | null;
}

export function CombatSummary({ result, variant, lastDefeatDust }: CombatSummaryProps) {
  const isVictory = variant === 'victory';
  const topContributors = getTopContributors(result.contributors);
  const closeCall = !isVictory && result.closeCall;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isVictory ? styles.victoryTitle : styles.defeatTitle]}>
        {isVictory ? 'VICTORY' : 'DEFEATED'}
      </Text>

      {isVictory ? (
        <Text style={styles.subtitle}>You Survived</Text>
      ) : closeCall ? (
        <>
          <Text style={styles.closeCall}>CLOSE CALL</Text>
          <Text style={styles.hint}>
            Enemy survived with {result.closeCall!.enemyRemainingHp} HP.
          </Text>
          <Text style={styles.hint}>One more upgrade could change the outcome.</Text>
        </>
      ) : (
        <>
          <Text style={styles.hint}>You were close.</Text>
          <Text style={styles.hint}>One more upgrade may be enough.</Text>
        </>
      )}

      <View style={styles.divider} />

      <Text style={styles.statLine}>
        {isVictory ? 'Remaining Health:' : 'You:'}
      </Text>
      <Text style={styles.statValue}>
        {result.playerFinalHp} / {result.playerMaxHp}
      </Text>

      <Text style={[styles.statLine, styles.statGap]}>
        {isVictory ? 'Enemy:' : 'Enemy:'}
      </Text>
      <Text style={styles.statValue}>
        {result.enemyFinalHp} / {result.enemyMaxHp}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.statLine}>Damage Dealt:</Text>
      <Text style={styles.statValue}>{result.damageDealt}</Text>

      <Text style={[styles.statLine, styles.statGap]}>Damage Taken:</Text>
      <Text style={styles.statValue}>{result.damageTaken}</Text>

      {!isVictory && lastDefeatDust !== null && lastDefeatDust !== undefined && lastDefeatDust > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.dust}>+{lastDefeatDust} Dust</Text>
        </>
      )}

      {topContributors.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Top Contributors</Text>
          {topContributors.map((entry) => (
            <View key={`${entry.itemName}-${entry.label}`} style={styles.contributor}>
              <Text style={styles.contributorName}>{entry.itemName}</Text>
              <Text style={styles.contributorStat}>
                {entry.amount} {entry.label}
              </Text>
            </View>
          ))}
        </>
      )}

      {result.mvpItem && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Most Valuable Item</Text>
          <Text style={styles.mvpName}>{result.mvpItem.itemName}</Text>
          <Text style={styles.mvpStat}>
            {result.mvpItem.label === 'Dodge' || result.mvpItem.label === 'Block'
              ? `Prevented ${result.mvpItem.amount} Damage`
              : result.mvpItem.label === 'Healing' || result.mvpItem.label === 'Life Steal'
                ? `Healed ${result.mvpItem.amount} Health`
                : `Dealt ${result.mvpItem.amount} ${result.mvpItem.label}`}
          </Text>
        </>
      )}
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: {
    fontFamily: mono,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 8,
  },
  victoryTitle: { color: '#4ADE80' },
  defeatTitle: { color: '#EF4444' },
  subtitle: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  closeCall: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    color: colors.cta,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  hint: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 14,
  },
  statLine: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statGap: { marginTop: 8 },
  statValue: {
    fontFamily: mono,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  dust: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.cta,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  contributor: { marginBottom: 10 },
  contributorName: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  contributorStat: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  mvpName: {
    fontFamily: mono,
    fontSize: 14,
    color: colors.cta,
    fontWeight: '600',
    marginBottom: 4,
  },
  mvpStat: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textMuted,
  },
});
