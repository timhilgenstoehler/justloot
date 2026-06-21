import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BODY_HEIGHT } from './GameTabBar';

interface TabScreenProps {
  children: ReactNode;
  style?: ViewStyle;
}

/** Keeps scrollable tab content above the global bottom tab bar. */
export function TabScreen({ children, style }: TabScreenProps) {
  const insets = useSafeAreaInsets();
  // Native tabs already reserve space for GameTabBar — only pad on web overlay layout.
  const bottomPad =
    Platform.OS === 'web'
      ? TAB_BAR_BODY_HEIGHT + Math.max(insets.bottom, 8) + 12
      : 0;

  return (
    <View style={[styles.screen, bottomPad > 0 && { paddingBottom: bottomPad }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
});

/** Fill remaining space below fixed headers inside a tab screen. */
export const tabPanelStyle = StyleSheet.create({
  panel: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
});
