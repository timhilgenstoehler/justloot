import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { SlotConfig } from '../constants/slots';
import type { Item, Slot } from '../types/game';
import { EquipmentSlot } from './EquipmentSlot';

interface EquipmentColumnProps {
  slots: SlotConfig[];
  equipment: Partial<Record<Slot, Item>>;
  align: 'left' | 'right';
  onItemPress?: (item: Item) => void;
}

function getSlotSize(screenWidth: number): number {
  if (screenWidth < 360) return 36;
  if (screenWidth < 390) return 40;
  return 42;
}

export function EquipmentColumn({ slots, equipment, align, onItemPress }: EquipmentColumnProps) {
  const { width } = useWindowDimensions();
  const slotSize = getSlotSize(width);

  return (
    <View style={[styles.column, align === 'right' && styles.columnRight]}>
      {slots.map((config) => (
        <EquipmentSlot
          key={config.id}
          config={config}
          item={equipment[config.id]}
          size={slotSize}
          onPress={onItemPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'flex-start',
  },
  columnRight: {
    alignItems: 'flex-end',
  },
});
