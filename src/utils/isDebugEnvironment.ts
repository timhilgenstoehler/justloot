/**
 * Local dev only — available on Expo (__DEV__), Next dev, or localhost.
 * Never enabled on production Vercel deploys.
 */
export function isDebugEnvironment(): boolean {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }

  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      return true;
    }
  }

  return false;
}
