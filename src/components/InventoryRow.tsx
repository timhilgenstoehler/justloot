import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getSlotLabel } from '../constants/slots';
import { colors, rarityColors, rarityLabels } from '../constants/theme';
import { getMainAffixLines, isNewDiscovery } from '../systems/inventoryUtils';
import type { InventoryItem } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface InventoryRowProps {
  item: InventoryItem;
  onPress: () => void;
}

export function InventoryRow({ item, onPress }: InventoryRowProps) {
  const collection = useGameStore((s) => s.collection);
  const affixes = getMainAffixLines(item);
  const isNew = isNewDiscovery(item, collection);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.rarity, { color: rarityColors[item.rarity] }]}>
          {rarityLabels[item.rarity]}
        </Text>
        {item.favorite && <Text style={styles.star}>★</Text>}
        {isNew && <Text style={styles.badge}>NEW</Text>}
      </View>
      <Text style={[styles.name, { color: rarityColors[item.rarity] }]}>{item.name}</Text>
      <Text style={styles.meta}>
        {getSlotLabel(item.slot)} · Power {item.power}
      </Text>
      {affixes.map((line, i) => (
        <Text key={`${item.id}-affix-${i}`} style={styles.affix}>
          {line}
        </Text>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  pressed: { opacity: 0.85 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  rarity: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  star: { color: colors.cta, fontSize: 12 },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.cta,
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: colors.cta,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  name: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  affix: { fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
});
