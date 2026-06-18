'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStats = pathname?.startsWith('/stats');

  if (isStats) {
    return <div className="stats-shell">{children}</div>;
  }

  return <div className="phone-shell">{children}</div>;
}
