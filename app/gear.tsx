import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionTab } from '../src/components/CollectionTab';
import { EquippedTab } from '../src/components/EquippedTab';
import { GearTabs, type GearTab } from '../src/components/GearTabs';
import { InventoryRow } from '../src/components/InventoryRow';
import { InventoryToolbar } from '../src/components/InventoryToolbar';
import { ItemDetailModal } from '../src/components/ItemDetailModal';
import { colors } from '../src/constants/theme';
import { filterInventory, sortInventory } from '../src/systems/inventoryUtils';
import type { InventoryItem, Item, Slot } from '../src/types/game';
import { useGameStore } from '../src/store/gameStore';

export default function GearScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<GearTab>('inventory');
  const [detailItem, setDetailItem] = useState<{
    item: Item | InventoryItem;
    mode: 'inventory' | 'equipped';
    slot?: Slot;
  } | null>(null);

  const inventory = useGameStore((s) => s.inventory);
  const sort = useGameStore((s) => s.inventorySort);
  const slotFilter = useGameStore((s) => s.inventorySlotFilter);
  const rarityFilter = useGameStore((s) => s.inventoryRarityFilter);

  useEffect(() => {
    if (tab === 'collection' || tab === 'equipped' || tab === 'inventory') {
      setActiveTab(tab);
    }
  }, [tab]);

  const filteredInventory = useMemo(
    () => sortInventory(filterInventory(inventory, slotFilter, rarityFilter), sort),
    [inventory, slotFilter, rarityFilter, sort],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Gear</Text>

      <GearTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'equipped' && (
        <EquippedTab
          onItemPress={(item, slot) =>
            setDetailItem({ item, mode: 'equipped', slot })
          }
        />
      )}

      {activeTab === 'inventory' && (
        <View style={styles.flex}>
          <InventoryToolbar count={inventory.length} />
          <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
            {filteredInventory.length === 0 ? (
              <Text style={styles.empty}>
                {inventory.length === 0
                  ? 'No items in inventory. Keep loot from runs to build your stash.'
                  : 'No items match these filters.'}
              </Text>
            ) : (
              filteredInventory.map((item) => (
                <InventoryRow
                  key={item.id}
                  item={item}
                  onPress={() => setDetailItem({ item, mode: 'inventory' })}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}

      {activeTab === 'collection' && <CollectionTab />}

      <ItemDetailModal
        item={detailItem?.item ?? null}
        mode={detailItem?.mode ?? 'inventory'}
        equippedSlot={detailItem?.slot}
        onClose={() => setDetailItem(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  flex: { flex: 1 },
  back: { marginBottom: 16 },
  backText: { color: colors.textMuted, fontSize: 14 },
  title: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 32, lineHeight: 20 },
});
