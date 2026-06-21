import fs from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(__dirname, '.env.local'));

const PROJECT_ID = 'e393a587-eaad-4d26-bd1c-9f5ea921af73';

export default (): ExpoConfig => {
  const isDevBuild = process.env.EAS_BUILD_PROFILE === 'development';
  const isEasBuild = process.env.EAS_BUILD === 'true';

  const supabaseUrl = (
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ''
  ).trim();
  const supabaseAnonKey = (
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ''
  ).trim();

  if (isEasBuild && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error(
      'Missing Supabase env vars on EAS. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for this build profile.',
    );
  }

  const plugins: (string | [string, Record<string, unknown>])[] = ['expo-router'];

  if (isDevBuild) {
    plugins.push('expo-dev-client');
  }

  return {
    name: 'Just Loot',
    slug: 'just-loot',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'justloot',
    userInterfaceStyle: 'dark',
    backgroundColor: '#0B0B0F',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.timhilgenstoehlerexpo.justloot',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.timhilgenstoehlerexpo.justloot',
      adaptiveIcon: {
        backgroundColor: '#0B0B0F',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins,
    owner: 'timhilgenstoehlerexpo',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`,
      fallbackToCacheTimeout: 0,
    },
    extra: {
      router: {},
      eas: {
        projectId: PROJECT_ID,
      },
      EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    },
  };
};
