import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EquipmentColumn } from './EquipmentColumn';
import { LEFT_SLOTS, RIGHT_SLOTS } from '../constants/slots';
import { colors } from '../constants/theme';
import type { Item, Slot } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface EquippedTabProps {
  onItemPress: (item: Item, slot: Slot) => void;
}

export function EquippedTab({ onItemPress }: EquippedTabProps) {
  const equipment = useGameStore((s) => s.equipment);

  const handleSlotPress = (slot: Slot) => {
    const item = equipment[slot];
    if (item) onItemPress(item, slot);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.hint}>Tap a slot to view details or unequip.</Text>
      <View style={styles.grid}>
        <EquipmentColumn
          slots={LEFT_SLOTS}
          equipment={equipment}
          align="left"
          onItemPress={(item) => {
            const slot = LEFT_SLOTS.find((s) => equipment[s.id]?.id === item.id)?.id;
            if (slot) handleSlotPress(slot);
          }}
        />
        <View style={styles.spacer} />
        <EquipmentColumn
          slots={RIGHT_SLOTS}
          equipment={equipment}
          align="right"
          onItemPress={(item) => {
            const slot = RIGHT_SLOTS.find((s) => equipment[s.id]?.id === item.id)?.id;
            if (slot) handleSlotPress(slot);
          }}
        />
      </View>

      <View style={styles.list}>
        {LEFT_SLOTS.concat(RIGHT_SLOTS).map((slotConfig) => {
          const item = equipment[slotConfig.id];
          return (
            <Pressable
              key={slotConfig.id}
              style={({ pressed }) => [styles.slotRow, pressed && item && styles.pressed]}
              onPress={() => item && handleSlotPress(slotConfig.id)}
              disabled={!item}
            >
              <Text style={styles.slotLabel}>{slotConfig.label}</Text>
              <Text style={[styles.slotValue, !item && styles.empty]}>
                {item ? item.name : '—'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  spacer: { width: 80 },
  list: { paddingHorizontal: 4 },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  pressed: { opacity: 0.85 },
  slotLabel: { fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
  slotValue: { fontSize: 12, color: colors.textPrimary, flex: 1, textAlign: 'right', marginLeft: 12 },
  empty: { color: '#3A3A45' },
});
