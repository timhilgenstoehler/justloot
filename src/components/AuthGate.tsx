import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCloudSync } from '../hooks/useCloudSync';
import { colors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { LoginScreen } from './LoginScreen';
import { RunSessionOverlays } from './RunSessionOverlays';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const initialize = useAuthStore((s) => s.initialize);
  const signOut = useAuthStore((s) => s.signOut);

  useCloudSync();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || (loading && !session)) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.cta} size="large" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.root}>
      {children}
      <RunSessionOverlays />
      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
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
