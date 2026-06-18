import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, rarityColors } from '../constants/theme';
import { RARITY_FILTER_OPTIONS } from '../systems/inventoryUtils';
import type { InventoryRarityFilter, InventorySlotFilter, InventorySort, Rarity, Slot } from '../types/game';
import { INVENTORY_CAPACITY } from '../types/game';
import { useGameStore } from '../store/gameStore';

const SORT_OPTIONS: { id: InventorySort; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'power', label: 'Power' },
  { id: 'rarity', label: 'Rarity' },
  { id: 'slot', label: 'Slot' },
];

const SLOT_FILTERS: { id: InventorySlotFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'helmet', label: 'Helmet' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'chest', label: 'Chest' },
  { id: 'bracers', label: 'Bracers' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'waist', label: 'Waist' },
  { id: 'legs', label: 'Legs' },
  { id: 'boots', label: 'Boots' },
  { id: 'ring', label: 'Ring' },
  { id: 'trinket', label: 'Trinket' },
  { id: 'weapon', label: 'Weapon' },
];

interface InventoryToolbarProps {
  count: number;
}

export function InventoryToolbar({ count }: InventoryToolbarProps) {
  const sort = useGameStore((s) => s.inventorySort);
  const slotFilter = useGameStore((s) => s.inventorySlotFilter);
  const rarityFilter = useGameStore((s) => s.inventoryRarityFilter);
  const setInventorySort = useGameStore((s) => s.setInventorySort);
  const setInventorySlotFilter = useGameStore((s) => s.setInventorySlotFilter);
  const setInventoryRarityFilter = useGameStore((s) => s.setInventoryRarityFilter);
  const bulkDeleteByRarity = useGameStore((s) => s.bulkDeleteByRarity);
  const inventory = useGameStore((s) => s.inventory);
  const equipment = useGameStore((s) => s.equipment);

  const confirmBulkDelete = (rarity: Rarity, label: string) => {
    const candidates = inventory.filter(
      (item) =>
        item.rarity === rarity &&
        !item.favorite &&
        !Object.values(equipment).some((e) => e?.id === item.id),
    );
    if (candidates.length === 0) {
      Alert.alert('Nothing to Delete', `No deletable ${label.toLowerCase()} items in inventory.`);
      return;
    }
    Alert.alert(
      `Delete All ${label}s`,
      `Permanently delete ${candidates.length} ${label.toLowerCase()} item(s)? Favorited and equipped items are skipped.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => bulkDeleteByRarity(rarity),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.capacity}>
        {count} / {INVENTORY_CAPACITY}
      </Text>

      <Text style={styles.label}>Sort</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            style={[styles.chip, sort === opt.id && styles.chipActive]}
            onPress={() => setInventorySort(opt.id)}
          >
            <Text style={[styles.chipText, sort === opt.id && styles.chipTextActive]}>{opt.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Slot</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {SLOT_FILTERS.map((opt) => (
          <Pressable
            key={opt.id}
            style={[styles.chip, slotFilter === opt.id && styles.chipActive]}
            onPress={() => setInventorySlotFilter(opt.id)}
          >
            <Text style={[styles.chipText, slotFilter === opt.id && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Rarity</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {RARITY_FILTER_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.chip, rarityFilter === opt && styles.chipActive]}
            onPress={() => setInventoryRarityFilter(opt)}
          >
            <Text
              style={[
                styles.chipText,
                rarityFilter === opt && styles.chipTextActive,
                opt !== 'all' && { color: rarityColors[opt as Rarity] },
              ]}
            >
              {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.bulkRow}>
        <Pressable style={styles.bulkBtn} onPress={() => confirmBulkDelete('common', 'Common')}>
          <Text style={styles.bulkText}>Delete All Commons</Text>
        </Pressable>
        <Pressable style={styles.bulkBtn} onPress={() => confirmBulkDelete('rare', 'Rare')}>
          <Text style={styles.bulkText}>Delete All Rares</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  capacity: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 4,
  },
  chipRow: { marginBottom: 8, maxHeight: 36 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginRight: 6,
  },
  chipActive: { borderColor: colors.cta, backgroundColor: '#1A1810' },
  chipText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.cta },
  bulkRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  bulkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    alignItems: 'center',
  },
  bulkText: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
});
