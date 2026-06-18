'use client';

import { Suspense } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../../../src/constants/theme';

function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.cta} />
    </View>
  );
}

export default function ArenaPage() {
  const Screen = require('../../../../app/arena').default;
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
