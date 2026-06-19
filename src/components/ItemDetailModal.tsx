import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from './ItemCard';
import { ItemAffixQualityPanel } from './ItemAffixQualityPanel';
import { EquipSlotPicker } from './EquipSlotPicker';
import { colors } from '../constants/theme';
import { getItemFingerprint } from '../systems/lootGenerator';
import { canSalvageItem, isNewDiscovery } from '../systems/inventoryUtils';
import { getSalvageDust } from '../utils/lootReveal';
import { gameAlert } from '../utils/gameAlert';
import { resolveEquipSlot } from '../systems/inventorySlots';
import type { InventoryItem, Item, Slot } from '../types/game';
import { useGameStore } from '../store/gameStore';

export type ItemDetailMode = 'inventory' | 'equipped';

interface ItemDetailModalProps {
  item: Item | InventoryItem | null;
  mode: ItemDetailMode;
  equippedSlot?: Slot;
  readOnly?: boolean;
  onClose: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ItemDetailModal({ item, mode, equippedSlot, readOnly = false, onClose }: ItemDetailModalProps) {
  const router = useRouter();
  const equipment = useGameStore((s) => s.equipment);
  const inventory = useGameStore((s) => s.inventory);
  const collection = useGameStore((s) => s.collection);
  const playerDepth = useGameStore((s) => s.depth);
  const beginEquipItem = useGameStore((s) => s.beginEquipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const toggleFavorite = useGameStore((s) => s.toggleFavorite);
  const salvageInventoryItem = useGameStore((s) => s.salvageInventoryItem);
  const salvageEquippedItem = useGameStore((s) => s.salvageEquippedItem);
  const markCollectionViewed = useGameStore((s) => s.markCollectionViewed);

  const [slotOptions, setSlotOptions] = useState<Slot[] | null>(null);

  if (!item) return null;

  const invItem =
    mode === 'inventory'
      ? inventory.find((i) => i.id === item.id) ??
        ('acquiredAt' in item ? (item as InventoryItem) : undefined)
      : undefined;
  const isFavorite = invItem?.favorite ?? false;
  const foundDepth = invItem?.foundDepth ?? playerDepth;
  const acquiredAt = invItem?.acquiredAt;
  const isNew = isNewDiscovery(item, collection);
  const canSalvage =
    mode === 'equipped'
      ? !!equippedSlot
      : !!invItem && canSalvageItem(invItem, equipment);
  const salvageDust = getSalvageDust(item);

  const handleOpen = () => {
    if (readOnly) return;
    markCollectionViewed(getItemFingerprint(item));
  };

  const handleEquip = (targetSlot?: Slot) => {
    handleOpen();
    const source = mode === 'inventory' ? 'inventory' : 'inventory';
    if (mode === 'equipped') return;

    const resolution = resolveEquipSlot(item, equipment, targetSlot);
    if (resolution.needsSlotChoice && resolution.slotOptions) {
      setSlotOptions(resolution.slotOptions);
      return;
    }
    handleEquipWithSlot(resolution.slot);
  };

  const handleEquipWithSlot = (targetSlot?: Slot) => {
    setSlotOptions(null);
    const result = beginEquipItem('inventory', item.id, targetSlot);
    if (result === 'needs_comparison') {
      onClose();
      router.push('/comparison');
      return;
    }
    if (result === 'full') {
      gameAlert('Inventory Full', 'Make room before equipping — you need a free slot for replaced gear.');
      return;
    }
    if (result === 'equipped') {
      onClose();
    }
  };

  const handleUnequip = () => {
    if (!equippedSlot) return;
    const result = unequipSlot(equippedSlot);
    if (result === 'full') {
      gameAlert('Inventory Full', 'Free up space before unequipping.');
      return;
    }
    onClose();
  };

  const handleSalvage = () => {
    if (!canSalvage) {
      gameAlert(
        'Cannot Salvage',
        invItem?.favorite
          ? 'Unfavorite this item first.'
          : 'This item cannot be salvaged.',
      );
      return;
    }
    gameAlert(
      'Salvage Item',
      `Destroy ${item.name} for +${salvageDust} Dust?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Salvage',
          style: 'destructive',
          onPress: () => {
            if (mode === 'equipped' && equippedSlot) {
              salvageEquippedItem(equippedSlot);
            } else {
              salvageInventoryItem(item.id);
            }
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      statusBarTranslucent
      onShow={handleOpen}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {isNew && <Text style={styles.discovery}>NEW DISCOVERY</Text>}
            <ItemCard item={item} />
            <ItemAffixQualityPanel item={item} foundDepth={foundDepth} />
            {invItem && (
              <Text style={styles.meta}>Found at Depth {foundDepth}</Text>
            )}
            {acquiredAt !== undefined && (
              <Text style={styles.meta}>Found {formatDate(acquiredAt)}</Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {slotOptions && (
              <EquipSlotPicker
                itemKind={item.slot.startsWith('ring') ? 'ring' : 'trinket'}
                slots={slotOptions}
                onSelect={handleEquipWithSlot}
                onCancel={() => setSlotOptions(null)}
              />
            )}
            {!readOnly && mode === 'inventory' && !slotOptions && (
              <>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.equipBtn, pressed && styles.pressed]}
                  onPress={() => handleEquip()}
                >
                  <Text style={styles.equipText}>Equip</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Text style={styles.actionText}>{isFavorite ? '★ Favorited' : '☆ Favorite'}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    !canSalvage && styles.disabled,
                    pressed && canSalvage && styles.pressed,
                  ]}
                  onPress={handleSalvage}
                  disabled={!canSalvage}
                >
                  <Text style={[styles.actionText, styles.salvageText]}>
                    Salvage · +{salvageDust} Dust
                  </Text>
                </Pressable>
              </>
            )}
            {!readOnly && mode === 'equipped' && equippedSlot && !slotOptions && (
              <>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={handleUnequip}
                >
                  <Text style={styles.actionText}>Unequip</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                  onPress={handleSalvage}
                >
                  <Text style={[styles.actionText, styles.salvageText]}>
                    Salvage · +{salvageDust} Dust
                  </Text>
                </Pressable>
              </>
            )}
            {!slotOptions && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={onClose}
              >
                <Text style={styles.actionText}>Close</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    zIndex: 1,
    backgroundColor: '#0D0D12',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A45',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  discovery: {
    textAlign: 'center',
    color: colors.cta,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    paddingTop: 16,
  },
  meta: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  actionBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  equipBtn: { backgroundColor: colors.cta },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
  equipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  salvageText: { color: '#F59E0B' },
});
