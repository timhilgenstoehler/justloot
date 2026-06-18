import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors } from '../constants/theme';
import { useGameStore } from '../store/gameStore';

export function SalvageToast() {
  const lastSalvageDust = useGameStore((s) => s.lastSalvageDust);
  const clearSalvageToast = useGameStore((s) => s.clearSalvageToast);

  useEffect(() => {
    if (lastSalvageDust === null) return;
    const timer = setTimeout(clearSalvageToast, 2000);
    return () => clearTimeout(timer);
  }, [lastSalvageDust, clearSalvageToast]);

  if (lastSalvageDust === null) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.toast}>
      <Text style={styles.text}>+{lastSalvageDust} Dust</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cta,
    zIndex: 50,
  },
  text: {
    color: colors.cta,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
