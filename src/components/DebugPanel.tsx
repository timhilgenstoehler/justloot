import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { rarityColors, rarityLabels, colors } from '../constants/theme';
import { RARITIES } from '../constants/rarities';
import type { Rarity } from '../types/game';
import {
  DEBUG_WEIGHT_PRESETS,
  useDebugStore,
  type DebugForceRarity,
  type DebugRarityWeights,
} from '../store/debugStore';
import { BalanceSimPanel } from './BalanceSimPanel';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FORCE_OPTIONS: DebugForceRarity[] = ['off', ...RARITIES];

function WeightRow({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color?: string;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));

  return (
    <View style={styles.weightRow}>
      <Text style={[styles.weightLabel, color ? { color } : null]}>{label}</Text>
      <TextInput
        style={styles.weightInput}
        value={text}
        keyboardType="decimal-pad"
        onChangeText={(t) => {
          setText(t);
          const n = parseFloat(t);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    </View>
  );
}

export function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const [simOpen, setSimOpen] = useState(false);
  const useCustomWeights = useDebugStore((s) => s.useCustomWeights);
  const customWeights = useDebugStore((s) => s.customWeights);
  const forceRarity = useDebugStore((s) => s.forceRarity);
  const depthOverride = useDebugStore((s) => s.depthOverride);
  const setUseCustomWeights = useDebugStore((s) => s.setUseCustomWeights);
  const setCustomWeights = useDebugStore((s) => s.setCustomWeights);
  const applyWeightPreset = useDebugStore((s) => s.applyWeightPreset);
  const setForceRarity = useDebugStore((s) => s.setForceRarity);
  const setDepthOverride = useDebugStore((s) => s.setDepthOverride);
  const resetFreshCharacter = useDebugStore((s) => s.resetFreshCharacter);
  const equipFullRarity = useDebugStore((s) => s.equipFullRarity);

  const updateWeight = (key: keyof DebugRarityWeights, value: number) => {
    setCustomWeights({ [key]: value });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Debug Mode</Text>
          <Text style={styles.subtitle}>Local only · no cloud save</Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.section}>Character</Text>
            <View style={styles.row}>
              <Pressable style={styles.actionBtn} onPress={resetFreshCharacter}>
                <Text style={styles.actionText}>Fresh Character</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => equipFullRarity('legendary')}>
                <Text style={styles.actionText}>Full Legendary</Text>
              </Pressable>
            </View>
            <View style={styles.row}>
              <Pressable style={styles.actionBtn} onPress={() => equipFullRarity('mythic')}>
                <Text style={styles.actionText}>Full Mythic</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => equipFullRarity('epic')}>
                <Text style={styles.actionText}>Full Epic</Text>
              </Pressable>
            </View>

            <Text style={styles.section}>Loot depth</Text>
            <View style={styles.depthRow}>
              <Pressable
                style={styles.depthBtn}
                onPress={() => setDepthOverride(depthOverride - 10)}
              >
                <Text style={styles.depthBtnText}>−10</Text>
              </Pressable>
              <Text style={styles.depthValue}>Depth {depthOverride}</Text>
              <Pressable
                style={styles.depthBtn}
                onPress={() => setDepthOverride(depthOverride + 10)}
              >
                <Text style={styles.depthBtnText}>+10</Text>
              </Pressable>
            </View>

            <Text style={styles.section}>Force next loot rarity</Text>
            <View style={styles.chipRow}>
              {FORCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, forceRarity === opt && styles.chipActive]}
                  onPress={() => setForceRarity(opt)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      forceRarity === opt && styles.chipTextActive,
                      opt !== 'off' && { color: rarityColors[opt as Rarity] },
                    ]}
                  >
                    {opt === 'off' ? 'Off' : rarityLabels[opt as Rarity]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.section}>Loot weight presets</Text>
            <View style={styles.chipRow}>
              {(
                [
                  ['default', 'Default'],
                  ['allLegendary', '100% Leg'],
                  ['allMythic', '100% Myth'],
                  ['allEpic', '100% Epic'],
                  ['balancedHigh', 'High tier'],
                ] as const
              ).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[
                    styles.chip,
                    useCustomWeights &&
                      JSON.stringify(customWeights) ===
                        JSON.stringify(DEBUG_WEIGHT_PRESETS[key]) &&
                      styles.chipActive,
                  ]}
                  onPress={() => applyWeightPreset(key)}
                >
                  <Text style={styles.chipText}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.toggleRow}
              onPress={() => setUseCustomWeights(!useCustomWeights)}
            >
              <Text style={styles.toggleLabel}>Custom drop weights</Text>
              <Text style={styles.toggleValue}>{useCustomWeights ? 'On' : 'Off'}</Text>
            </Pressable>

            {useCustomWeights && (
              <View style={styles.weightsBox}>
                {RARITIES.map((r) => (
                  <WeightRow
                    key={r}
                    label={rarityLabels[r]}
                    value={customWeights[r]}
                    color={rarityColors[r]}
                    onChange={(v) => updateWeight(r, v)}
                  />
                ))}
              </View>
            )}

            <Text style={styles.section}>Balance</Text>
            <Pressable style={styles.simBtn} onPress={() => setSimOpen(true)}>
              <Text style={styles.simText}>Run Depth Simulation</Text>
            </Pressable>
            <Text style={styles.simHint}>
              God-roll epics vs trash legendaries · tier depth limits
            </Text>
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
      <BalanceSimPanel visible={simOpen} onClose={() => setSimOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    maxHeight: '88%',
    padding: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  scroll: { maxHeight: 480 },
  section: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1A1810',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.cta,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cta,
    letterSpacing: 1,
  },
  depthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  depthBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
  },
  depthBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  depthValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  chipActive: {
    borderColor: colors.cta,
    backgroundColor: '#1A1810',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors.cta,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  toggleValue: {
    fontSize: 12,
    color: colors.cta,
    fontWeight: '700',
  },
  weightsBox: {
    gap: 8,
    marginBottom: 12,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightLabel: {
    fontSize: 11,
    fontWeight: '600',
    width: 90,
  },
  weightInput: {
    flex: 1,
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: 'right',
  },
  simBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#102218',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4ADE80',
    marginBottom: 6,
  },
  simText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 1,
  },
  simHint: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 14,
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surfaceBorder,
    borderRadius: 4,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
});
