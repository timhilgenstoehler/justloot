'use client';

import { Suspense, type ComponentType } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../../src/constants/theme';

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.cta} />
    </View>
  );
}

export function GameScreen({ Screen }: { Screen: ComponentType }) {
  return (
    <Suspense fallback={<Loading />}>
      <Screen />
    </Suspense>
  );
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
