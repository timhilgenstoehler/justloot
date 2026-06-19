import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getSlotLabel } from '../constants/slots';
import { colors } from '../constants/theme';
import type { Slot } from '../types/game';

interface EquipSlotPickerProps {
  itemKind: 'ring' | 'trinket';
  slots: Slot[];
  onSelect: (slot: Slot) => void;
  onCancel: () => void;
}

export function EquipSlotPicker({ itemKind, slots, onSelect, onCancel }: EquipSlotPickerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Choose {itemKind} slot</Text>
      {slots.map((slot) => (
        <Pressable
          key={slot}
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          onPress={() => onSelect(slot)}
        >
          <Text style={styles.optionText}>{getSlotLabel(slot)}</Text>
        </Pressable>
      ))}
      <Pressable style={({ pressed }) => [styles.cancel, pressed && styles.pressed]} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  title: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 12,
  },
  option: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.cta,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 1,
  },
  cancel: {
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  pressed: { opacity: 0.85 },
});
