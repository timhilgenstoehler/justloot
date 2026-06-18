import { Pressable, StyleSheet, Text } from 'react-native';
import { rarityColors } from '../constants/theme';
import type { Item } from '../types/game';
import type { SlotConfig } from '../constants/slots';

interface EquipmentSlotProps {
  config: SlotConfig;
  item?: Item;
  size?: number;
  onPress?: (item: Item) => void;
}

export function EquipmentSlot({ config, item, size = 42, onPress }: EquipmentSlotProps) {
  const borderColor = item ? rarityColors[item.rarity] : 'transparent';
  const labelSize = size <= 38 ? 7 : 8;

  const content = (
    <>
      <Text
        style={[styles.label, { fontSize: labelSize }, item && { color: borderColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {config.shortLabel}
      </Text>
    </>
  );

  if (item && onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.slot,
          { width: size, height: size },
          styles.slotFilled,
          { borderColor },
          pressed && styles.slotPressed,
        ]}
        onPress={() => onPress(item)}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.slot,
        { width: size, height: size },
        item ? styles.slotFilled : styles.slotEmpty,
        { borderColor },
      ]}
      disabled={!item}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  slotEmpty: {
    backgroundColor: '#14141A',
    borderColor: '#2A2A35',
  },
  slotFilled: {
    backgroundColor: '#1A1A22',
  },
  slotPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontWeight: '600',
    color: '#6B6B7B',
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});
