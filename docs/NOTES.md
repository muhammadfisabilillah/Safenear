# CATATAN PENGERJAAN — SAFE NEAR

> Dokumen ini untuk **Muhammad**. Baca sebelum lanjut kerja agar tidak kehilangan arah.
> Update tiap selesai 1 task. Tanggal terakhir update: **19 Nov 2026**.

---

## 1. Status saat ini (19 Nov 2026)

| Task | Status | Bukti |
|---|---|---|
| T0 Setup repo & tooling | ✅ Selesai (B1) | `npm run build` hijau, `npm run lint` 0 error, `npm run test` 15 lulus |
| T1 PWA shell | 🚧 Parsial | i18n + layout ✓. **Belum**: manifest, icons, Workbox SW |
| T2 Skema data + validasi | ✅ Selesai | `types.ts`, `normalize.ts`, profil ID/PH/BD/NP, 15 test hijau |
| T3 Ingest POI | 🚧 Script siap | `scripts/fetch-poi.ts` ada, **belum dijalankan** |
| T4 Onboarding + prefs | ✅ Selesai | `/`, `prefs/store.ts` (IndexedDB) |

**Sisa waktu:** ±13 hari (deadline 2 Des 2026).
**Prioritas:** backend/fondasi dulu, frontend design rapi belakangan.

---

## 2. Arsitektur (PENTING — baca)

SAFE NEAR **tidak punya backend server**. Semua logika jalan di browser.

```
[Browser] Next.js static export (output: 'export')
   ├─ App shell + JS + CSS  -> Workbox precache (offline)
   ├─ Tile peta             -> OpenFreeMap (online) / PMTiles (offline, OPFS)
   ├─ POI                   -> bundle JSON lokal (IndexedDB) / Overpass (online fallback)
   ├─ Geolocation + turf    -> jarak & nearest
   ├─ Navigasi              -> Google Maps URL (eksternal, no key)
   ├─ Laporan               -> IndexedDB -> @react-pdf/renderer -> PDF lokal
   └─ Prefs                 -> IndexedDB (lokal)
```

**Tidak ada:** login, cloud sync, PII ke server, layanan berbayar.

---

## 3. Rencana malam ini (Backend/Fondasi)

| # | Task | Output | AC | Status |
|---|---|---|---|---|
| B1 | ESLint + Vitest config | `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts` | lint & test hijau | ✅ |
| B2 | PWA manifest + icons | `public/manifest.webmanifest`, `icons/icon-192.png`, `icon-512.png` | build menghasilkan manifest, icon ada | 🚧 |
| B3 | Workbox service worker | `next.config.mjs` + SW config | `npm run build` generate `sw.js`, app shell precache | ⬜ |
| B4 | Fetch POI Houston | `data/bundles/US-houston.json` | script selesai, bundle valid | ⬜ |
| B5 | Commit & push | git | tiap task commit + push | ⬜ |

---

## 4. Rencana minggu depan (Frontend Core)

- **T5** MapLibre + tile OpenFreeMap + marker user + chips kategori (`/map`)
- **T6** POI repository (bundle/Overpass) + nearest 5 (`/nearby`)
- **T7** Detail tempat + tombol navigasi/telepon + sumber/verifikasi (`/place/[id]`)
- **T8** Navigasi Google Maps URL + fallback garis lurus
- **T9** Kartu hak (Pasal 36 + gangguan) offline (`/rights`)

---

## 5. Rencana minggu 3 (Lapor + Offline)

- **T10** Form lapor + zod + IndexedDB + bukti foto (`/report/new`)
- **T11** PDF EN+ID + hash SHA-256 + share (`/report/[id]`)
- **T12** Unduh area (tile + POI + profil) + hapus data (`/offline`)
- **T13** Pengaturan + About + atribusi (`/settings`, `/about`)

---

## 6. Rencana minggu 4 (Polish + Demo)

- **T14** Uji HP nyata (Android menengah)
- **T15** Aksesibilitas + keamanan (CSP, SRI, cek network tab: no PII)
- **T16** Video demo 60 detik + README + slide
- **T17** Buffer + submit Devpost

---

## 7. Aturan kerja (jangan dilanggar)

1. **100% gratis** — hanya OSS / free-tier. Dilarang API berbayar & key berbayar.
2. **Tanpa login / cloud sync** — data lokal (IndexedDB/OPFS).
3. **Privasi default** — tidak ada PII keluar perangkat.
4. **Offline-first** — fitur inti (peta area, POI, lapor, kartu hak) wajib jalan offline.
5. **Jangan scope creep** — Non-Goals §4.2 dilarang (LLM, panic button, blockchain, dsb).
6. **Atribusi** — OSM ODbL wajib tampil di `/about`. Jangan hapus.
7. **Setiap task selesai:** commit + push + update `docs/ROADMAP.md` (`[x]`).
8. **Bloker?** STOP, catat di sini, tanya Muhammad.

---

## 8. Blocker / Catatan teknis

- Next.js 14 `output: 'export'` → header custom di `next.config.mjs` **tidak** ikut ke static export (warning). Header (CSP dll) harus ditaruh di server/CDN (Cloudflare Pages `_headers` file) nanti.
- `@vitejs/plugin-react` dipakai versi **4** (bukan 6) karena vitest 2.1 pakai vite 5 yang masih CJS.
- Next 14 `next lint` tidak mendukung flat config → script `lint` diganti `eslint .`.
- `eslint-plugin-next` (dummy) dihapus; pakai `@next/eslint-plugin-next` bawaan `eslint-config-next`.

---

## 9. Perintah penting

```bash
npm run dev        # http://localhost:3000
npm run build      # static export ke out/
npm run lint       # eslint .
npm run test       # vitest run
npm run data:fetch -- --country US --city Houston --lat 29.7604 --lon -95.3698 --out data/bundles/US-houston.json
```