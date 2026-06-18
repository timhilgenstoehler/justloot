import type { NextConfig } from 'next';
import path from 'path';

const shim = (name: string) => path.join(__dirname, 'src/shims', name);
const rootSrc = path.join(__dirname, '..', 'src');
const webNodeModules = path.resolve(__dirname, 'node_modules');
const reactNativeWeb = path.resolve(webNodeModules, 'react-native-web');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '..'),
  serverExternalPackages: ['@supabase/supabase-js'],
  transpilePackages: ['react-native', 'react-native-web'],
  webpack: (config, { isServer }) => {
    // Parent app/ and src/ files live outside web/ — always resolve deps from web/node_modules.
    config.resolve.modules = [
      webNodeModules,
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ['node_modules']),
    ];

    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': reactNativeWeb,
      'react-native': reactNativeWeb,
      'expo-router': shim('expo-router.tsx'),
      'expo-haptics': shim('expo-haptics.ts'),
      '@react-native-async-storage/async-storage': shim('async-storage.ts'),
      'react-native-reanimated': shim('react-native-reanimated.tsx'),
      'react-native-safe-area-context': shim('react-native-safe-area-context.tsx'),
      [path.join(rootSrc, 'lib/supabase.ts')]: shim('supabase-lib.ts'),
    };

    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      ...config.resolve.extensions,
    ];

    if (isServer) {
      config.externals = [...(config.externals as string[]), '@supabase/supabase-js'];
    }

    return config;
  },
};

export default nextConfig;
