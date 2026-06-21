import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="arena" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="inspect/[userId]" />
        <Stack.Screen
          name="comparison"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
