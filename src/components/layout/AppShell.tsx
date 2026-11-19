'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Banner } from './Banner';
import { BottomNav } from './BottomNav';

/** Halaman yang tampil tanpa header/nav (onboarding fullscreen). */
const BARE_PATHS = new Set(['/', '/_not-found']);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const bare = BARE_PATHS.has(pathname);

  if (bare) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Banner />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
