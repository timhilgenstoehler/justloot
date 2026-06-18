import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ItemCard } from './ItemCard';
import { colors } from '../constants/theme';
import type { Item } from '../types/game';

interface ItemInspectModalProps {
  item: Item | null;
  onClose: () => void;
}

export function ItemInspectModal({ item, onClose }: ItemInspectModalProps) {
  if (!item) return null;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ItemCard item={item} />
          </ScrollView>
          <Pressable
            style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
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
    maxHeight: '80%',
    overflow: 'hidden',
  },
  closeButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  closePressed: {
    opacity: 0.8,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
