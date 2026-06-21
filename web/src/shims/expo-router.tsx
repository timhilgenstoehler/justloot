'use client';

import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useParams,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useMemo } from 'react';

const PLAY_HOME = '/play';

type Router = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  canGoBack: () => boolean;
};

/** Map Next URL → game pathname (Expo Router expects `/` as home). */
function toGamePath(pathname: string | null): string {
  if (!pathname) return '/';
  if (pathname === PLAY_HOME || pathname === `${PLAY_HOME}/`) return '/';
  return pathname;
}

/** Map game href → Next.js URL (`/` → `/play`). */
function toWebPath(href: string): string {
  let path = href.startsWith('/') ? href : `/${href}`;

  if (path === '/(tabs)' || path === '/(tabs)/' || path === '/(tabs)/index') {
    path = '/';
  } else if (path.startsWith('/(tabs)/')) {
    path = `/${path.slice('/(tabs)/'.length)}`;
  }

  if (path === '/' || path === '/index') return PLAY_HOME;
  return path;
}

export function useRouter(): Router {
  const router = useNextRouter();
  const pathname = useNextPathname();

  return useMemo(
    () => ({
      push: (href: string) => {
        router.push(toWebPath(href));
      },
      replace: (href: string) => {
        router.replace(toWebPath(href));
      },
      back: () => {
        router.back();
      },
      canGoBack: () => {
        if (typeof window === 'undefined') return false;
        const webPath = pathname ?? '';
        return window.history.length > 1 && webPath !== PLAY_HOME && webPath !== '/';
      },
    }),
    [router, pathname],
  );
}

export function usePathname(): string {
  return toGamePath(useNextPathname());
}

export function useLocalSearchParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  const routeParams = useParams();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const result: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(routeParams)) {
      if (value === undefined) continue;
      result[key] = Array.isArray(value) ? value[0] : value;
    }

    searchParams.forEach((value, key) => {
      result[key] = value;
    });

    return result as T;
  }, [routeParams, searchParams]);
}

export function Redirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return null;
}
