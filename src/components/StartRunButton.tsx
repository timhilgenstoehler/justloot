import { Pressable, StyleSheet, Text } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';

interface StartRunButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function StartRunButton({ onPress, disabled }: StartRunButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>START RUN</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.cta,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 12,
  },
  buttonPressed: {
    backgroundColor: colors.ctaPressed,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0B0F',
    letterSpacing: 3,
  },
});
