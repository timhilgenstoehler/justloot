import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import type { Item } from '../types/game';
import { ItemTooltip } from './ItemTooltip';

interface ItemCardProps {
  item: Item;
  showFoundBy?: string;
  compact?: boolean;
}

export function ItemCard({ item, showFoundBy, compact }: ItemCardProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <ItemTooltip item={item} showFoundBy={showFoundBy} compact={compact} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2A2A35',
    overflow: 'hidden',
  },
  cardCompact: {
    borderRadius: 4,
  },
});
