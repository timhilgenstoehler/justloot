import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tabPanelStyle } from './TabScreen';
import { rarityColors, rarityLabels } from '../constants/theme';
import { colors } from '../constants/theme';
import { getSlotLabel } from '../constants/slots';
import { useGameStore } from '../store/gameStore';

export function CollectionTab() {
  const collection = useGameStore((s) => s.collection);
  const counters = useGameStore((s) => s.collectionCounters);
  const entries = Object.values(collection).sort((a, b) => b.foundAt - a.foundAt);
  const totalFound = entries.length;

  return (
    <View style={tabPanelStyle.panel}>
      <ScrollView style={tabPanelStyle.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Items Found</Text>
        <Text style={styles.summaryCount}>{totalFound}</Text>
      </View>

      <View style={styles.counters}>
        <Text style={styles.counter}>Common {counters.common}</Text>
        <Text style={[styles.counter, { color: rarityColors.rare }]}>Rare {counters.rare}</Text>
        <Text style={[styles.counter, { color: rarityColors.epic }]}>Epic {counters.epic}</Text>
        <Text style={[styles.counter, { color: rarityColors.legendary }]}>Legendary {counters.legendary}</Text>
        <Text style={[styles.counter, { color: rarityColors.mythic }]}>Mythic {counters.mythic}</Text>
        <Text style={styles.counter}>Ancient {counters.ancient}</Text>
      </View>

      <Text style={styles.note}>
        Permanent record of every unique item discovered. Deleted items remain here.
      </Text>

      {entries.length === 0 ? (
        <Text style={styles.empty}>No items discovered yet. Run the crypt!</Text>
      ) : (
        entries.map((entry) => (
          <View key={entry.fingerprint} style={styles.entry}>
            <Text style={[styles.entryName, { color: rarityColors[entry.rarity] }]}>
              {entry.name}
            </Text>
            <Text style={styles.entryMeta}>
              {rarityLabels[entry.rarity]} · {getSlotLabel(entry.slot)} · Depth {entry.depthFound}
              {entry.quality === 'ancient' ? ' · Ancient' : ''}
            </Text>
          </View>
        ))
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: 'center', marginBottom: 16 },
  summaryTitle: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  summaryCount: { fontSize: 32, color: colors.cta, fontWeight: '300', marginTop: 4 },
  counters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  counter: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  note: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
  entry: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  entryName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  entryMeta: { fontSize: 11, color: colors.textMuted },
});
