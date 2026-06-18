import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { gameAlert } from '../src/utils/gameAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemCard } from '../src/components/ItemCard';
import { STAT_BY_ID } from '../src/constants/statRegistry';
import { colors } from '../src/constants/theme';
import type { Item, SecondaryStat, StatId } from '../src/types/game';
import { useGameStore } from '../src/store/gameStore';

function exitComparison(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/');
}

function statMap(item: Item): Map<StatId, SecondaryStat> {
  return new Map(item.stats.map((s) => [s.id, s]));
}

function AffixDiff({
  current,
  pending,
}: {
  current: Item;
  pending: Item;
}) {
  const currentMap = statMap(current);
  const pendingMap = statMap(pending);
  const allIds = new Set([...currentMap.keys(), ...pendingMap.keys()]);

  const lines: { label: string; delta: number; text: string }[] = [];

  for (const id of allIds) {
    const cur = currentMap.get(id)?.value ?? 0;
    const next = pendingMap.get(id)?.value ?? 0;
    if (cur === next) continue;
    const delta = next - cur;
    const def = STAT_BY_ID[id];
    const label = def?.format(Math.abs(next)) ?? id;
    lines.push({
      label: id,
      delta,
      text: delta > 0 ? `+${delta} ${label.replace(/^\+\d+\s?/, '')}` : `${delta}`,
    });
  }

  if (lines.length === 0) {
    return <Text style={styles.noDiff}>Different affix mix — compare builds, not just power.</Text>;
  }

  return (
    <View style={styles.diffBox}>
      <Text style={styles.diffTitle}>Affix Changes</Text>
      {lines.map((line) => (
        <Text
          key={line.label}
          style={[styles.diffLine, { color: line.delta > 0 ? '#4ADE80' : '#EF4444' }]}
        >
          {line.delta > 0 ? '▲' : '▼'} {pendingMap.get(line.label as StatId)?.display ?? line.text}
          {currentMap.has(line.label as StatId) ? ` (was ${currentMap.get(line.label as StatId)?.value})` : ' (new)'}
        </Text>
      ))}
    </View>
  );
}

export default function ComparisonScreen() {
  const router = useRouter();
  const compareRequest = useGameStore((s) => s.compareRequest);
  const getCompareNewItem = useGameStore((s) => s.getCompareNewItem);
  const getCompareCurrentItem = useGameStore((s) => s.getCompareCurrentItem);
  const confirmEquipReplace = useGameStore((s) => s.confirmEquipReplace);
  const cancelEquip = useGameStore((s) => s.cancelEquip);

  const newItem = getCompareNewItem();
  const currentItem = getCompareCurrentItem();

  if (!compareRequest || !newItem || !currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable
          style={({ pressed }) => [styles.keepButton, pressed && styles.pressed]}
          onPress={() => exitComparison(router)}
        >
          <Text style={styles.keepText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const difference = newItem.power - currentItem.power;
  const diffLabel = difference >= 0 ? `+${difference}` : `${difference}`;

  const handleReplace = () => {
    const result = confirmEquipReplace();
    if (result === 'full') {
      gameAlert('Inventory Full', 'Free up a slot before replacing — your current item returns to inventory.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    exitComparison(router);
  };

  const handleKeep = () => {
    const result = cancelEquip();
    if (result === 'full') {
      gameAlert('Inventory Full', 'Cannot stash this item — inventory is full.');
      return;
    }
    exitComparison(router);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Compare</Text>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Current</Text>
          <ItemCard item={currentItem} compact />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>New</Text>
          <ItemCard item={newItem} compact />
        </View>

        <AffixDiff current={currentItem} pending={newItem} />
      </ScrollView>

      <View style={styles.difference}>
        <Text style={styles.diffLabel}>Power delta</Text>
        <Text style={[styles.diffValue, { color: difference >= 0 ? '#4ADE80' : '#EF4444' }]}>
          {diffLabel}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.replaceButton, pressed && styles.pressed]}
          onPress={handleReplace}
        >
          <Text style={styles.replaceText}>Replace</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.keepButton, pressed && styles.pressed]}
          onPress={handleKeep}
        >
          <Text style={styles.keepText}>Keep Current</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 24,
  },
  scroll: { flex: 1, marginBottom: 16 },
  section: { marginBottom: 8 },
  sectionLabel: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 16,
  },
  diffBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    backgroundColor: '#0A0A0E',
  },
  diffTitle: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  diffLine: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  noDiff: {
    marginTop: 16,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  difference: { alignItems: 'center', marginVertical: 16 },
  diffLabel: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  diffValue: { fontSize: 20, fontWeight: '600' },
  actions: { marginTop: 'auto', gap: 12 },
  replaceButton: {
    backgroundColor: colors.cta,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  keepButton: {
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  replaceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  keepText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  pressed: { opacity: 0.8 },
});
