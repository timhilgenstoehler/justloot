import { Platform, type ViewStyle } from 'react-native';

/** Visible viewport on mobile browsers (Safari toolbar visible). */
const webViewportStyle: ViewStyle | undefined =
  Platform.OS === 'web'
    ? ({
        height: '100svh',
        minHeight: '100svh',
        maxHeight: '100svh',
      } as ViewStyle)
    : undefined;

export function modalBackdropStyle(extra: Record<string, unknown> = {}): ViewStyle {
  return {
    flex: 1,
    ...webViewportStyle,
    ...extra,
  } as ViewStyle;
}
