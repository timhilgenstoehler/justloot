import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';
import { getSlotLabel } from '../constants/slots';
import { colors, rarityColors, rarityLabels } from '../constants/theme';
import { getAffixDisplayLines } from '../systems/powerCalculator';
import type { Item } from '../types/game';

const QUALITY_LABELS: Record<Item['quality'], string> = {
  poor: 'Poor',
  normal: '',
  great: 'Great',
  perfect: 'Perfect',
  ancient: 'Ancient',
};

interface ItemRevealProps {
  item: Item;
  playerName: string;
  onRevealComplete?: () => void;
}

export function ItemReveal({ item, playerName, onRevealComplete }: ItemRevealProps) {
  const [phase, setPhase] = useState<'rarity' | 'meta' | 'stats' | 'footer'>('rarity');
  const [visibleGroupCount, setVisibleGroupCount] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const nameColor = rarityColors[item.rarity];
  const groups = getAffixDisplayLines(item);
  const isMythic = item.rarity === 'mythic';
  const RARITY_HOLD_MS = isMythic ? 1600 : item.rarity === 'legendary' ? 1100 : 900;
  const STAT_INTERVAL_MS = isMythic ? 280 : 220;
  const META_DELAY_MS = isMythic ? 700 : 500;

  useEffect(() => {
    setPhase('rarity');
    setVisibleGroupCount(0);
    setShowFooter(false);

    if (isMythic) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setPhase('meta'), RARITY_HOLD_MS));
    timers.push(
      setTimeout(() => {
        setPhase('stats');
        setVisibleGroupCount(1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, RARITY_HOLD_MS + META_DELAY_MS),
    );

    for (let i = 1; i < groups.length; i++) {
      timers.push(
        setTimeout(() => {
          setVisibleGroupCount(i + 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, RARITY_HOLD_MS + META_DELAY_MS + i * STAT_INTERVAL_MS),
      );
    }

    const footerAt =
      RARITY_HOLD_MS +
      META_DELAY_MS +
      Math.max(groups.length, 1) * STAT_INTERVAL_MS +
      300;

    timers.push(
      setTimeout(() => {
        setPhase('footer');
        setShowFooter(true);
        onRevealCompleteRef.current?.();
      }, footerAt),
    );

    return () => timers.forEach(clearTimeout);
  }, [item.id, groups.length, item.rarity, isMythic, RARITY_HOLD_MS, META_DELAY_MS, STAT_INTERVAL_MS]);

  const qualityLabel = QUALITY_LABELS[item.quality];

  return (
    <View style={[styles.container, isMythic && styles.mythicContainer]}>
      <Animated.Text
        entering={ZoomIn.duration(isMythic ? 800 : 500).springify().damping(14)}
        style={[styles.rarity, { color: nameColor }, isMythic && styles.mythicRarity]}
      >
        {rarityLabels[item.rarity]}
      </Animated.Text>

      {phase !== 'rarity' && (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.meta}>
          <Text style={[styles.name, { color: nameColor }]} numberOfLines={2}>
            {item.name.toUpperCase()}
          </Text>
          <Text style={styles.baseType}>
            {getSlotLabel(item.slot).toUpperCase()}
            {qualityLabel ? ` · ${qualityLabel.toUpperCase()}` : ''}
          </Text>
          {item.defense !== undefined && (
            <Text style={styles.defense}>
              Defense: <Text style={styles.defenseValue}>{item.defense}</Text>
            </Text>
          )}
        </Animated.View>
      )}

      {(phase === 'stats' || phase === 'footer') && groups.length > 0 && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.divider} />
      )}

      {(phase === 'stats' || phase === 'footer') &&
        groups.slice(0, visibleGroupCount).map((group) => (
          <Animated.View key={group.category} entering={FadeInDown.duration(280)} style={styles.group}>
            <Text style={styles.groupLabel}>{group.category}</Text>
            {group.lines.map((line, i) => (
              <Text key={`${group.category}-${i}`} style={styles.affix}>
                {line}
              </Text>
            ))}
          </Animated.View>
        ))}

      {showFooter && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.footer}>
          <Text style={styles.power}>Power {item.power.toLocaleString()}</Text>
          <Text style={styles.foundBy}>Found by: {playerName}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    minHeight: 200,
  },
  mythicContainer: {
    paddingVertical: 32,
  },
  rarity: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: 8,
  },
  mythicRarity: {
    fontSize: 26,
    letterSpacing: 6,
  },
  meta: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 8,
  },
  baseType: {
    fontSize: 11,
    color: colors.textPrimary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  defense: {
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  defenseValue: {
    color: '#4A9EFF',
  },
  divider: {
    width: '70%',
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 12,
  },
  group: {
    alignItems: 'center',
    marginBottom: 6,
  },
  groupLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  affix: {
    fontSize: 13,
    color: '#5B7FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  power: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  foundBy: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
