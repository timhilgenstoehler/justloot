import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { scaleEnemyStat } from '../constants/combatBalance';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';

interface DepthSelectorProps {
  maxUnlocked: number;
  selectedDepth: number;
  onSelect: (depth: number) => void;
  disabled?: boolean;
}

const CHIP_SIZE = 40;
const CHIP_GAP = 6;
const PHONE_MAX_WIDTH = 430;

export function DepthSelector({
  maxUnlocked,
  selectedDepth,
  onSelect,
  disabled,
}: DepthSelectorProps) {
  const { width: windowWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const depths = Array.from({ length: maxUnlocked }, (_, i) => i + 1);
  const previewStats = scaleEnemyStat(selectedDepth);

  const rowWidth = depths.length * CHIP_SIZE + Math.max(0, depths.length - 1) * CHIP_GAP;
  const viewportWidth = Math.min(windowWidth, PHONE_MAX_WIDTH) - SCREEN_PADDING * 2;

  useEffect(() => {
    const chipOffset = (selectedDepth - 1) * (CHIP_SIZE + CHIP_GAP);
    const centered = chipOffset - viewportWidth / 2 + CHIP_SIZE / 2;
    const maxScroll = Math.max(0, rowWidth - viewportWidth);
    scrollRef.current?.scrollTo({
      x: Math.min(maxScroll, Math.max(0, centered)),
      animated: true,
    });
  }, [selectedDepth, viewportWidth, rowWidth]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Depth</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scroll, { width: viewportWidth }]}
        contentContainerStyle={styles.scrollRow}
        nestedScrollEnabled
      >
        {depths.map((d) => {
          const isSelected = d === selectedDepth;
          return (
            <Pressable
              key={d}
              style={({ pressed }) => [
                styles.chip,
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
        })}
      </ScrollView>
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
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  scroll: {
    flexGrow: 0,
    ...(Platform.OS === 'web' ? { overflowX: 'auto' as const } : null),
  },
  scrollRow: {
    flexDirection: 'row',
    gap: CHIP_GAP,
    paddingHorizontal: 2,
  },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
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
