'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { View, type ViewProps } from 'react-native';

type Insets = { top: number; bottom: number; left: number; right: number };

const SafeAreaContext = createContext<Insets>({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  const insets = useMemo<Insets>(
    () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    [],
  );

  return (
    <SafeAreaContext.Provider value={insets}>{children}</SafeAreaContext.Provider>
  );
}

export function SafeAreaView({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ flex: 1 }, style]} {...props}>
      {children}
    </View>
  );
}

export function useSafeAreaInsets(): Insets {
  return useContext(SafeAreaContext);
}
