import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';

export default function LeaderboardScreen() {
  const router = useRouter();
  const leaderboard = useGameStore((s) => s.leaderboard);
  const feedLog = useGameStore((s) => s.feedLog);
  const ensureLeaderboardReady = useGameStore((s) => s.ensureLeaderboardReady);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const disabled = runPhase !== 'idle' || showResult;

  useEffect(() => {
    ensureLeaderboardReady();
  }, [ensureLeaderboardReady]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Leaderboard</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {leaderboard.map((entry, index) => (
          <View
            key={entry.id}
            style={[styles.row, entry.isPlayer && styles.playerRow]}
          >
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.name, entry.isPlayer && styles.playerName]}>
                {entry.name}
              </Text>
              <Text style={styles.meta}>Power {entry.powerScore} · Depth {entry.depth}</Text>
            </View>
            <Text style={styles.rating}>{entry.arenaRating}</Text>
            {!entry.isPlayer && (
              <Pressable
                style={({ pressed }) => [styles.fightBtn, pressed && styles.fightPressed, disabled && styles.disabled]}
                onPress={() => router.push(`/arena?opponent=${entry.id}`)}
                disabled={disabled}
              >
                <Text style={styles.fightText}>Fight</Text>
              </Pressable>
            )}
          </View>
        ))}

        {feedLog.length > 0 && (
          <View style={styles.feed}>
            <Text style={styles.feedTitle}>Feed</Text>
            {feedLog.slice(0, 10).map((entry) => (
              <Text key={entry.id} style={styles.feedLine}>
                {entry.text}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  playerRow: { backgroundColor: '#1A1810' },
  rank: { width: 28, color: colors.textMuted, fontSize: 14 },
  rowInfo: { flex: 1 },
  name: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  playerName: { color: colors.cta },
  meta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  rating: { fontSize: 16, fontWeight: '600', color: colors.cta, marginRight: 8, minWidth: 44, textAlign: 'right' },
  fightBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.cta,
  },
  fightPressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  fightText: { fontSize: 10, color: colors.cta, letterSpacing: 1, fontWeight: '700' },
  feed: { marginTop: 32 },
  feedTitle: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  feedLine: { fontSize: 12, color: colors.textPrimary, marginBottom: 8, lineHeight: 18 },
});
