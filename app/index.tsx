import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

/** Entry redirect — always land in the game; auth is optional via /login. */
export default function Index() {
  const session = useAuthStore((s) => s.session);
  const isDebugSession = useAuthStore((s) => s.isDebugSession);

  if (session || isDebugSession) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(tabs)" />;
}
