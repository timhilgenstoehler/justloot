import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, rarityColors, rarityLabels } from '../constants/theme';
import type { Item } from '../types/game';
import {
  POWER_VERDICT_COLORS,
  POWER_VERDICT_LABELS,
  getFlatAffixLines,
  getPowerVerdict,
  isHighRarityReveal,
  isFullRevealRarity,
} from '../utils/lootReveal';

export type RevealStep =
  | 'locked'
  | 'announce'
  | 'rarity'
  | 'name'
  | 'affix'
  | 'power'
  | 'full'
  | 'collection';

interface CollectionStats {
  itemsFound: number;
  legendariesFound: number;
  mythicsFound: number;
}

interface ItemRevealProps {
  item: Item;
  equippedItem?: Item;
  collectionStats: CollectionStats;
  isFirstMythic?: boolean;
  onRevealComplete?: () => void;
}

export function ItemReveal({
  item,
  equippedItem,
  collectionStats,
  isFirstMythic,
  onRevealComplete,
}: ItemRevealProps) {
  const affixes = useMemo(() => getFlatAffixLines(item), [item]);
  const hasAnnounce = isHighRarityReveal(item.rarity);
  const isFullReveal = isFullRevealRarity(item.rarity);
  const nameColor = rarityColors[item.rarity];
  const verdict = getPowerVerdict(item.power, equippedItem?.power);

  const steps = useMemo<RevealStep[]>(() => {
    if (!isFullReveal) {
      return ['locked', 'rarity', 'full'];
    }
    const sequence: RevealStep[] = ['locked'];
    if (hasAnnounce) sequence.push('announce');
    sequence.push('rarity', 'name');
    for (let i = 0; i < affixes.length; i++) sequence.push('affix');
    sequence.push('power', 'collection');
    return sequence;
  }, [affixes.length, hasAnnounce, isFullReveal]);

  const [stepIndex, setStepIndex] = useState(0);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const currentStep = steps[stepIndex] ?? 'collection';
  const visibleAffixCount = steps.slice(0, stepIndex + 1).filter((s) => s === 'affix').length;
  const rarityRevealed =
    currentStep === 'rarity' ||
    currentStep === 'name' ||
    currentStep === 'affix' ||
    currentStep === 'power' ||
    currentStep === 'full' ||
    currentStep === 'collection';

  const reset = useCallback(() => {
    setStepIndex(0);
  }, []);

  useEffect(() => {
    reset();
  }, [item.id, reset]);

  const fireRevealHaptics = useCallback(() => {
    if (item.rarity === 'mythic') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (item.rarity === 'legendary') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (item.rarity === 'epic') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [item.rarity]);

  const advance = useCallback(() => {
    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      onRevealCompleteRef.current?.();
      return;
    }

    const nextStep = steps[nextIndex];
    if (currentStep === 'locked' && (nextStep === 'announce' || nextStep === 'rarity')) {
      fireRevealHaptics();
    } else if (nextStep === 'affix') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (nextStep === 'power') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setStepIndex(nextIndex);
  }, [currentStep, fireRevealHaptics, stepIndex, steps]);

  const showRarity =
    currentStep === 'rarity' ||
    currentStep === 'name' ||
    currentStep === 'affix' ||
    currentStep === 'power' ||
    currentStep === 'full' ||
    currentStep === 'collection';

  const showName =
    currentStep === 'name' ||
    currentStep === 'affix' ||
    currentStep === 'power' ||
    currentStep === 'full' ||
    currentStep === 'collection';

  const showAffixes =
    currentStep === 'affix' ||
    currentStep === 'power' ||
    currentStep === 'full' ||
    currentStep === 'collection';

  const showPower =
    currentStep === 'power' || currentStep === 'full' || currentStep === 'collection';
  const showCollection = currentStep === 'full' || currentStep === 'collection';

  const visibleAffixes = showAffixes
    ? affixes.slice(
        0,
        currentStep === 'full' || currentStep === 'collection'
          ? affixes.length
          : visibleAffixCount || (showPower ? affixes.length : 0),
      )
    : [];

  const announceLabel =
    item.rarity === 'mythic' ? 'MYTHIC FOUND' : 'LEGENDARY FOUND';

  return (
    <Pressable style={styles.tapArea} onPress={advance}>
      {rarityRevealed && (
        <View style={[styles.colorWash, { backgroundColor: nameColor }]} />
      )}

      <View style={styles.content}>
        {currentStep === 'locked' && (
          <Text style={styles.lockedMark}>?</Text>
        )}

        {currentStep === 'announce' && (
          <Text style={[styles.announce, { color: nameColor }]}>{announceLabel}</Text>
        )}

        {showRarity && (
          <Text style={[styles.rarity, { color: nameColor }]}>
            {rarityLabels[item.rarity]}
          </Text>
        )}

        {showName && (
          <Text style={[styles.name, { color: nameColor }]} numberOfLines={2}>
            {item.name.toUpperCase()}
          </Text>
        )}

        {item.rarity === 'mythic' && showName && (
          <View style={styles.mythicMeta}>
            {isFirstMythic && <Text style={styles.mythicLine}>First Mythic?</Text>}
            <Text style={styles.mythicLine}>
              Mythics Found: {collectionStats.mythicsFound}
            </Text>
          </View>
        )}

        {visibleAffixes.length > 0 && (
          <View style={styles.affixBlock}>
            {visibleAffixes.map((line, i) => (
              <Text key={`${line}-${i}`} style={styles.affix}>
                {line}
              </Text>
            ))}
          </View>
        )}

        {showPower && (
          <View style={styles.powerBlock}>
            <Text style={styles.power}>POWER {item.power.toLocaleString()}</Text>
            {equippedItem && (
              <Text style={[styles.verdict, { color: POWER_VERDICT_COLORS[verdict] }]}>
                {POWER_VERDICT_LABELS[verdict]}
              </Text>
            )}
          </View>
        )}

        {showCollection && (
          <View style={styles.collectionBlock}>
            <View style={styles.collectionRow}>
              <Text style={styles.collectionLabel}>Items Found</Text>
              <Text style={styles.collectionValue}>{collectionStats.itemsFound}</Text>
            </View>
            <View style={styles.collectionRow}>
              <Text style={styles.collectionLabel}>Legendaries Found</Text>
              <Text style={[styles.collectionValue, { color: rarityColors.legendary }]}>
                {collectionStats.legendariesFound}
              </Text>
            </View>
            <View style={styles.collectionRow}>
              <Text style={styles.collectionLabel}>Mythics Found</Text>
              <Text style={[styles.collectionValue, { color: rarityColors.mythic }]}>
                {collectionStats.mythicsFound}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.tapHint}>TAP</Text>
      </View>
    </Pressable>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  tapArea: {
    width: '100%',
    minHeight: 360,
    overflow: 'hidden',
    borderRadius: 4,
  },
  colorWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: 360,
  },
  lockedMark: {
    fontFamily: mono,
    fontSize: 48,
    fontWeight: '200',
    color: colors.textMuted,
    letterSpacing: 4,
    marginBottom: 8,
  },
  announce: {
    fontFamily: mono,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
  },
  rarity: {
    fontFamily: mono,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: mono,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  mythicMeta: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  mythicLine: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  affixBlock: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 6,
  },
  affix: {
    fontFamily: mono,
    fontSize: 14,
    color: '#5B7FFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  powerBlock: {
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  power: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 2,
    fontWeight: '700',
  },
  verdict: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  collectionBlock: {
    marginTop: 24,
    width: '100%',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    paddingTop: 16,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionLabel: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  collectionValue: {
    fontFamily: mono,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tapHint: {
    fontFamily: mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 3,
    marginTop: 24,
  },
});
