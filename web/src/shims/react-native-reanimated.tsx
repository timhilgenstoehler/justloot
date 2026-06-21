'use client';

import { useRef, type ComponentType } from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';

type AnimationConfig = {
  duration: (...args: number[]) => AnimationConfig;
  springify: () => AnimationConfig;
  damping: (...args: number[]) => AnimationConfig;
};

type AnimatedProps<P> = P & {
  entering?: AnimationConfig;
  exiting?: AnimationConfig;
};

function createAnimatedComponent<P>(Component: ComponentType<P>): ComponentType<AnimatedProps<P>> {
  return Component as ComponentType<AnimatedProps<P>>;
}

const Animated = {
  View: View as ComponentType<AnimatedProps<ViewProps>>,
  Text: Text as ComponentType<AnimatedProps<TextProps>>,
  createAnimatedComponent,
};

const animationPreset: AnimationConfig = {
  duration: () => animationPreset,
  springify: () => animationPreset,
  damping: () => animationPreset,
};

export default Animated;
export const FadeIn = animationPreset;
export const FadeOut = animationPreset;
export const FadeInDown = animationPreset;
export const ZoomIn = animationPreset;

export function useSharedValue<T>(initial: T): { value: T } {
  const ref = useRef<{ value: T } | null>(null);
  if (!ref.current) {
    ref.current = { value: initial };
  }
  return ref.current;
}

export function useAnimatedStyle<T extends object>(factory: () => T): T {
  const ref = useRef<T | null>(null);
  if (!ref.current) {
    ref.current = factory();
  }
  return ref.current;
}

export function withTiming<T>(value: T, _config?: { duration?: number }): T {
  return value;
}

export function withRepeat<T>(value: T, _repeats?: number, _reverse?: boolean): T {
  return value;
}

export function withSequence<T>(...values: T[]): T {
  return values[0];
}
