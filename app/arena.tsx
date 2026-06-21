import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';

/** Transient route — auto-starts arena fight when opened from leaderboard. */
export default function ArenaScreen() {
  const { opponent } = useLocalSearchParams<{ opponent?: string }>();
  const startedOpponentRef = useRef<string | null>(null);
  const startArenaRun = useGameStore((s) => s.startArenaRun);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const disabled = runPhase !== 'idle' || showResult;

  useEffect(() => {
    if (!opponent || disabled || startedOpponentRef.current === opponent) return;
    startedOpponentRef.current = opponent;
    startArenaRun(opponent);
  }, [opponent, disabled, startArenaRun]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <ActivityIndicator color={colors.cta} size="large" />
        <Text style={styles.text}>Entering Arena…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
