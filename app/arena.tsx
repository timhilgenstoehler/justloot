import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { getArenaOpponentsFromLeaderboard } from '../src/services/leaderboardService';
import { useGameStore } from '../src/store/gameStore';

export default function ArenaScreen() {
  const router = useRouter();
  const { opponent } = useLocalSearchParams<{ opponent?: string }>();
  const startedOpponentRef = useRef<string | null>(null);
  const arenaRating = useGameStore((s) => s.arenaRating);
  const arenaWins = useGameStore((s) => s.arenaWins);
  const arenaLosses = useGameStore((s) => s.arenaLosses);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const startArenaRun = useGameStore((s) => s.startArenaRun);
  const ensureLeaderboardReady = useGameStore((s) => s.ensureLeaderboardReady);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const disabled = runPhase !== 'idle' || showResult;

  useEffect(() => {
    ensureLeaderboardReady();
  }, [ensureLeaderboardReady]);

  useEffect(() => {
    if (!opponent || disabled || startedOpponentRef.current === opponent) return;
    startedOpponentRef.current = opponent;
    startArenaRun(opponent);
  }, [opponent, disabled, startArenaRun]);

  const opponents = getArenaOpponentsFromLeaderboard(leaderboard);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Arena</Text>
      <Text style={styles.rating}>{arenaRating}</Text>
      <Text style={styles.subtitle}>Arena Rating</Text>

      <View style={styles.record}>
        <Text style={styles.recordText}>{arenaWins}W · {arenaLosses}L</Text>
      </View>

      <Text style={styles.desc}>Choose an opponent. Win to gain rating.</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {opponents.length === 0 && (
          <Text style={styles.empty}>No opponents yet — invite friends to sign up!</Text>
        )}
        {opponents.map((opponent) => (
          <Pressable
            key={opponent.id}
            style={({ pressed }) => [
              styles.opponentRow,
              pressed && !disabled && styles.pressed,
              disabled && styles.disabled,
            ]}
            onPress={() => startArenaRun(opponent.id)}
            disabled={disabled}
          >
            <View style={styles.opponentInfo}>
              <Text style={styles.opponentName}>{opponent.name}</Text>
              <Text style={styles.opponentMeta}>
                Power {opponent.powerScore} · Depth {opponent.depth}
              </Text>
            </View>
            <View style={styles.opponentAction}>
              <Text style={styles.opponentRating}>{opponent.arenaRating}</Text>
              <Text style={styles.fightLabel}>Fight</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={() => router.push('/leaderboard')} style={styles.link}>
        <Text style={styles.linkText}>View Full Leaderboard</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  back: { marginBottom: 16 },
  backText: { color: colors.textMuted, fontSize: 14 },
  title: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.cta,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  record: { alignItems: 'center', marginBottom: 16 },
  recordText: { color: colors.textPrimary, fontSize: 14 },
  desc: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  list: { flex: 1, marginBottom: 8 },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
    lineHeight: 20,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  pressed: { opacity: 0.85, borderColor: colors.cta },
  disabled: { opacity: 0.5 },
  opponentInfo: { flex: 1 },
  opponentName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  opponentMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  opponentAction: { alignItems: 'flex-end' },
  opponentRating: { fontSize: 16, fontWeight: '600', color: colors.cta },
  fightLabel: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  link: { alignItems: 'center', padding: 12 },
  linkText: { color: colors.textMuted, fontSize: 13, letterSpacing: 1 },
});
