import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { getHealthBarColor, getHealthBarSegments } from '../utils/combatHealthBar';

interface CombatHealthBarProps {
  label: string;
  current: number;
  max: number;
  compact?: boolean;
}

export function CombatHealthBar({ label, current, max, compact }: CombatHealthBarProps) {
  const { filled, empty, ratio } = getHealthBarSegments(current, max);
  const barColor = getHealthBarColor(ratio);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.bar}>
        <Text style={{ color: barColor }}>{'█'.repeat(filled)}</Text>
        <Text style={{ color: '#1E1E28' }}>{'█'.repeat(empty)}</Text>
      </Text>
      <Text style={styles.hp}>
        {current} / {max} HP
      </Text>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  containerCompact: { marginBottom: 10, marginTop: 4 },
  label: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  bar: {
    fontFamily: mono,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },
  hp: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
