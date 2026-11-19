// Konfigurasi Workbox untuk SAFE NEAR (PWA offline-first).
// Dijalankan SETELAH `next build` (static export ke out/).
//   node scripts/build-sw.mjs
//
// Aturan: PROJECT_CONTEXT.md §15. App shell + tile + POI harus jalan offline.
// Ukuran cache dibatasi agar tidak membengkak (HP menengah).

import { generateSW } from 'workbox-build';

const swDest = 'out/sw.js';

await generateSW({
  globDirectory: 'out/',
  globPatterns: ['**/*.{js,css,html,json,png,svg,ico,txt,webmanifest}'],
  swDest,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,

  // Navigasi offline -> shell (App Router akan menangani route di client).
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/_next\/static\//, /\/icons\//],

  // --- Runtime caching ---
  runtimeCaching: [
    {
      // Tile OpenFreeMap: cache-first, batas wajar (≤3.000 tile / ≤50 MB per aturan offline).
      urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'openfreemap-tiles',
        expiration: {
          maxEntries: 3000,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Overpass API: network-first, cache sbg cadangan offline.
      urlPattern: /^https:\/\/.*overpass.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'overpass',
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Nominatim (geocoding): network-first, cache lama.
      urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'nominatim',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // EmergencyNumberAPI: cache-first (data berubah lambat).
      urlPattern: /^https:\/\/emergencynumberapi\.com\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'emergency-numbers',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

console.log(`SW ditulis ke ${swDest}`);
