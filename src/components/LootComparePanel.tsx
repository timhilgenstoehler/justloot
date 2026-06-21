import { Platform, StyleSheet, Text, View } from 'react-native';
import { STAT_BY_ID } from '../constants/statRegistry';
import { colors } from '../constants/theme';
import type { Item, StatId } from '../types/game';

function statMap(item: Item): Map<StatId, number> {
  return new Map(item.stats.map((s) => [s.id, s.value]));
}

function AffixDiff({ current, pending }: { current: Item; pending: Item }) {
  const currentMap = statMap(current);
  const pendingMap = statMap(pending);
  const allIds = new Set([...currentMap.keys(), ...pendingMap.keys()]);

  const lines: { id: string; delta: number; display: string }[] = [];

  for (const id of allIds) {
    const cur = currentMap.get(id) ?? 0;
    const next = pendingMap.get(id) ?? 0;
    if (cur === next) continue;
    const def = STAT_BY_ID[id];
    const display = pendingMap.has(id)
      ? pending.stats.find((s) => s.id === id)?.display ?? def?.format(next) ?? id
      : def?.format(cur) ?? id;
    lines.push({ id, delta: next - cur, display });
  }

  if (lines.length === 0) {
    return (
      <Text style={styles.noDiff}>
        Different affix mix — compare builds, not just power.
      </Text>
    );
  }

  return (
    <View style={styles.diffBox}>
      <Text style={styles.diffTitle}>Affix Changes</Text>
      {lines.map((line) => (
        <Text
          key={line.id}
          style={[styles.diffLine, { color: line.delta > 0 ? '#4ADE80' : '#EF4444' }]}
        >
          {line.delta > 0 ? '▲' : '▼'} {line.display}
        </Text>
      ))}
    </View>
  );
}

function ItemSummary({ label, item }: { label: string; item: Item }) {
  return (
    <View style={styles.itemBlock}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemName}>{item.name.toUpperCase()}</Text>
      <Text style={styles.itemPower}>Power {item.power.toLocaleString()}</Text>
      {item.stats.slice(0, 4).map((stat) => (
        <Text key={stat.id} style={styles.itemAffix}>
          {stat.display}
        </Text>
      ))}
      {item.stats.length > 4 && (
        <Text style={styles.moreAffixes}>+{item.stats.length - 4} more</Text>
      )}
    </View>
  );
}

interface LootComparePanelProps {
  currentItem: Item;
  newItem: Item;
  title?: string;
  compact?: boolean;
}

export function LootComparePanel({
  currentItem,
  newItem,
  title = 'Compare',
  compact,
}: LootComparePanelProps) {
  const powerDiff = newItem.power - currentItem.power;
  const diffLabel = powerDiff >= 0 ? `+${powerDiff}` : `${powerDiff}`;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.columns}>
        <ItemSummary label="Current" item={currentItem} />
        <View style={styles.vs}>
          <Text style={styles.vsText}>vs</Text>
        </View>
        <ItemSummary label="New" item={newItem} />
      </View>

      <View style={styles.powerDelta}>
        <Text style={styles.powerDeltaLabel}>Power Difference</Text>
        <Text
          style={[
            styles.powerDeltaValue,
            { color: powerDiff >= 0 ? '#4ADE80' : '#EF4444' },
          ]}
        >
          {diffLabel}
        </Text>
      </View>

      <AffixDiff current={currentItem} pending={newItem} />
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containerCompact: {
    paddingVertical: 4,
    marginBottom: 12,
  },
  title: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 16
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  itemBlock: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    backgroundColor: '#0A0A0E',
  },
  itemLabel: {
    fontFamily: mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  itemName: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemPower: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.cta,
    marginBottom: 8,
  },
  itemAffix: {
    fontFamily: mono,
    fontSize: 10,
    color: '#5B7FFF',
    lineHeight: 16,
  },
  moreAffixes: {
    fontFamily: mono,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },
  vs: {
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  vsText: {
    fontFamily: mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  powerDelta: {
    alignItems: 'center',
    marginBottom: 16,
  },
  powerDeltaLabel: {
    fontFamily: mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  powerDeltaValue: {
    fontFamily: mono,
    fontSize: 22,
    fontWeight: '700',
  },
  diffBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    backgroundColor: '#0A0A0E',
  },
  diffTitle: {
    fontFamily: mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  diffLine: {
    fontFamily: mono,
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 4,
  },
  noDiff: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
