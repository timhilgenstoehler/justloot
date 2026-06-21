'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebAuthGate } from '../../../src/components/WebAuthGate';
import { GameTabBar, shouldShowGameTabBar } from '../../../src/components/GameTabBar';
import { SafeAreaProvider } from '@/shims/react-native-safe-area-context';
import { useGameStore } from '../../../src/store/gameStore';
import { colors } from '../../../src/constants/theme';

/** Next.js URL → pathname expected by shared game code. */
function toGamePathname(pathname: string | null): string {
  if (!pathname) return '/';
  if (pathname === '/play' || pathname === '/play/') return '/';
  return pathname;
}

export function GameProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showTabBar = shouldShowGameTabBar(toGamePathname(pathname));
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

  return (
    <SafeAreaProvider>
      <View style={styles.shell}>
        {!hydrated ? (
          <View style={styles.boot}>
            <ActivityIndicator color={colors.cta} size="large" />
          </View>
        ) : (
          <WebAuthGate>
            <View style={styles.app}>
              <View style={styles.content}>{children}</View>
              {showTabBar && <GameTabBar />}
            </View>
          </WebAuthGate>
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
  app: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    minHeight: 600,
  },
});
