import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthGate } from '../src/components/AuthGate';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <AuthGate>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="gear" />
        <Stack.Screen name="arena" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen
          name="comparison"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </AuthGate>
  );
}
