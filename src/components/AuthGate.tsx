import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { DebugPanel } from './DebugPanel';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAnalytics } from '../hooks/useAnalytics';
import { colors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from './LoginScreen';
import { RunSessionOverlays } from './RunSessionOverlays';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const session = useAuthStore((s) => s.session);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const initialize = useAuthStore((s) => s.initialize);
  const signOut = useAuthStore((s) => s.signOut);

  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  useCloudSync();
  useAnalytics(session?.user?.id);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const authed = !!session || isDebugSession;

  if (!initialized || (loading && !session && !isDebugSession)) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.cta} size="large" />
      </View>
    );
  }

  if (!authed) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.root}>
      {children}
      <RunSessionOverlays />
      {isDebugSession && (
        <>
          <Pressable style={styles.debugBadge} onPress={() => setDebugPanelOpen(true)}>
            <Text style={styles.debugBadgeText}>DEBUG</Text>
          </Pressable>
          <DebugPanel visible={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
        </>
      )}
      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>{isDebugSession ? 'Exit Debug' : 'Sign Out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
    minHeight: '100%',
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
  signOut: {
    position: 'absolute',
    top: 8,
    right: 12,
    zIndex: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  signOutText: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
