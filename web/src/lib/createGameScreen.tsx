'use client';

import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../../src/constants/theme';

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.cta} />
    </View>
  );
}

export function createGameScreen(modulePath: string) {
  return function GameScreenPage() {
    const Screen = require(modulePath).default;
    return (
      <Suspense fallback={<Loading />}>
        <Screen />
      </Suspense>
    );
  };
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    minHeight: 400,
  },
});
