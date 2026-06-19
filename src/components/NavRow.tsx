import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SCREEN_PADDING } from '../constants/layout';
import { colors } from '../constants/theme';
import { useGameStore } from '../store/gameStore';

interface NavRowProps {
  disabled?: boolean;
}

interface NavLink {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  badge?: number;
}

function isGearPath(pathname: string): boolean {
  return pathname === '/gear' || pathname.startsWith('/gear/');
}

export function NavRow({ disabled }: NavRowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inventoryCount = useGameStore((s) => s.inventory.length);

  const links: NavLink[] = [
    {
      label: 'Craft',
      href: '/craft',
      match: (path) => path === '/craft' || path.startsWith('/craft/'),
    },
    {
      label: 'Arena',
      href: '/arena',
      match: (path) => path === '/arena' || path.startsWith('/arena/'),
    },
    {
      label: 'Inventory',
      href: '/gear?tab=inventory',
      match: isGearPath,
      badge: inventoryCount > 0 ? inventoryCount : undefined,
    },
    {
      label: 'Leaderboard',
      href: '/leaderboard',
      match: (path) => path === '/leaderboard' || path.startsWith('/leaderboard/'),
    },
  ];

  return (
    <View style={styles.row}>
      {links.map((link) => {
        const active = link.match(pathname);

        return (
          <Pressable
            key={link.href}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && !disabled && styles.chipPressed,
              disabled && styles.chipDisabled,
            ]}
            onPress={() => router.push(link.href)}
            disabled={disabled}
          >
            <Text
              style={[styles.chipText, active && styles.chipTextActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {link.label}
            </Text>
            {link.badge !== undefined && (
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{link.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 10,
    gap: 6,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    backgroundColor: '#121218',
  },
  chipActive: {
    borderColor: colors.cta,
    backgroundColor: '#1A1810',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  chipTextActive: {
    color: colors.cta,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#1E1E28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: '#2A2410',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeTextActive: {
    color: colors.cta,
  },
});
