'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { View, type ViewProps } from 'react-native';

type Insets = { top: number; bottom: number; left: number; right: number };
type Edge = 'top' | 'right' | 'bottom' | 'left';

const SafeAreaContext = createContext<Insets>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

function readEnvInsets(): Insets {
  if (typeof document === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none;';
  document.documentElement.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
  document.documentElement.removeChild(probe);
  return insets;
}

/** Safari bottom toolbar sits outside safe-area — use visual viewport when larger. */
function readVisualBottomInset(): number {
  if (typeof window === 'undefined') return 0;
  const vv = window.visualViewport;
  if (!vv) return 0;
  return Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
}

function mergeInsets(env: Insets): Insets {
  const visualBottom = readVisualBottomInset();
  return {
    ...env,
    bottom: Math.max(env.bottom, visualBottom),
  };
}

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  const [insets, setInsets] = useState<Insets>(() => mergeInsets(readEnvInsets()));

  useEffect(() => {
    const update = () => setInsets(mergeInsets(readEnvInsets()));
    update();
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <SafeAreaContext.Provider value={insets}>{children}</SafeAreaContext.Provider>
  );
}

type SafeAreaViewProps = ViewProps & {
  edges?: readonly Edge[];
};

export function SafeAreaView({ style, children, edges, ...props }: SafeAreaViewProps) {
  const insets = useSafeAreaInsets();
  const activeEdges = edges ?? (['top', 'bottom', 'left', 'right'] as const);

  const padding = useMemo(
    () => ({
      paddingTop: activeEdges.includes('top') ? insets.top : 0,
      paddingRight: activeEdges.includes('right') ? insets.right : 0,
      paddingBottom: activeEdges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: activeEdges.includes('left') ? insets.left : 0,
    }),
    [activeEdges, insets],
  );

  return (
    <View style={[{ flex: 1 }, padding, style]} {...props}>
      {children}
    </View>
  );
}

export function useSafeAreaInsets(): Insets {
  return useContext(SafeAreaContext);
}
