'use client';

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import './globals.css';
import { I18nReadyProvider } from '@/components/i18n/provider';
import { PwaRegister } from '@/components/pwa/register';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0ea5e9" />
        <meta
          name="description"
          content="SAFE NEAR — Peta & pendamping keselamatan warga asing (offline-first, gratis)"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-background text-foreground safe-area-inset min-h-screen antialiased">
        <I18nextProvider i18n={i18n}>
          <I18nReadyProvider>{children}</I18nReadyProvider>
        </I18nextProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
