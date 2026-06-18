import { StyleSheet, Text, View } from 'react-native';
import { BUILD_AFFIX_LABELS } from '../constants/statRegistry';
import { getSlotLabel } from '../constants/slots';
import { colors, rarityColors } from '../constants/theme';
import { getAffixDisplayLines } from '../systems/powerCalculator';
import type { Item } from '../types/game';

interface ItemTooltipProps {
  item: Item;
  showFoundBy?: string;
  showPower?: boolean;
  compact?: boolean;
}

const QUALITY_LABELS: Record<Item['quality'], string> = {
  poor: 'Poor',
  normal: '',
  great: 'Great',
  perfect: 'Perfect',
  ancient: 'Ancient',
};

export function ItemTooltip({
  item,
  showFoundBy,
  showPower = true,
  compact,
}: ItemTooltipProps) {
  const nameColor = rarityColors[item.rarity];
  const qualityLabel = QUALITY_LABELS[item.quality];
  const groups = getAffixDisplayLines(item);

  return (
    <View style={[styles.tooltip, compact && styles.tooltipCompact]}>
      <Text style={[styles.name, { color: nameColor }, compact && styles.nameCompact]} numberOfLines={2}>
        {item.name.toUpperCase()}
      </Text>
      <Text style={[styles.baseType, compact && styles.baseTypeCompact]}>
        {getSlotLabel(item.slot).toUpperCase()}
        {qualityLabel ? ` · ${qualityLabel.toUpperCase()}` : ''}
      </Text>

      {item.defense !== undefined && (
        <Text style={styles.defense}>
          Defense: <Text style={styles.defenseValue}>{item.defense}</Text>
        </Text>
      )}

      {groups.map((group) => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.groupLabel}>{group.category}</Text>
          {group.lines.map((line, i) => (
            <Text key={`${group.category}-${i}`} style={[styles.affix, compact && styles.affixCompact]}>
              {line}
            </Text>
          ))}
        </View>
      ))}

      {item.buildAffix && !groups.some((g) => g.category === 'Build') && (
        <Text style={styles.affix}>{BUILD_AFFIX_LABELS[item.buildAffix]}</Text>
      )}

      {showPower && (
        <Text style={[styles.power, compact && styles.powerCompact]}>
          Power {item.power.toLocaleString()}
        </Text>
      )}

      {showFoundBy && <Text style={styles.foundBy}>Found by: {showFoundBy}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  tooltipCompact: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  nameCompact: {
    fontSize: 14,
    marginBottom: 2,
  },
  baseType: {
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  baseTypeCompact: {
    fontSize: 10,
    marginBottom: 6,
  },
  defense: {
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  defenseValue: {
    color: '#4A9EFF',
  },
  group: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  groupLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  affix: {
    fontSize: 13,
    color: '#5B7FFF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 2,
  },
  affixCompact: {
    fontSize: 11,
    lineHeight: 16,
  },
  power: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 12,
    letterSpacing: 1,
  },
  powerCompact: {
    fontSize: 9,
    marginTop: 8,
  },
  foundBy: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 16,
    letterSpacing: 0.5,
  },
});
