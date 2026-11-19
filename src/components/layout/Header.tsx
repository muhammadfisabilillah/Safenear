'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

/** Header aplikasi: merebrand di kiri, pengaturan di kanan. */
export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <header className="border-border bg-card/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/map" className="touch-target flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            📍
          </span>
          <span className="text-base font-semibold tracking-tight">{t('common.appName')}</span>
        </Link>

        <Link
          href="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className="text-muted-foreground hover:bg-muted touch-target flex items-center gap-1.5 rounded-md px-3 py-2 text-sm"
        >
          <span aria-hidden="true">⚙️</span>
          <span className="hidden sm:inline">{t('common.settings')}</span>
        </Link>
      </div>
    </header>
  );
}
