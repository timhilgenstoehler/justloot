import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace files only inside web/ (parent has Expo app + separate lockfile).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
