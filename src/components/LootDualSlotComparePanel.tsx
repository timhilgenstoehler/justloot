import { Platform, StyleSheet, Text, View } from 'react-native';
import { getSlotLabel } from '../constants/slots';
import { colors } from '../constants/theme';
import type { Item, Slot } from '../types/game';
import { LootComparePanel } from './LootComparePanel';

interface SlotCompareEntry {
  slot: Slot;
  currentItem?: Item;
}

interface LootDualSlotComparePanelProps {
  newItem: Item;
  slots: SlotCompareEntry[];
}

export function LootDualSlotComparePanel({ newItem, slots }: LootDualSlotComparePanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare</Text>
      {slots.map(({ slot, currentItem }) => (
        <View key={slot} style={styles.slotSection}>
          {currentItem ? (
            <LootComparePanel
              currentItem={currentItem}
              newItem={newItem}
              title={getSlotLabel(slot)}
              compact
            />
          ) : (
            <View style={styles.emptyBlock}>
              <Text style={styles.slotLabel}>{getSlotLabel(slot)}</Text>
              <Text style={styles.emptyText}>Empty slot</Text>
              <Text style={styles.newPower}>New power {newItem.power.toLocaleString()}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  title: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 16,
  },
  slotSection: {
    marginBottom: 8,
  },
  emptyBlock: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    backgroundColor: '#0A0A0E',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotLabel: {
    fontFamily: mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  newPower: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.cta,
  },
});
