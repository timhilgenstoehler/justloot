import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, rarityColors } from '../constants/theme';
import { useDebugStore } from '../store/debugStore';
import { BalanceCurvesPanel } from './BalanceCurvesPanel';
import {
  formatBalanceSimSummary,
  formatRollCompareSummary,
  runBalanceSimulation,
  runRollCompareSimulation,
  type BalanceSimResult,
  type RollCompareResult,
  type SimGearTier,
} from '../systems/balanceSimulator';

interface BalanceSimPanelProps {
  visible: boolean;
  onClose: () => void;
}

type SimMode = 'tiers' | 'rolls';

const TIER_ORDER: SimGearTier[] = ['epic', 'legendary', 'mythic'];

function winRateColor(rate: number): string {
  if (rate >= 1) return '#22C55E';
  if (rate >= 0.9) return '#84CC16';
  if (rate >= 0.5) return '#F59E0B';
  return '#EF4444';
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={text}
        keyboardType="number-pad"
        onChangeText={(t) => {
          setText(t);
          const n = parseInt(t, 10);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    </View>
  );
}

function TierResults({
  result,
  showAllDepths,
  onToggleDepths,
}: {
  result: BalanceSimResult;
  showAllDepths: boolean;
  onToggleDepths: () => void;
}) {
  const depthRows =
    result.tiers[0]?.rows.filter(
      (r) => showAllDepths || r.depth % 5 === 0 || r.depth === 1 || r.winRate < 1,
    ) ?? [];

  return (
    <View style={styles.results}>
      <Text style={styles.resultsMeta}>
        {result.totalCombats.toLocaleString()} combats in {result.durationMs}ms · logged to
        console
      </Text>

      <View style={styles.summaryTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.thTier]}>Tier</Text>
          <Text style={styles.th}>Power</Text>
          <Text style={styles.th}>100%</Text>
          <Text style={styles.th}>90%</Text>
          <Text style={styles.th}>50%</Text>
          <Text style={styles.th}>Fail</Text>
        </View>
        {result.tiers.map((tier) => (
          <View key={tier.tier} style={styles.tableRow}>
            <Text style={[styles.td, styles.tdTier, { color: rarityColors[tier.tier] }]}>
              {tier.tier.toUpperCase()}
            </Text>
            <Text style={styles.td}>{Math.round(tier.avgPower)}</Text>
            <Text style={styles.td}>{tier.depthLimit100 ?? '—'}</Text>
            <Text style={styles.td}>{tier.depthLimit90 ?? '—'}</Text>
            <Text style={styles.td}>{tier.depthLimit50 ?? '—'}</Text>
            <Text style={styles.td}>{tier.firstFailDepth ?? '—'}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.toggleDepths} onPress={onToggleDepths}>
        <Text style={styles.toggleDepthsText}>
          {showAllDepths ? 'Show key depths' : 'Show all depths'}
        </Text>
      </Pressable>

      <View style={styles.depthTable}>
        <View style={styles.depthHeader}>
          <Text style={[styles.dh, styles.dhDepth]}>D</Text>
          {TIER_ORDER.map((t) => (
            <Text key={t} style={[styles.dh, { color: rarityColors[t] }]}>
              {t.slice(0, 3).toUpperCase()}
            </Text>
          ))}
        </View>
        {depthRows.map((row) => (
          <View key={row.depth} style={styles.depthRow}>
            <Text style={[styles.dd, styles.ddDepth]}>{row.depth}</Text>
            {TIER_ORDER.map((tier) => {
              const d = result.tiers
                .find((t) => t.tier === tier)
                ?.rows.find((r) => r.depth === row.depth);
              const rate = d?.winRate ?? 0;
              return (
                <Text key={tier} style={[styles.dd, { color: winRateColor(rate) }]}>
                  {d ? `${Math.round(rate * 100)}` : '—'}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function RollCompareResults({
  result,
  showAllDepths,
  onToggleDepths,
}: {
  result: RollCompareResult;
  showAllDepths: boolean;
  onToggleDepths: () => void;
}) {
  const isGold = result.crossoverDepth !== null;
  const depthRows = result.pairedRows.filter(
    (r) => showAllDepths || r.depth % 5 === 0 || r.depth === 1 || r.epicAhead,
  );

  const totalPaired = result.pairedRows.reduce(
    (sum, r) => sum + r.epicGodWins + r.legTrashWins + r.bothLose,
    0,
  );
  const totalEpicPairedWins = result.pairedRows.reduce((sum, r) => sum + r.epicGodWins, 0);

  return (
    <View style={styles.results}>
      <Text style={styles.resultsMeta}>
        {result.totalCombats.toLocaleString()} combats in {result.durationMs}ms · logged to
        console
      </Text>

      <View style={[styles.verdictBox, isGold ? styles.verdictGold : styles.verdictMuted]}>
        <Text style={[styles.verdictText, isGold ? styles.verdictTextGold : null]}>
          {result.verdict}
        </Text>
      </View>

      <View style={styles.summaryTable}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.thTierWide]}>Build</Text>
          <Text style={styles.th}>Power</Text>
          <Text style={styles.th}>100%</Text>
          <Text style={styles.th}>90%</Text>
          <Text style={styles.th}>50%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.td, styles.tdTierWide, { color: rarityColors.epic }]}>
            Epic God
          </Text>
          <Text style={styles.td}>{Math.round(result.epicGod.avgPower)}</Text>
          <Text style={styles.td}>{result.epicGod.depthLimit100 ?? '—'}</Text>
          <Text style={styles.td}>{result.epicGod.depthLimit90 ?? '—'}</Text>
          <Text style={styles.td}>{result.epicGod.depthLimit50 ?? '—'}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.td, styles.tdTierWide, { color: rarityColors.legendary }]}>
            Leg Trash
          </Text>
          <Text style={styles.td}>{Math.round(result.legTrash.avgPower)}</Text>
          <Text style={styles.td}>{result.legTrash.depthLimit100 ?? '—'}</Text>
          <Text style={styles.td}>{result.legTrash.depthLimit90 ?? '—'}</Text>
          <Text style={styles.td}>{result.legTrash.depthLimit50 ?? '—'}</Text>
        </View>
      </View>

      <Text style={styles.legend}>
        Crossover depth {result.crossoverDepth ?? 'never'} · Epic ahead at{' '}
        {result.epicAheadDepths}/{result.config.maxSimDepth} depths · Paired wins{' '}
        {totalEpicPairedWins}/{totalPaired} ({Math.round((totalEpicPairedWins / Math.max(1, totalPaired)) * 100)}%)
      </Text>

      <Pressable style={styles.toggleDepths} onPress={onToggleDepths}>
        <Text style={styles.toggleDepthsText}>
          {showAllDepths ? 'Show key depths' : 'Show all depths'}
        </Text>
      </Pressable>

      <View style={styles.depthTable}>
        <View style={styles.depthHeader}>
          <Text style={[styles.dh, styles.dhDepth]}>D</Text>
          <Text style={[styles.dh, { color: rarityColors.epic }]}>EPIC</Text>
          <Text style={[styles.dh, { color: rarityColors.legendary }]}>LEG</Text>
          <Text style={styles.dh}>H2H</Text>
        </View>
        {depthRows.map((row) => {
          const pairedTotal = row.epicGodWins + row.legTrashWins + row.bothLose;
          const h2h =
            pairedTotal > 0
              ? `${Math.round((row.epicGodWins / pairedTotal) * 100)}`
              : '—';
          return (
            <View
              key={row.depth}
              style={[styles.depthRow, row.epicAhead && styles.depthRowHighlight]}
            >
              <Text style={[styles.dd, styles.ddDepth]}>{row.depth}</Text>
              <Text style={[styles.dd, { color: winRateColor(row.epicGodWinRate) }]}>
                {Math.round(row.epicGodWinRate * 100)}
              </Text>
              <Text style={[styles.dd, { color: winRateColor(row.legTrashWinRate) }]}>
                {Math.round(row.legTrashWinRate * 100)}
              </Text>
              <Text
                style={[
                  styles.dd,
                  { color: row.epicAhead ? '#4ADE80' : colors.textMuted },
                ]}
              >
                {h2h}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function BalanceSimPanel({ visible, onClose }: BalanceSimPanelProps) {
  const lootDepth = useDebugStore((s) => s.depthOverride);

  const [mode, setMode] = useState<SimMode>('rolls');
  const [maxSimDepth, setMaxSimDepth] = useState(80);
  const [gearSamples, setGearSamples] = useState(5);
  const [runsPerDepth, setRunsPerDepth] = useState(40);
  const [running, setRunning] = useState(false);
  const [tierResult, setTierResult] = useState<BalanceSimResult | null>(null);
  const [rollResult, setRollResult] = useState<RollCompareResult | null>(null);
  const [showAllDepths, setShowAllDepths] = useState(false);

  const clampedConfig = {
    lootDepth,
    maxSimDepth: Math.max(1, Math.min(200, maxSimDepth)),
    gearSamples: Math.max(1, Math.min(20, gearSamples)),
    runsPerDepth: Math.max(5, Math.min(200, runsPerDepth)),
  };

  const totalCombats =
    mode === 'tiers'
      ? clampedConfig.maxSimDepth * clampedConfig.runsPerDepth * 3
      : clampedConfig.maxSimDepth * clampedConfig.runsPerDepth * 3;

  const handleRun = useCallback(async () => {
    setRunning(true);
    setTierResult(null);
    setRollResult(null);
    await new Promise((r) => setTimeout(r, 16));

    if (mode === 'tiers') {
      const simResult = runBalanceSimulation(clampedConfig);
      console.log(formatBalanceSimSummary(simResult));
      setTierResult(simResult);
    } else {
      const simResult = runRollCompareSimulation(clampedConfig);
      console.log(formatRollCompareSummary(simResult));
      setRollResult(simResult);
    }

    setRunning(false);
  }, [clampedConfig, mode]);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Balance Simulation</Text>
          <Text style={styles.subtitle}>Monte Carlo combat · gear at depth {lootDepth}</Text>

          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeChip, mode === 'rolls' && styles.modeChipActive]}
              onPress={() => setMode('rolls')}
            >
              <Text style={[styles.modeText, mode === 'rolls' && styles.modeTextActive]}>
                God vs Trash
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeChip, mode === 'tiers' && styles.modeChipActive]}
              onPress={() => setMode('tiers')}
            >
              <Text style={[styles.modeText, mode === 'tiers' && styles.modeTextActive]}>
                Tier Sweep
              </Text>
            </Pressable>
          </View>

          {mode === 'rolls' && (
            <Text style={styles.modeHint}>
              Full Epic · perfect god rolls vs Full Legendary · poor trash rolls — same enemy per
              paired fight
            </Text>
          )}

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.fieldRow}>
              <NumField label="Max depth" value={maxSimDepth} onChange={setMaxSimDepth} />
              <NumField label="Gear sets" value={gearSamples} onChange={setGearSamples} />
            </View>
            <View style={styles.fieldRow}>
              <NumField label="Runs/depth" value={runsPerDepth} onChange={setRunsPerDepth} />
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Total combats</Text>
                <Text style={styles.combatCount}>{totalCombats.toLocaleString()}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.runBtn, running && styles.runBtnDisabled]}
              onPress={handleRun}
              disabled={running}
            >
              {running ? (
                <ActivityIndicator color="#0B0B0F" />
              ) : (
                <Text style={styles.runText}>
                  {mode === 'rolls' ? 'Run God vs Trash' : 'Run Tier Sweep'}
                </Text>
              )}
            </Pressable>

            {tierResult && mode === 'tiers' && (
              <TierResults
                result={tierResult}
                showAllDepths={showAllDepths}
                onToggleDepths={() => setShowAllDepths((v) => !v)}
              />
            )}

            {rollResult && mode === 'rolls' && (
              <RollCompareResults
                result={rollResult}
                showAllDepths={showAllDepths}
                onToggleDepths={() => setShowAllDepths((v) => !v)}
              />
            )}

            <BalanceCurvesPanel highlightDepth={lootDepth} />
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    maxHeight: '92%',
    padding: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  modeChipActive: {
    borderColor: '#4ADE80',
    backgroundColor: '#102218',
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  modeTextActive: {
    color: '#4ADE80',
  },
  modeHint: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  scroll: { maxHeight: 500 },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  field: { flex: 1 },
  fieldLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  combatCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  runBtn: {
    marginTop: 4,
    marginBottom: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  runBtnDisabled: { opacity: 0.7 },
  runText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 1,
  },
  results: { marginTop: 4 },
  resultsMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 12,
    textAlign: 'center',
  },
  verdictBox: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  verdictGold: {
    borderColor: '#4ADE80',
    backgroundColor: '#102218',
  },
  verdictMuted: {
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  verdictText: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  verdictTextGold: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#121218',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  th: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  thTier: { flex: 1.4, textAlign: 'left' },
  thTierWide: { flex: 1.6, textAlign: 'left' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  td: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tdTier: { flex: 1.4, textAlign: 'left' },
  tdTierWide: { flex: 1.6, textAlign: 'left' },
  legend: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 14,
  },
  toggleDepths: { marginBottom: 8 },
  toggleDepthsText: {
    fontSize: 10,
    color: colors.cta,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  depthTable: {
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 4,
    marginBottom: 8,
  },
  depthHeader: {
    flexDirection: 'row',
    backgroundColor: '#121218',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dh: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textMuted,
  },
  dhDepth: { flex: 0.6 },
  depthRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  depthRowHighlight: {
    backgroundColor: '#102218',
  },
  dd: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  ddDepth: { flex: 0.6, color: colors.textMuted },
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
