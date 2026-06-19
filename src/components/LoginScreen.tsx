import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../constants/theme';
import { lootLogo } from '../constants/lootLogo';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { isDebugEnvironment } from '../utils/isDebugEnvironment';

type AuthMode = 'signin' | 'signup';

function LoginLogo() {
  return (
    <Image
      source={lootLogo}
      style={styles.logo}
      resizeMode="contain"
      accessibilityLabel="Just Loot"
    />
  );
}

export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);
  const enterDebugSession = useAuthStore((s) => s.enterDebugSession);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async () => {
    clearError();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    if (mode === 'signin') {
      await signIn(trimmedEmail, password);
    } else {
      await signUp(trimmedEmail, password, displayName.trim() || 'Adventurer');
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.container}>
        <LoginLogo />
        <Text style={styles.configError}>
          Supabase is not configured.{'\n'}
          Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <LoginLogo />
        <Text style={styles.subtitle}>Sign in to save progress and fight real players</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, mode === 'signin' && styles.tabActive]}
            onPress={() => { setMode('signin'); clearError(); }}
          >
            <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>Sign In</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => { setMode('signup'); clearError(); }}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </Pressable>
        </View>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Display name"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0B0B0F" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.guestButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          onPress={() => {
            clearError();
            signInAsGuest();
          }}
          disabled={loading}
        >
          <Text style={styles.guestButtonText}>Play as Guest</Text>
        </Pressable>

        <Text style={styles.guestHint}>
          One tap — anonymous account, progress saved to cloud on this device.
        </Text>

        {isDebugEnvironment() && mode === 'signup' && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>dev</Text>
              <View style={styles.dividerLine} />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.debugButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => {
                clearError();
                enterDebugSession();
              }}
            >
              <Text style={styles.debugButtonText}>Enter Debug Mode</Text>
            </Pressable>
            <Text style={styles.debugHint}>
              Local only — fresh character, custom loot odds, no cloud save.
            </Text>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
  },
  logo: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1024 / 437,
    alignSelf: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  configError: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#121218',
  },
  tabActive: {
    backgroundColor: '#1A1810',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: colors.cta,
  },
  input: {
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.cta,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
  dividerText: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  guestButton: {
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  guestHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  debugButton: {
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#1A1408',
    marginTop: 4,
  },
  debugButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.5,
  },
  debugHint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 10,
    paddingHorizontal: 8,
    fontStyle: 'italic',
  },
});
