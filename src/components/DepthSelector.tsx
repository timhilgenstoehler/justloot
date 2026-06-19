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
const ARROW_WIDTH = 32;

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
  const scrollWidth = Math.max(0, viewportWidth - ARROW_WIDTH * 2 - 8);
  const canGoPrev = selectedDepth > 1;
  const canGoNext = selectedDepth < maxUnlocked;

  useEffect(() => {
    const chipOffset = (selectedDepth - 1) * (CHIP_SIZE + CHIP_GAP);
    const centered = chipOffset - scrollWidth / 2 + CHIP_SIZE / 2;
    const maxScroll = Math.max(0, rowWidth - scrollWidth);
    scrollRef.current?.scrollTo({
      x: Math.min(maxScroll, Math.max(0, centered)),
      animated: true,
    });
  }, [selectedDepth, scrollWidth, rowWidth]);

  const stepDepth = (delta: number) => {
    const next = Math.min(maxUnlocked, Math.max(1, selectedDepth + delta));
    if (next !== selectedDepth) onSelect(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Depth</Text>
      <View style={[styles.row, { width: viewportWidth }]}>
        <Pressable
          style={({ pressed }) => [
            styles.arrow,
            !canGoPrev && styles.arrowDisabled,
            pressed && canGoPrev && !disabled && styles.arrowPressed,
          ]}
          onPress={() => stepDepth(-1)}
          disabled={disabled || !canGoPrev}
          hitSlop={8}
          accessibilityLabel="Previous depth"
        >
          <Text style={[styles.arrowText, !canGoPrev && styles.arrowTextDisabled]}>‹</Text>
        </Pressable>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === 'web'}
          style={[styles.scroll, { width: scrollWidth }]}
          contentContainerStyle={[styles.scrollRow, { width: rowWidth }]}
          nestedScrollEnabled
          scrollEventThrottle={16}
          decelerationRate="fast"
          {...(Platform.OS === 'web' ? { dataSet: { horizontalScroll: 'true' } } : {})}
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
                delayPressIn={100}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{d}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.arrow,
            !canGoNext && styles.arrowDisabled,
            pressed && canGoNext && !disabled && styles.arrowPressed,
          ]}
          onPress={() => stepDepth(1)}
          disabled={disabled || !canGoNext}
          hitSlop={8}
          accessibilityLabel="Next depth"
        >
          <Text style={[styles.arrowText, !canGoNext && styles.arrowTextDisabled]}>›</Text>
        </Pressable>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    width: ARROW_WIDTH,
    height: CHIP_SIZE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#14141A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  arrowPressed: {
    opacity: 0.8,
    backgroundColor: '#1A1810',
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.cta,
    lineHeight: 24,
    marginTop: -2,
  },
  arrowTextDisabled: {
    color: colors.textMuted,
  },
  scroll: {
    flexGrow: 0,
    ...(Platform.OS === 'web'
      ? {
          overflowX: 'scroll' as const,
          touchAction: 'pan-x' as const,
          WebkitOverflowScrolling: 'touch' as const,
        }
      : null),
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
