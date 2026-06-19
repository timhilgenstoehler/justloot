import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { computeAffixQuality } from '../utils/affixQuality';
import type { Item } from '../types/game';

interface ItemAffixQualityPanelProps {
  item: Item;
  foundDepth: number;
}

function verdictColor(verdict: string): string {
  if (verdict.includes('Perfect')) return '#4ADE80';
  if (verdict.includes('Great')) return '#84CC16';
  if (verdict.includes('Good')) return '#F59E0B';
  if (verdict.includes('Fair')) return '#FB923C';
  return '#EF4444';
}

export function ItemAffixQualityPanel({ item, foundDepth }: ItemAffixQualityPanelProps) {
  const report = computeAffixQuality(item, foundDepth);

  if (report.rows.length === 0) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Affix Quality</Text>
      {report.rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.values}>
            {row.value} / {row.max}
          </Text>
        </View>
      ))}
      <View style={styles.divider} />
      <Text style={[styles.verdict, { color: verdictColor(report.verdict) }]}>
        {report.verdict}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#121218',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  heading: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  values: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 10,
  },
  verdict: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
