import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getPackOddsComparison,
  type LootPackDef,
} from '../constants/lootPacks';
import { colors, rarityColors, rarityLabels } from '../constants/theme';
import type { Rarity } from '../types/game';

interface LootPackCardProps {
  pack: LootPackDef;
  depth: number;
  dust: number;
  onPurchase: () => void;
}

const SHOW_RARITIES: Rarity[] = ['rare', 'epic', 'legendary', 'mythic'];

export function LootPackCard({ pack, depth, dust, onPurchase }: LootPackCardProps) {
  const odds = getPackOddsComparison(depth, pack);
  const canAfford = dust >= pack.dustCost;
  const boostPct = Math.round((pack.rarityBoost - 1) * 100);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{pack.name}</Text>
      <Text style={styles.tagline}>{pack.tagline}</Text>
      <Text style={styles.boost}>+{boostPct}% rare+ drop rates vs runs</Text>

      <View style={styles.oddsTable}>
        <View style={styles.oddsHeader}>
          <Text style={[styles.oddsTh, styles.oddsRarity]}> </Text>
          <Text style={styles.oddsTh}>Run</Text>
          <Text style={[styles.oddsTh, styles.oddsPack]}>Pack</Text>
        </View>
        {SHOW_RARITIES.map((rarity) => {
          const row = odds.find((o) => o.rarity === rarity)!;
          const improved = row.pack > row.normal;
          return (
            <View key={rarity} style={styles.oddsRow}>
              <Text style={[styles.oddsTd, styles.oddsRarity, { color: rarityColors[rarity] }]}>
                {rarityLabels[rarity]}
              </Text>
              <Text style={styles.oddsTd}>{row.normal.toFixed(1)}%</Text>
              <Text style={[styles.oddsTd, styles.oddsPack, improved && styles.oddsImproved]}>
                {row.pack.toFixed(1)}%
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
        onPress={onPurchase}
        disabled={!canAfford}
      >
        <Text style={styles.buyText}>
          Open · {pack.dustCost} Dust
        </Text>
      </Pressable>
      {!canAfford && (
        <Text style={styles.needDust}>Need {pack.dustCost - dust} more dust</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 6,
    backgroundColor: '#121218',
    padding: 18,
    marginBottom: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.cta,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  boost: {
    fontSize: 10,
    color: '#4ADE80',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  oddsTable: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  oddsHeader: {
    flexDirection: 'row',
    backgroundColor: '#0D0D12',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  oddsRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  oddsTh: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  oddsTd: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  oddsRarity: {
    flex: 1.2,
    textAlign: 'left',
  },
  oddsPack: {
    color: colors.cta,
  },
  oddsImproved: {
    color: '#4ADE80',
  },
  buyBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.cta,
    borderRadius: 4,
  },
  buyBtnDisabled: {
    opacity: 0.45,
  },
  buyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 1,
  },
  needDust: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
