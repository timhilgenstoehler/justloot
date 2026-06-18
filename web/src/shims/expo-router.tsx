'use client';

import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { useEffect, useMemo } from 'react';

type Router = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  canGoBack: () => boolean;
};

export function useRouter(): Router {
  const router = useNextRouter();
  const pathname = usePathname();

  return useMemo(
    () => ({
      push: (href: string) => {
        router.push(normalizeHref(href));
      },
      replace: (href: string) => {
        router.replace(normalizeHref(href));
      },
      back: () => {
        router.back();
      },
      canGoBack: () => {
        if (typeof window === 'undefined') return false;
        return window.history.length > 1 && pathname !== '/';
      },
    }),
    [router, pathname],
  );
}

export function useLocalSearchParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  const params = useSearchParams();
  return useMemo(() => {
    const result: Record<string, string | undefined> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result as T;
  }, [params]);
}

export function Redirect({ href }: { href: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return null;
}

function normalizeHref(href: string): string {
  if (href.startsWith('/')) return href;
  return `/${href}`;
}
