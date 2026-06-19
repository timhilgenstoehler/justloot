import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import {
  formatBalanceCurvesSummary,
  getEnemyCurveRows,
  getRarityCurveRows,
} from '../utils/balanceCurves';

interface BalanceCurvesPanelProps {
  highlightDepth?: number;
}

export function BalanceCurvesPanel({ highlightDepth }: BalanceCurvesPanelProps) {
  const enemyRows = getEnemyCurveRows();
  const rarityRows = getRarityCurveRows();

  useEffect(() => {
    console.log(formatBalanceCurvesSummary());
  }, []);

  const logCurves = () => {
    console.log(formatBalanceCurvesSummary());
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Balance Curves</Text>
        <Pressable onPress={logCurves}>
          <Text style={styles.logBtn}>Log to console</Text>
        </Pressable>
      </View>

      <Text style={styles.note}>
        Legendary failing ~D30 is usually enemy scaling (left), not drop rates (right).
      </Text>

      <Text style={styles.section}>Enemy scaling · combatBalance.ts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.depthCol]}>D</Text>
            <Text style={styles.th}>HP</Text>
            <Text style={styles.th}>ATK</Text>
            <Text style={styles.th}>DEF</Text>
            <Text style={styles.th}>SPD</Text>
          </View>
          {enemyRows.map((row) => {
            const hot = highlightDepth !== undefined && row.depth === highlightDepth;
            return (
              <View key={row.depth} style={[styles.tableRow, hot && styles.hotRow]}>
                <Text style={[styles.td, styles.depthCol, hot && styles.hotText]}>{row.depth}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.health}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.attack}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.defense}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.speed}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.formula}>
        D4+: HP = 40 + t·10 + t^1.48·4.8 · ATK = 9 + t·3 + t^1.4·2.7
      </Text>

      <Text style={styles.section}>Rarity drops · rarities.ts (%)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.depthCol]}>D</Text>
            <Text style={styles.th}>Com</Text>
            <Text style={styles.th}>Rare</Text>
            <Text style={styles.th}>Epic</Text>
            <Text style={[styles.th, styles.legCol]}>Leg</Text>
            <Text style={styles.th}>Myth</Text>
          </View>
          {rarityRows.map((row) => {
            const hot = highlightDepth !== undefined && row.depth === highlightDepth;
            return (
              <View key={row.depth} style={[styles.tableRow, hot && styles.hotRow]}>
                <Text style={[styles.td, styles.depthCol, hot && styles.hotText]}>{row.depth}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.common.toFixed(0)}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.rare.toFixed(0)}</Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.epic.toFixed(0)}</Text>
                <Text style={[styles.td, styles.legCol, hot && styles.hotText]}>
                  {row.legendary.toFixed(2)}
                </Text>
                <Text style={[styles.td, hot && styles.hotText]}>{row.mythic.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Text style={styles.formula}>
        Leg/Myth lerp: D1 0.2/0 → D50 1/0.05 → D100 2/0.1 → D500 5/0.5 → D1000 10/1
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cta,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  logBtn: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  note: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginBottom: 10,
  },
  section: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#121218',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  hotRow: {
    backgroundColor: '#1A1810',
  },
  th: {
    width: 44,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'right',
  },
  td: {
    width: 44,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  depthCol: {
    width: 36,
    textAlign: 'left',
  },
  legCol: {
    width: 48,
  },
  hotText: {
    color: colors.cta,
  },
  formula: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 13,
  },
});
