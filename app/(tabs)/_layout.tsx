import { Tabs, usePathname } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { DebugPanel } from '../../src/components/DebugPanel';
import { GameTabBar, shouldShowGameTabBar } from '../../src/components/GameTabBar';
import { RunSessionOverlays } from '../../src/components/RunSessionOverlays';
import { colors } from '../../src/constants/theme';
import { useCloudSync } from '../../src/hooks/useCloudSync';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { useAuthStore } from '../../src/store/authStore';

export default function TabsLayout() {
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  useEffect(() => {
    bootstrap();
    void restoreSession();
  }, [bootstrap, restoreSession]);

  useCloudSync();
  useAnalytics(session?.user?.id);

  if (!initialized) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.cta} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={() => (shouldShowGameTabBar(pathname) ? <GameTabBar /> : null)}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Profile' }} />
        <Tabs.Screen name="craft" options={{ title: 'Craft' }} />
        <Tabs.Screen name="gear" options={{ title: 'Inventory' }} />
        <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      </Tabs>

      <RunSessionOverlays />

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.cta} size="large" />
        </View>
      )}

      {isDebugSession && (
        <>
          <Pressable style={styles.debugBadge} onPress={() => setDebugPanelOpen(true)}>
            <Text style={styles.debugBadgeText}>DEBUG</Text>
          </Pressable>
          <DebugPanel visible={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
  },
  debugBadge: {
    position: 'absolute',
    top: 8,
    left: 12,
    zIndex: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3A2A08',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  debugBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.5,
  },
});
