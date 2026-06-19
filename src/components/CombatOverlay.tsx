import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CombatHealthBar } from './CombatHealthBar';
import { CombatSummary } from './CombatSummary';
import { LootRevealFlow } from './LootRevealFlow';
import { colors, rarityColors } from '../constants/theme';
import type { CombatLogLine, CombatResult } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { modalBackdropStyle } from '../utils/modalLayout';

const TARGET_PLAYBACK_MS = 10000;
const MIN_LINE_DELAY = 70;
const MAX_LINE_DELAY = 180;

function getLineDelay(lineCount: number): number {
  const delay = Math.floor(TARGET_PLAYBACK_MS / Math.max(lineCount, 1));
  return Math.min(MAX_LINE_DELAY, Math.max(MIN_LINE_DELAY, delay));
}

function getLineColor(line: CombatLogLine): string {
  if (line.itemRarity) return rarityColors[line.itemRarity];
  const { type, text } = line;
  if (type === 'outcome') {
    return text.includes('Victory') ? '#4ADE80' : '#EF4444';
  }
  if (type === 'proc') return '#5B7FFF';
  if (text.includes('Critical Hit')) return '#F59E0B';
  if (type === 'header' || type === 'encounter') return colors.textPrimary;
  if (type === 'round') return colors.textMuted;
  return colors.textPrimary;
}

function LogLine({ line }: { line: CombatLogLine }) {
  const color = getLineColor(line);
  if (line.text === '') return <View style={styles.spacer} />;
  return (
    <Text style={[styles.logLine, { color }, line.type === 'round' && line.text.startsWith('Round') && styles.roundLine]}>
      {line.text}
    </Text>
  );
}

function getLatestHp(visibleLines: CombatLogLine[], combatResult: CombatResult) {
  const latest = visibleLines.length > 0 ? visibleLines[visibleLines.length - 1] : null;
  return {
    playerHp: latest?.playerHp ?? combatResult.playerMaxHp,
    playerMaxHp: latest?.playerMaxHp ?? combatResult.playerMaxHp,
    enemyHp: latest?.enemyHp ?? combatResult.enemyMaxHp,
    enemyMaxHp: latest?.enemyMaxHp ?? combatResult.enemyMaxHp,
  };
}

export function CombatOverlay() {
  const runPhase = useGameStore((s) => s.runPhase);
  const runMode = useGameStore((s) => s.runMode);
  const combatResult = useGameStore((s) => s.combatResult);
  const combatLogIndex = useGameStore((s) => s.combatLogIndex);
  const advanceCombatLog = useGameStore((s) => s.advanceCombatLog);
  const enterVictoryPhase = useGameStore((s) => s.enterVictoryPhase);
  const finishCombatVictory = useGameStore((s) => s.finishCombatVictory);
  const claimVictoryLoot = useGameStore((s) => s.claimVictoryLoot);
  const finishCombatDefeat = useGameStore((s) => s.finishCombatDefeat);
  const dismissArenaVictory = useGameStore((s) => s.dismissArenaVictory);
  const showResult = useGameStore((s) => s.showResult);
  const pendingLoot = useGameStore((s) => s.pendingLoot);

  const listRef = useRef<FlatList<CombatLogLine>>(null);
  const finishedRef = useRef(false);

  const showLootReveal = showResult && pendingLoot !== null;
  const isReviewingVictory = runPhase === 'victory' && combatResult !== null;
  const isPlayingCombat = runPhase === 'combat' && combatResult !== null;
  const showCombat = isPlayingCombat || isReviewingVictory;
  const showOverlay = showCombat || showLootReveal;

  const visibleLines = combatResult?.log.slice(0, combatLogIndex) ?? [];
  const displayLines = visibleLines.filter((line) => line.type !== 'outcome' && line.type !== 'health');
  const isComplete = combatResult !== null && combatLogIndex >= combatResult.log.length;
  const hp = combatResult ? getLatestHp(visibleLines, combatResult) : null;
  const enemyLabel = combatResult?.enemyName.toUpperCase() ?? 'ENEMY';

  const handlePlaybackComplete = useCallback(() => {
    if (finishedRef.current || !combatResult) return;
    finishedRef.current = true;

    if (combatResult.victory) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (runMode === 'arena') {
        finishCombatVictory();
      } else {
        enterVictoryPhase();
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      finishCombatDefeat();
    }
  }, [combatResult, runMode, enterVictoryPhase, finishCombatVictory, finishCombatDefeat]);

  useEffect(() => {
    if (!isPlayingCombat || !combatResult) return;

    if (combatLogIndex === 0) {
      finishedRef.current = false;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (combatLogIndex >= combatResult.log.length) {
      const timer = setTimeout(handlePlaybackComplete, 400);
      return () => clearTimeout(timer);
    }

    const currentLine = combatResult.log[combatLogIndex];
    const baseDelay = getLineDelay(combatResult.log.length);
    const extraPause =
      currentLine?.type === 'round' || currentLine?.type === 'outcome'
        ? 100
        : 0;

    const timer = setTimeout(() => advanceCombatLog(), baseDelay + extraPause);
    return () => clearTimeout(timer);
  }, [isPlayingCombat, combatResult, combatLogIndex, advanceCombatLog, handlePlaybackComplete]);

  useEffect(() => {
    if (displayLines.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [displayLines.length]);

  if (!showOverlay) return null;

  const showVictorySummary = isComplete && combatResult?.victory && isReviewingVictory;
  const showVictoryButton = showVictorySummary;

  return (
    <Modal visible animationType="fade" transparent statusBarTranslucent>
      <SafeAreaView
        style={showLootReveal ? styles.lootOverlay : styles.overlay}
        edges={['top', 'bottom']}
      >
        {showLootReveal ? (
          <LootRevealFlow />
        ) : combatResult ? (
          <>
      <Text style={styles.location}>{combatResult.locationName}</Text>
      <Text style={styles.depth}>Depth {combatResult.depth}</Text>

      <View style={styles.terminal}>
        {hp && (
          <View style={styles.healthRow}>
            <View style={styles.healthCol}>
              <CombatHealthBar
                label="YOU"
                current={hp.playerHp}
                max={hp.playerMaxHp}
                compact
              />
            </View>
            <View style={[styles.healthCol, styles.healthColEnemy]}>
              <CombatHealthBar
                label={enemyLabel}
                current={hp.enemyHp}
                max={hp.enemyMaxHp}
                compact
                align="right"
              />
            </View>
          </View>
        )}
        <FlatList
          ref={listRef}
          data={displayLines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LogLine line={item} />}
          style={styles.logList}
          contentContainerStyle={styles.logContent}
          showsVerticalScrollIndicator={false}
        />
        {!isComplete && <Text style={styles.cursor}>_</Text>}
      </View>

      {showVictorySummary && (
        <View style={styles.victoryFooter}>
          <Text style={styles.victoryTitle}>VICTORY</Text>
          <Text style={styles.survivalLine}>
            You survived with {combatResult.playerFinalHp} HP.
          </Text>
          {runMode === 'dungeon' && <Text style={styles.lootHint}>Loot Found.</Text>}
          {runMode === 'arena' && <CombatSummary result={combatResult} variant="victory" />}
        </View>
      )}

      {showVictoryButton && runMode === 'dungeon' && (
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            claimVictoryLoot();
          }}
        >
          <Text style={styles.actionText}>REVEAL</Text>
        </Pressable>
      )}

      {showVictoryButton && runMode === 'arena' && (
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            dismissArenaVictory();
          }}
        >
          <Text style={styles.actionText}>Continue</Text>
        </Pressable>
      )}
          </>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  overlay: modalBackdropStyle({
    backgroundColor: 'rgba(8, 8, 12, 0.97)',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 16 : 12,
    paddingBottom: 8,
    overflow: 'hidden',
  }) as ViewStyle,
  lootOverlay: modalBackdropStyle({
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  }) as ViewStyle,
  location: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  depth: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  terminal: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: '#2A2A35',
    borderRadius: 4,
    backgroundColor: '#0A0A0E',
    padding: 12,
  },
  logList: {
    flex: 1,
  },
  healthRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  healthCol: {
    flex: 1,
    minWidth: 0,
  },
  healthColEnemy: {
    alignItems: 'flex-end',
  },
  logContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  logLine: {
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  roundLine: {
    fontWeight: '600',
    marginTop: 4,
  },
  spacer: { height: 8 },
  cursor: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.cta,
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  lootHint: {
    fontFamily: mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  victoryFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    flexShrink: 0,
  },
  victoryTitle: {
    fontFamily: mono,
    fontSize: 20,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  survivalLine: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionButton: {
    marginTop: 12,
    flexShrink: 0,
    backgroundColor: colors.cta,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  actionPressed: { opacity: 0.85 },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
