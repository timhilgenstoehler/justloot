import { Platform } from 'react-native';

/** Ensures full-viewport modal backdrops on react-native-web. */
export const modalBackdropMinHeight =
  Platform.OS === 'web' ? ('100vh' as const) : undefined;

export function modalBackdropStyle(extra: Record<string, unknown> = {}) {
  return {
    flex: 1,
    ...(modalBackdropMinHeight ? { minHeight: modalBackdropMinHeight } : {}),
    ...extra,
  };
}
