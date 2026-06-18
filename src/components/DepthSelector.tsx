import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { scaleEnemyStat } from '../constants/combatBalance';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';

interface DepthSelectorProps {
  maxUnlocked: number;
  selectedDepth: number;
  onSelect: (depth: number) => void;
  disabled?: boolean;
}

const CHIP_GAP = 6;
const MAX_CHIP = 42;
const MIN_CHIP = 32;

function getChipLayout(screenWidth: number, count: number) {
  const available = screenWidth - SCREEN_PADDING * 2;
  const fitSize =
    count > 0
      ? Math.floor((available - CHIP_GAP * (count - 1)) / count)
      : MAX_CHIP;
  const chipSize = Math.min(MAX_CHIP, Math.max(MIN_CHIP, fitSize));
  const totalWidth = count * chipSize + Math.max(0, count - 1) * CHIP_GAP;
  const needsScroll = totalWidth > available;

  return { chipSize, needsScroll };
}

export function DepthSelector({
  maxUnlocked,
  selectedDepth,
  onSelect,
  disabled,
}: DepthSelectorProps) {
  const { width: screenWidth } = useWindowDimensions();
  const depths = Array.from({ length: maxUnlocked }, (_, i) => i + 1);
  const previewStats = scaleEnemyStat(selectedDepth);
  const { chipSize, needsScroll } = getChipLayout(screenWidth, depths.length);

  const chips = depths.map((d) => {
    const isSelected = d === selectedDepth;
    return (
      <Pressable
        key={d}
        style={({ pressed }) => [
          styles.chip,
          { width: chipSize, height: chipSize },
          isSelected && styles.chipSelected,
          pressed && !disabled && styles.chipPressed,
          disabled && styles.chipDisabled,
        ]}
        onPress={() => onSelect(d)}
        disabled={disabled}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{d}</Text>
      </Pressable>
    );
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Depth</Text>
      {needsScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.row}>{chips}</View>
      )}
      <Text style={styles.preview} numberOfLines={2}>
        Enemy preview — HP {previewStats.health} · ATK {previewStats.attack}
      </Text>
      {maxUnlocked > 1 && (
        <Text style={styles.unlocked}>{maxUnlocked} depths unlocked</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingHorizontal: SCREEN_PADDING,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: CHIP_GAP,
  },
  scrollRow: {
    flexDirection: 'row',
    gap: CHIP_GAP,
    paddingHorizontal: 2,
  },
  chip: {
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#2A2A35',
    backgroundColor: '#14141A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.cta,
    backgroundColor: '#1A1810',
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.cta,
  },
  preview: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 4,
  },
  unlocked: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
