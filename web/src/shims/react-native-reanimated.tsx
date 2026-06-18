'use client';

import { useRef } from 'react';
import { Text, View } from 'react-native';

function createAnimatedComponent<T>(Component: T): T {
  return Component;
}

const Animated = {
  View,
  Text,
  createAnimatedComponent,
};

const animationPreset = {
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

export function withTiming<T>(value: T): T {
  return value;
}

export function withRepeat<T>(value: T): T {
  return value;
}

export function withSequence<T>(...values: T[]): T {
  return values[0];
}
