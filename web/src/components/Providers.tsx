'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthGate } from '../../../src/components/AuthGate';
import { SafeAreaProvider } from '@/shims/react-native-safe-area-context';
import { useGameStore } from '../../../src/store/gameStore';
import { colors } from '../../../src/constants/theme';

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStatsRoute = pathname?.startsWith('/stats');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsub = useGameStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsub;
  }, []);

  if (isStatsRoute) {
    return <>{children}</>;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.shell}>
        {!hydrated ? (
          <View style={styles.boot}>
            <ActivityIndicator color={colors.cta} size="large" />
          </View>
        ) : (
          <AuthGate>{children}</AuthGate>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: '100%',
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    minHeight: 600,
  },
});
