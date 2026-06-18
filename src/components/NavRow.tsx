import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';
import { useGameStore } from '../store/gameStore';

interface NavRowProps {
  disabled?: boolean;
}

export function NavRow({ disabled }: NavRowProps) {
  const router = useRouter();
  const inventoryCount = useGameStore((s) => s.inventory.length);

  const links = [
    { label: 'Arena', href: '/arena' as const },
    {
      label: `Inventory${inventoryCount > 0 ? ` (${inventoryCount})` : ''}`,
      href: '/gear?tab=inventory' as const,
    },
    { label: 'Leaderboard', href: '/leaderboard' as const },
  ];

  return (
    <View style={styles.row}>
      {links.map((link) => (
        <Pressable
          key={link.href}
          style={({ pressed }) => [styles.link, pressed && styles.pressed, disabled && styles.disabled]}
          onPress={() => router.push(link.href)}
          disabled={disabled}
        >
          <Text
            style={styles.linkText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {link.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 10,
    gap: 4,
  },
  link: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  linkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
