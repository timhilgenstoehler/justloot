import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemReveal } from './ItemReveal';
import { LootComparePanel } from './LootComparePanel';
import { LootDualSlotComparePanel } from './LootDualSlotComparePanel';
import { getSlotLabel } from '../constants/slots';
import { colors } from '../constants/theme';
import {
  getDualSlotOptions,
  isDualSlotItem,
  resolveEquipSlot,
} from '../systems/inventorySlots';
import type { Item, Slot } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { gameAlert } from '../utils/gameAlert';

type RevealPhase = 'reveal' | 'compare' | 'actions';

function bestEquippedInSlots(
  equipment: Partial<Record<Slot, Item>>,
  slots: Slot[],
): Item | undefined {
  const items = slots.map((s) => equipment[s]).filter((i): i is Item => !!i);
  if (items.length === 0) return undefined;
  return items.reduce((best, i) => (i.power > best.power ? i : best));
}

export function LootRevealFlow() {
  const pendingLoot = useGameStore((s) => s.pendingLoot);
  const equipment = useGameStore((s) => s.equipment);
  const collection = useGameStore((s) => s.collection);
  const collectionCounters = useGameStore((s) => s.collectionCounters);
  const equipPendingLoot = useGameStore((s) => s.equipPendingLoot);
  const beginEquipItem = useGameStore((s) => s.beginEquipItem);
  const confirmEquipReplace = useGameStore((s) => s.confirmEquipReplace);
  const stashPendingLoot = useGameStore((s) => s.stashPendingLoot);
  const salvagePendingLoot = useGameStore((s) => s.salvagePendingLoot);

  const [phase, setPhase] = useState<RevealPhase>('reveal');

  const dualSlots = pendingLoot ? getDualSlotOptions(pendingLoot) : null;
  const isDualSlot = pendingLoot ? isDualSlotItem(pendingLoot) : false;

  const dualSlotEntries = useMemo(
    () =>
      dualSlots?.map((slot) => ({
        slot,
        currentItem: equipment[slot],
      })) ?? [],
    [dualSlots, equipment],
  );

  const equippedItem = useMemo(() => {
    if (!pendingLoot) return undefined;
    if (dualSlots) {
      return bestEquippedInSlots(equipment, dualSlots);
    }
    const resolution = resolveEquipSlot(pendingLoot, equipment);
    return equipment[resolution.slot];
  }, [pendingLoot, dualSlots, equipment]);

  const shouldCompare = useMemo(() => {
    if (!pendingLoot) return false;
    if (dualSlots) {
      return dualSlots.some((slot) => !!equipment[slot]);
    }
    return !!equippedItem;
  }, [pendingLoot, dualSlots, equipment, equippedItem]);

  const collectionStats = useMemo(
    () => ({
      itemsFound: Object.keys(collection).length,
      legendariesFound: collectionCounters.legendary,
      mythicsFound: collectionCounters.mythic,
    }),
    [collection, collectionCounters],
  );

  const isFirstMythic =
    pendingLoot?.rarity === 'mythic' && collectionCounters.mythic === 1;

  useEffect(() => {
    if (pendingLoot) {
      setPhase('reveal');
    }
  }, [pendingLoot?.id]);

  const handleRevealComplete = useCallback(() => {
    if (shouldCompare) {
      setPhase('compare');
    } else {
      setPhase('actions');
    }
  }, [shouldCompare]);

  const finishEquip = useCallback(
    (targetSlot?: Slot) => {
      if (!pendingLoot) return;

      const result = targetSlot
        ? beginEquipItem('pending', pendingLoot.id, targetSlot)
        : equipPendingLoot();

      if (result === 'needs_comparison') {
        const replaceResult = confirmEquipReplace();
        if (replaceResult === 'full') {
          gameAlert(
            'Inventory Full',
            'Free up space before equipping — replaced gear goes to your bag.',
          );
        } else if (replaceResult === 'ok') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
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
    },
    [beginEquipItem, confirmEquipReplace, equipPendingLoot, pendingLoot],
  );

  const handleEquipSlot = (slot: Slot) => {
    finishEquip(slot);
  };

  const handleEquip = () => {
    if (!pendingLoot) return;
    finishEquip();
  };

  const handleKeep = () => {
    const result = stashPendingLoot();
    if (result === 'full') {
      gameAlert(
        'Inventory Full',
        'Your bag is full. Equip or salvage items before keeping more loot.',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSalvage = () => {
    salvagePendingLoot();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!pendingLoot) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {phase === 'reveal' && (
            <ItemReveal
              item={pendingLoot}
              equippedItem={equippedItem}
              collectionStats={collectionStats}
              isFirstMythic={isFirstMythic}
              onRevealComplete={handleRevealComplete}
            />
          )}

          {phase === 'compare' && isDualSlot && (
            <LootDualSlotComparePanel newItem={pendingLoot} slots={dualSlotEntries} />
          )}

          {phase === 'compare' && !isDualSlot && equippedItem && (
            <LootComparePanel currentItem={equippedItem} newItem={pendingLoot} />
          )}
        </ScrollView>
      </View>

      {phase === 'compare' && (
        <Pressable
          style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
          onPress={() => setPhase('actions')}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      )}

      {phase === 'actions' && (
        <View style={styles.actions}>
          {isDualSlot && dualSlots ? (
            dualSlots.map((slot, index) => (
              <Pressable
                key={slot}
                style={({ pressed }) => [
                  styles.equipButton,
                  index < dualSlots.length - 1 && styles.equipButtonBorder,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleEquipSlot(slot)}
              >
                <Text style={styles.equipText}>Equip {getSlotLabel(slot)}</Text>
              </Pressable>
            ))
          ) : (
            <Pressable
              style={({ pressed }) => [styles.equipButton, pressed && styles.buttonPressed]}
              onPress={handleEquip}
            >
              <Text style={styles.equipText}>Equip</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.salvageButton, pressed && styles.buttonPressed]}
            onPress={handleSalvage}
          >
            <Text style={styles.salvageText}>Salvage</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0D0D12',
    borderRadius: 4,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#3A3A45',
    maxHeight: '72%',
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 340,
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.cta,
    borderRadius: 4,
  },
  continueText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  equipButton: {
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: colors.cta,
  },
  equipButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  salvageButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0D0D12',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  keepButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0D0D12',
  },
  equipText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  salvageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  keepText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
