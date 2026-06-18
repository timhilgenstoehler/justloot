import { useRouter } from 'expo-router';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from './ItemCard';
import { getSlotLabel } from '../constants/slots';
import { colors } from '../constants/theme';
import { getItemFingerprint } from '../systems/lootGenerator';
import { canDeleteItem, isNewDiscovery } from '../systems/inventoryUtils';
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
  const beginEquipItem = useGameStore((s) => s.beginEquipItem);
  const unequipSlot = useGameStore((s) => s.unequipSlot);
  const toggleFavorite = useGameStore((s) => s.toggleFavorite);
  const deleteInventoryItem = useGameStore((s) => s.deleteInventoryItem);
  const markCollectionViewed = useGameStore((s) => s.markCollectionViewed);

  if (!item) return null;

  const invItem = mode === 'inventory'
    ? inventory.find((i) => i.id === item.id)
    : undefined;
  const isFavorite = invItem?.favorite ?? false;
  const foundDepth = invItem?.foundDepth;
  const acquiredAt = invItem?.acquiredAt;
  const isNew = isNewDiscovery(item, collection);
  const canDelete = invItem ? canDeleteItem(invItem, equipment) : false;

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
      Alert.alert(
        'Choose Slot',
        `Which ${item.slot.startsWith('ring') ? 'ring' : 'trinket'} slot?`,
        [
          ...resolution.slotOptions.map((slot) => ({
            text: getSlotLabel(slot),
            onPress: () => handleEquipWithSlot(slot),
          })),
          { text: 'Cancel', style: 'cancel' },
        ],
      );
      return;
    }
    handleEquipWithSlot(resolution.slot);
  };

  const handleEquipWithSlot = (targetSlot?: Slot) => {
    const result = beginEquipItem('inventory', item.id, targetSlot);
    if (result === 'needs_comparison') {
      onClose();
      router.push('/comparison');
      return;
    }
    if (result === 'full') {
      Alert.alert('Inventory Full', 'Make room before equipping — you need a free slot for replaced gear.');
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
      Alert.alert('Inventory Full', 'Free up space before unequipping.');
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    if (!canDelete) {
      Alert.alert('Cannot Delete', isFavorite ? 'Unfavorite this item first.' : 'This item cannot be deleted.');
      return;
    }
    Alert.alert('Delete Item', `Permanently delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteInventoryItem(item.id);
          onClose();
        },
      },
    ]);
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
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {isNew && <Text style={styles.discovery}>NEW DISCOVERY</Text>}
            <ItemCard item={item} />
            {foundDepth !== undefined && (
              <Text style={styles.meta}>Found at Depth {foundDepth}</Text>
            )}
            {acquiredAt !== undefined && (
              <Text style={styles.meta}>Found {formatDate(acquiredAt)}</Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {!readOnly && mode === 'inventory' && (
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
                    !canDelete && styles.disabled,
                    pressed && canDelete && styles.pressed,
                  ]}
                  onPress={handleDelete}
                  disabled={!canDelete}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </>
            )}
            {!readOnly && mode === 'equipped' && equippedSlot && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                onPress={handleUnequip}
              >
                <Text style={styles.actionText}>Unequip</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
              onPress={onClose}
            >
              <Text style={styles.actionText}>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
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
  card: {
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
  deleteText: { color: '#EF4444' },
});
