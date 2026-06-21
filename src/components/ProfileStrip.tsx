import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SignOutButton } from './SignOutButton';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';

interface ProfileStripProps {
  playerName: string;
  title?: string;
  onSignIn?: () => void;
  onSignOut?: () => void;
  signOutLabel?: string;
}

export function ProfileStrip({
  playerName,
  title,
  onSignIn,
  onSignOut,
  signOutLabel,
}: ProfileStripProps) {
  return (
    <View style={styles.container}>
      {onSignIn && (
        <View style={styles.signInWrap}>
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && styles.pressed]}
            onPress={onSignIn}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        </View>
      )}
      {onSignOut && (
        <View style={styles.signOutWrap}>
          <SignOutButton onPress={onSignOut} accessibilityLabel={signOutLabel} />
        </View>
      )}
      <View style={styles.identity}>
        <Text style={styles.name} numberOfLines={1}>
          {playerName}
        </Text>
        {title ? (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 4,
    paddingHorizontal: SCREEN_PADDING,
    position: 'relative',
  },
  signOutWrap: {
    position: 'absolute',
    top: 0,
    right: SCREEN_PADDING,
    zIndex: 1,
  },
  signInWrap: {
    position: 'absolute',
    top: 0,
    right: SCREEN_PADDING,
    zIndex: 1,
  },
  signInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.cta,
  },
  signInText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  identity: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cta,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    lineHeight: 15,
    textAlign: 'center',
  },
});
