import { StyleSheet, Text, View } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';

export interface StatRowItem {
  label: string;
  value: string | number;
}

interface StatsRowProps {
  items: StatRowItem[];
}

export function StatsRow({ items }: StatsRowProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.statCol}>
          <Text style={styles.statLabel}>{item.label}</Text>
          <Text style={styles.statValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 6,
    width: '100%',
    marginTop: 32
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
});
