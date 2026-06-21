import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { useAnalytics } from '../hooks/useAnalytics';
import { useCloudSync } from '../hooks/useCloudSync';
import { useAuthStore } from '../store/authStore';
import { DebugPanel } from './DebugPanel';
import { LoginScreen } from './LoginScreen';
import { RunSessionOverlays } from './RunSessionOverlays';

interface WebAuthGateProps {
  children: ReactNode;
}

/** Web-only auth shell — native app uses LoginModal on the profile tab. */
export function WebAuthGate({ children }: WebAuthGateProps) {
  const session = useAuthStore((s) => s.session);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  useCloudSync();
  useAnalytics(session?.user?.id);

  useEffect(() => {
    bootstrap();
    void restoreSession();
  }, [bootstrap, restoreSession]);

  const authed = !!session || isDebugSession;

  if (!initialized) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.cta} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {children}

      {authed && (
        <>
          <RunSessionOverlays />
          {isDebugSession && (
            <>
              <Pressable style={styles.debugBadge} onPress={() => setDebugPanelOpen(true)}>
                <Text style={styles.debugBadgeText}>DEBUG</Text>
              </Pressable>
              <DebugPanel visible={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
            </>
          )}
        </>
      )}

      {loading && authed && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.cta} size="large" />
        </View>
      )}

      {!authed && (
        <View style={styles.loginOverlay}>
          <LoginScreen />
        </View>
      )}
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
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 1000,
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
