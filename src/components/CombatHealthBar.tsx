import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { getHealthBarColor, getHealthBarSegments } from '../utils/combatHealthBar';

interface CombatHealthBarProps {
  label: string;
  current: number;
  max: number;
  compact?: boolean;
  align?: 'left' | 'right';
}

export function CombatHealthBar({ label, current, max, compact, align = 'left' }: CombatHealthBarProps) {
  const { filled, empty, ratio } = getHealthBarSegments(current, max);
  const barColor = getHealthBarColor(ratio);
  const alignRight = align === 'right';

  return (
    <View style={[styles.container, compact && styles.containerCompact, alignRight && styles.containerRight]}>
      <Text style={[styles.label, alignRight && styles.textRight]}>{label}</Text>
      <Text style={[styles.bar, alignRight && styles.textRight]}>
        <Text style={{ color: barColor }}>{'█'.repeat(filled)}</Text>
        <Text style={{ color: '#1E1E28' }}>{'█'.repeat(empty)}</Text>
      </Text>
      <Text style={[styles.hp, alignRight && styles.textRight]}>
        {current} / {max} HP
      </Text>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  containerCompact: { marginBottom: 0, marginTop: 0 },
  containerRight: { alignItems: 'flex-end' },
  textRight: { textAlign: 'right' },
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
