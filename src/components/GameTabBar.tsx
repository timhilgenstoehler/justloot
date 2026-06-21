import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CraftTabIcon,
  InventoryTabIcon,
  LeaderboardTabIcon,
  ProfileTabIcon,
} from './TabBarIcons';
import { colors } from '../constants/theme';
import { hasOpenableLootPack } from '../systems/lootPackSystem';
import { useGameStore } from '../store/gameStore';

export const TAB_BAR_BODY_HEIGHT = 58;
export const TAB_LOOT_BTN_SIZE = 76;

type TabIconRenderer = (color: string) => ReactNode;

type TabItem = {
  routeName: string;
  label: string;
  path: string;
  match: (pathname: string) => boolean;
  icon: TabIconRenderer;
  badge?: number;
};

function isGearPath(pathname: string): boolean {
  return pathname === '/gear' || pathname.startsWith('/gear/');
}

function isHomePath(pathname: string): boolean {
  return pathname === '/' || pathname === '/index' || pathname === '';
}

const LEFT_TABS: TabItem[] = [
  {
    routeName: 'index',
    label: 'Profile',
    path: '/',
    match: isHomePath,
    icon: (color) => <ProfileTabIcon color={color} />,
  },
  {
    routeName: 'gear',
    label: 'Inventory',
    path: '/gear',
    match: isGearPath,
    icon: (color) => <InventoryTabIcon color={color} />,
  },
];

const RIGHT_TABS: TabItem[] = [
  {
    routeName: 'craft',
    label: 'Craft',
    path: '/craft',
    match: (path) => path === '/craft' || path.startsWith('/craft/'),
    icon: (color) => <CraftTabIcon color={color} />,
  },
  {
    routeName: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    match: (path) => path === '/leaderboard' || path.startsWith('/leaderboard/'),
    icon: (color) => <LeaderboardTabIcon color={color} />,
  },
];

const TAB_ROOTS = new Set(['/', '/craft', '/gear', '/leaderboard']);

export function shouldShowGameTabBar(pathname: string | null): boolean {
  if (!pathname) return true;
  if (pathname.startsWith('/stats')) return false;
  if (pathname.startsWith('/inspect')) return false;
  if (pathname.startsWith('/comparison')) return false;
  if (pathname.startsWith('/collection')) return false;
  if (pathname.startsWith('/arena')) return false;
  return TAB_ROOTS.has(pathname) || [...LEFT_TABS, ...RIGHT_TABS].some((tab) => tab.match(pathname));
}

export function GameTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const inventoryCount = useGameStore((s) => s.inventory.length);
  const dust = useGameStore((s) => s.dust);
  const startRun = useGameStore((s) => s.startRun);
  const runPhase = useGameStore((s) => s.runPhase);
  const showResult = useGameStore((s) => s.showResult);
  const runDisabled = runPhase !== 'idle' || showResult;
  const onHome = isHomePath(pathname);

  const leftTabs = LEFT_TABS.map((tab) =>
    tab.routeName === 'gear'
      ? { ...tab, badge: inventoryCount > 0 ? inventoryCount : undefined }
      : tab,
  );

  const canCraftPack = hasOpenableLootPack(dust, inventoryCount);
  const rightTabs = RIGHT_TABS.map((tab) =>
    tab.routeName === 'craft' ? { ...tab, badge: canCraftPack ? 1 : undefined } : tab,
  );

  const navigateTab = (tab: TabItem) => {
    if (runDisabled) return;
    router.push(tab.path);
  };

  const handleRun = () => {
    if (runDisabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!onHome) {
      router.push('/');
    }
    startRun();
  };

  const renderSideTab = (tab: TabItem) => {
    const active = tab.match(pathname);
    const iconColor = active ? colors.cta : colors.textMuted;

    return (
      <Pressable
        key={tab.routeName}
        style={({ pressed }: { pressed: boolean }) => [
          styles.sideTab,
          pressed && !runDisabled && styles.sideTabPressed,
          runDisabled && styles.sideTabDisabled,
        ]}
        onPress={() => navigateTab(tab)}
        disabled={runDisabled}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
      >
        <View style={styles.iconWrap}>
          {tab.icon(iconColor)}
          {tab.badge !== undefined && (
            <View style={[styles.badge, active && styles.badgeActive]}>
              <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{tab.badge}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.sideTabLabel, active && styles.sideTabLabelActive]} numberOfLines={1}>
          {tab.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrap,
        Platform.OS === 'web' && styles.wrapWeb,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 0),
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.sideGroup}>{leftTabs.map(renderSideTab)}</View>

        <Pressable
          style={({ pressed }: { pressed: boolean }) => [
            styles.runButton,
            pressed && !runDisabled && styles.runButtonPressed,
            runDisabled && styles.runButtonDisabled,
          ]}
          onPress={handleRun}
          disabled={runDisabled}
          accessibilityRole="button"
          accessibilityLabel="Just Loot — start run"
        >
          <Text style={styles.lootText}>JUST</Text>
          <Text style={styles.lootText}>LOOT</Text>
        </Pressable>

        <View style={styles.sideGroup}>{rightTabs.map(renderSideTab)}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: '#0A0A0E',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  wrapWeb: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: TAB_BAR_BODY_HEIGHT,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  sideTab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 3,
  },
  sideTabPressed: {
    opacity: 0.85,
  },
  sideTabDisabled: {
    opacity: 0.4,
  },
  iconWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTabLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sideTabLabelActive: {
    color: colors.cta,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: '#1E1E28',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0A0A0E',
  },
  badgeActive: {
    backgroundColor: '#2A2410',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badgeTextActive: {
    color: colors.cta,
  },
  runButton: {
    width: TAB_LOOT_BTN_SIZE,
    height: TAB_LOOT_BTN_SIZE,
    borderRadius: TAB_LOOT_BTN_SIZE / 2,
    marginHorizontal: 4,
    marginBottom: 4,
    marginTop: -24,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A0E',
    gap: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  runButtonPressed: {
    backgroundColor: colors.ctaPressed,
    transform: [{ scale: 0.96 }],
  },
  runButtonDisabled: {
    opacity: 0.45,
  },
  lootText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0B0B0F',
    letterSpacing: 1,
    lineHeight: 12,
    textAlign: 'center',
  },
});
