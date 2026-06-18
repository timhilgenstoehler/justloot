import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ItemReveal } from '../components/ItemReveal';
import { getSlotLabel } from '../constants/slots';
import { colors, rarityColors } from '../constants/theme';
import { resolveEquipSlot } from '../systems/inventorySlots';
import type { Slot } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { gameAlert } from '../utils/gameAlert';

export function RunResultModal() {
  const router = useRouter();
  const showResult = useGameStore((s) => s.showResult);
  const pendingLoot = useGameStore((s) => s.pendingLoot);
  const playerName = useGameStore((s) => s.playerName);
  const equipPendingLoot = useGameStore((s) => s.equipPendingLoot);
  const beginEquipItem = useGameStore((s) => s.beginEquipItem);
  const equipment = useGameStore((s) => s.equipment);
  const stashPendingLoot = useGameStore((s) => s.stashPendingLoot);
  const [showActions, setShowActions] = useState(false);
  const [slotOptions, setSlotOptions] = useState<Slot[] | null>(null);

  const handleRevealComplete = useCallback(() => {
    setShowActions(true);
  }, []);

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.12);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  useEffect(() => {
    if (showResult && pendingLoot) {
      setShowActions(false);
      setSlotOptions(null);
      if (pendingLoot.rarity === 'legendary' || pendingLoot.rarity === 'mythic') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (pendingLoot.rarity === 'epic') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        true,
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.22, { duration: 600 }),
          withTiming(0.1, { duration: 600 }),
        ),
        -1,
        true,
      );
    }
  }, [showResult, pendingLoot?.id, glowScale, glowOpacity]);

  useEffect(() => {
    if (!showResult || !pendingLoot) return;
    const fallback = setTimeout(() => setShowActions(true), 3500);
    return () => clearTimeout(fallback);
  }, [showResult, pendingLoot?.id]);

  if (!pendingLoot || !showResult) return null;

  const glowColor = rarityColors[pendingLoot.rarity];

  const finishEquip = (targetSlot?: Slot) => {
    if (!pendingLoot) return;

    const result = targetSlot
      ? beginEquipItem('pending', pendingLoot.id, targetSlot)
      : equipPendingLoot();

    if (result === 'needs_comparison') {
      router.push('/comparison');
      return;
    }
    if (result === 'full') {
      gameAlert(
        'Inventory Full',
        'Free up space before equipping — replaced gear goes to your bag.',
      );
      return;
    }
    if (result === 'equipped') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleEquip = () => {
    if (!pendingLoot) return;

    const resolution = resolveEquipSlot(pendingLoot, equipment);
    if (resolution.needsSlotChoice && resolution.slotOptions) {
      setSlotOptions(resolution.slotOptions);
      return;
    }

    finishEquip();
  };

  const handleKeep = () => {
    const result = stashPendingLoot();
    if (result === 'full') {
      gameAlert(
        'Inventory Full',
        'Your bag is full. Equip or delete items before keeping more loot.',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.glow, { backgroundColor: glowColor }, glowStyle]} />
        <View style={styles.card}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <ItemReveal
              item={pendingLoot}
              playerName={playerName}
              onRevealComplete={handleRevealComplete}
            />
          </ScrollView>
        </View>

        {slotOptions && (
          <View style={styles.slotPicker}>
            <Text style={styles.slotPickerTitle}>
              Choose {pendingLoot.slot.startsWith('ring') ? 'Ring' : 'Trinket'} Slot
            </Text>
            <View style={styles.slotPickerRow}>
              {slotOptions.map((slot) => (
                <Pressable
                  key={slot}
                  style={({ pressed }) => [styles.slotPickerButton, pressed && styles.buttonPressed]}
                  onPress={() => {
                    setSlotOptions(null);
                    finishEquip(slot);
                  }}
                >
                  <Text style={styles.slotPickerText}>{getSlotLabel(slot)}</Text>
                </Pressable>
              ))}
              <Pressable
                style={({ pressed }) => [styles.slotPickerCancel, pressed && styles.buttonPressed]}
                onPress={() => setSlotOptions(null)}
              >
                <Text style={styles.keepText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {showActions && !slotOptions && (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.equipButton, pressed && styles.buttonPressed]}
              onPress={handleEquip}
            >
              <Text style={styles.equipText}>Equip</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.keepButton, pressed && styles.buttonPressed]}
              onPress={handleKeep}
            >
              <Text style={styles.keepText}>Keep</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  card: {
    backgroundColor: '#0D0D12',
    borderRadius: 4,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#3A3A45',
    maxHeight: '62%',
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 300,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  slotPicker: {
    width: '100%',
    maxWidth: 300,
    marginTop: 12,
    backgroundColor: '#0D0D12',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 12,
  },
  slotPickerTitle: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },
  slotPickerRow: {
    gap: 8,
  },
  slotPickerButton: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.cta,
    borderRadius: 4,
  },
  slotPickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B0B0F',
    letterSpacing: 1,
  },
  slotPickerCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  equipButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: colors.cta,
  },
  keepButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: '#0D0D12',
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceBorder,
  },
  equipText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  keepText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
