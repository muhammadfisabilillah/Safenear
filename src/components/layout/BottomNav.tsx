'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export interface NavItem {
  href: string;
  key: string;
  icon: string;
  /** Match longs (mis. /nearby/anything). */
  match?: (pathname: string) => boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/map', key: 'map', icon: '🗺️', match: (p) => p === '/map' || p.startsWith('/map/') },
  {
    href: '/nearby',
    key: 'nearby',
    icon: '📍',
    match: (p) => p === '/nearby' || p.startsWith('/nearby/'),
  },
  {
    href: '/rights',
    key: 'rights',
    icon: '⚖️',
    match: (p) => p === '/rights' || p.startsWith('/rights/'),
  },
  {
    href: '/report/new',
    key: 'report',
    icon: '📝',
    match: (p) => p === '/report/new' || p.startsWith('/report/new/'),
  },
  {
    href: '/offline',
    key: 'offline',
    icon: '⬇️',
    match: (p) => p === '/offline' || p.startsWith('/offline/'),
  },
  {
    href: '/settings',
    key: 'settings',
    icon: '⚙️',
    match: (p) => p === '/settings' || p.startsWith('/settings/'),
  },
];

/** Navigasi bawah untuk HP: 6 item, target sentuh >= 44px. */
export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label={t('common.appName')}
      className="border-border bg-card/95 sticky bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-3xl list-none">
        {NAV_ITEMS.map((item) => {
          const active = item.match ? item.match(pathname) : pathname === item.href;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] leading-tight transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                {t(`common.${item.key}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
