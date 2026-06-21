'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const GAME_PREFIXES = ['/play', '/gear', '/craft', '/leaderboard', '/arena', '/collection', '/comparison', '/inspect'];

function isGameRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return GAME_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStats = pathname?.startsWith('/stats');

  if (isStats) {
    return <div className="stats-shell">{children}</div>;
  }

  if (isGameRoute(pathname)) {
    return <div className="phone-shell">{children}</div>;
  }

  return <>{children}</>;
}
