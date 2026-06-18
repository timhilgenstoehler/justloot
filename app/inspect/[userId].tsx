import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CharacterInspectView } from '../../src/components/CharacterInspectView';
import { fetchPlayerInspect, type PlayerInspectData } from '../../src/services/inspectService';
import { calculatePowerScore } from '../../src/systems/powerCalculator';
import { colors } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useGameStore } from '../../src/store/gameStore';

function inspectDataFromOwnGame(userId: string): PlayerInspectData {
  const state = useGameStore.getState();
  return {
    userId,
    playerName: state.playerName,
    depth: state.depth,
    arenaRating: state.arenaRating,
    arenaWins: state.arenaWins,
    arenaLosses: state.arenaLosses,
    equipment: state.equipment,
    powerScore: calculatePowerScore(state.equipment),
  };
}

export default function InspectScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const sessionUserId = useAuthStore((s) => s.user?.id);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const fightDisabled = runPhase !== 'idle' || showResult;

  const [data, setData] = useState<PlayerInspectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(userId && sessionUserId && userId === sessionUserId);

  useEffect(() => {
    if (!userId) {
      setError('Player not found.');
      setLoading(false);
      return;
    }

    if (isSelf) {
      setData(inspectDataFromOwnGame(userId));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPlayerInspect(userId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          const entry = useGameStore.getState().leaderboard.find((row) => row.id === userId);
          if (entry) {
            setData({
              userId,
              playerName: entry.name,
              depth: entry.depth,
              arenaRating: entry.arenaRating,
              arenaWins: 0,
              arenaLosses: 0,
              equipment: {},
              powerScore: entry.powerScore,
            });
          } else {
            setError('Player not found or save is private.');
          }
        } else setData(result);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load player.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, isSelf]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        hitSlop={8}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.cta} size="large" />
          </View>
        )}

        {!loading && error && (
          <View style={styles.centered}>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {!loading && data && (
          <CharacterInspectView
            data={data}
            isSelf={isSelf}
            fightDisabled={fightDisabled}
            onFight={
              isSelf
                ? undefined
                : () => router.push(`/arena?opponent=${data.userId}`)
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  back: {
    position: 'absolute',
    top: 8,
    left: 20,
    zIndex: 50,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backPressed: {
    opacity: 0.7,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 36,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
