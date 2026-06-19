import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getSlotLabel } from '../constants/slots';
import { colors, rarityColors, rarityLabels } from '../constants/theme';
import {
  canSalvageItem,
  getMainAffixLines,
  isNewDiscovery,
} from '../systems/inventoryUtils';
import { getSalvageDust } from '../utils/lootReveal';
import { gameAlert } from '../utils/gameAlert';
import type { InventoryItem } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface InventoryRowProps {
  item: InventoryItem;
  onPress: () => void;
}

export function InventoryRow({ item, onPress }: InventoryRowProps) {
  const collection = useGameStore((s) => s.collection);
  const equipment = useGameStore((s) => s.equipment);
  const salvageInventoryItem = useGameStore((s) => s.salvageInventoryItem);
  const affixes = getMainAffixLines(item);
  const isNew = isNewDiscovery(item, collection);
  const canSalvage = canSalvageItem(item, equipment);
  const dust = getSalvageDust(item);

  const handleSalvage = () => {
    if (!canSalvage) {
      gameAlert(
        'Cannot Salvage',
        item.favorite ? 'Unfavorite this item first.' : 'This item cannot be salvaged.',
      );
      return;
    }
    gameAlert(
      'Salvage Item',
      `Destroy ${item.name} for +${dust} Dust?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Salvage',
          style: 'destructive',
          onPress: () => salvageInventoryItem(item.id),
        },
      ],
    );
  };

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
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
      <Pressable
        style={({ pressed }) => [
          styles.salvageBtn,
          !canSalvage && styles.salvageDisabled,
          pressed && canSalvage && styles.pressed,
        ]}
        onPress={handleSalvage}
        disabled={!canSalvage}
      >
        <Text style={[styles.salvageText, !canSalvage && styles.salvageTextDisabled]}>
          +{dust}
        </Text>
        <Text style={[styles.salvageLabel, !canSalvage && styles.salvageTextDisabled]}>
          DUST
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  main: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
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
  salvageBtn: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.surfaceBorder,
    paddingHorizontal: 6,
  },
  salvageDisabled: { opacity: 0.35 },
  salvageText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  salvageLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 1,
    marginTop: 2,
  },
  salvageTextDisabled: {
    color: colors.textMuted,
  },
});
