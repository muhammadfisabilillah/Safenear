'use client';

import { useEffect } from 'react';

/**
 * Mendaftarkan service worker (Workbox) saat build produksi.
 * Dev mode dimatikan agar HMR Next.js tidak bentrok dengan cache SW.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.onstatechange = () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                // Versi baru siap; Workbox pakai skipWaiting, cukup beri tahu user.
                console.info('SAFE NEAR: versi baru tersedia (SW).');
              }
            };
          };
        })
        .catch((err) => console.warn('SW gagal didaftarkan:', err));
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
