import { Pressable, StyleSheet } from 'react-native';
import { authLog } from '../lib/authLog';
import { SignOutIcon } from './HeaderIcons';
import { colors } from '../constants/theme';

interface SignOutButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
}

export function SignOutButton({ onPress, accessibilityLabel = 'Sign out' }: SignOutButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      onPress={() => {
        authLog('SignOutButton:pressed');
        onPress();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <SignOutIcon color={colors.textPrimary} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14141A',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  pressed: { opacity: 0.85 },
});
