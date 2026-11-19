# CATATAN PENGERJAAN — SAFE NEAR

> Dokumen ini untuk **Muhammad**. Baca sebelum lanjut kerja agar tidak kehilangan arah.
> Update tiap selesai 1 task. Tanggal terakhir update: **19 Nov 2026 (malam)**.

---

## 1. Status saat ini (19 Nov 2026, sesi malam)

| Task                      | Status            | Bukti                                                                                                  |
| ------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| T0 Setup repo & tooling   | ✅ Selesai        | build hijau, lint 0 error, format (Prettier)                                                           |
| T1 PWA shell              | ✅ Sebagian       | manifest, icons (192/512/maskable), Workbox SW, i18n. **Header/BottomNav/Banner → T5**                 |
| T2 Skema data + validasi  | ✅ Selesai        | `types.ts`, `schema.ts` (zod), `normalize.ts`, profil ID/PH/BD/NP                                      |
| T3 Ingest POI             | ✅ Selesai        | `data/bundles/US-houston.json` — **47 POI** (police 15, hospital 12, fire 14, courthouse 5, embassy 1) |
| T4 Onboarding + prefs     | ✅ Sebagian       | `/` + IndexedDB store. Redirect ke `/settings` → T13                                                   |
| T6 Repository + nearest   | ✅ Logika selesai | `repository.ts`, `geo.ts`, `bundle.ts`, `overpass.ts`. **UI `/nearby` → T6 sisa**                      |
| T8 Navigasi               | ✅ Logika selesai | `routing/mapsUrl.ts` (Google URL). **UI + fallback → T8 sisa**                                         |
| T10 Form lapor            | ✅ Logika selesai | `report/store.ts`, `report/content.ts`                                                                 |
| T11 PDF                   | ✅ Logika selesai | `report/pdf.tsx` + `hash.ts` (teruji render PDF nyata)                                                 |
| T12 Offline               | ✅ Logika selesai | `offline/manager.ts` + SW runtime cache (ADR-012)                                                      |
| T7 Detail, T9 Hak, T13 UI | ⬜ Belum          | —                                                                                                      |

**Test:** 143 lulus · **lint:** bersih · **build:** hijau + `out/sw.js`.
**Backend/fondasi = SELESAI.** Sisa: UI/frontend.

---

## 2. Arsitektur (PENTING — baca)

SAFE NEAR **tidak punya backend server**. Semua logika jalan di browser.

```
[Browser] Next.js static export (output: 'export')
   ├─ App shell + JS + CSS  -> Workbox precache (offline)
   ├─ Tile peta             -> OpenFreeMap (online) / SW cache (offline)
   ├─ POI                   -> bundle JSON lokal (IndexedDB) / Overpass (online fallback)
   ├─ Geospasial            -> haversine + sort (ADR-009; bukan turf)
   ├─ Navigasi              -> Google Maps URL (eksternal, no key)
   ├─ Laporan               -> IndexedDB -> @react-pdf/renderer -> PDF lokal
   └─ Prefs                 -> IndexedDB (lokal)
```

**Tidak ada:** login, cloud sync, PII ke server, layanan berbayar.

---

## 3. Rencana sesi malam ini (Backend/Fondasi) — ✅ SELESAI

| #   | Task                                                    | Output                                                              | Status |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| B1  | ESLint + Vitest config                                  | `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`          | ✅     |
| B2  | PWA manifest + icons                                    | `public/manifest.webmanifest`, `icons/icon-192.png`, `icon-512.png` | ✅     |
| B3  | Workbox service worker                                  | `scripts/build-sw.mjs` + `PwaRegister`                              | ✅     |
| B4  | Fetch POI Houston                                       | `data/bundles/US-houston.json` (47 POI, bbox akurat)                | ✅     |
| B5  | Commit & push                                           | 6 commit di GitHub                                                  | ✅     |
| B6  | Backend inti (geo, routing, repository, schema, report) | `src/lib/**`                                                        | ✅     |
| B7  | Emergency numbers + offline manager                     | `lib/emergency/numbers.ts`, `lib/offline/manager.ts` (ADR-012)      | ✅     |

---

## 4. Rencana sesi berikutnya (Frontend Core) — DIMULAI SINI

**Urutan yang disarankan (satu sesi = satu halaman):**

1. **T5 — Kerangka layout + peta** (`/map`): `Header`, `BottomNav` (6 menu), `Banner` disclaimer, `MapView` MapLibre + OpenFreeMap `liberty` + marker user + chips kategori.
2. **T6 sisa — `/nearby?category=...`**: `PoiList`, `PoiCard`, `DistanceBadge` (pakai `PoiRepository`).
3. **T7 — `/place/[id]`**: detail + tombol Navigasi/Telepon/Bagikan/Lapor salah + panel sumber/verifikasi.
4. **T8 sisa — fallback offline**: garis lurus di peta + alamat + telepon + catatan.
5. **T9 — `/rights`**: 2 kartu hak (Pasal 36 + gangguan) dari profil + hotline kedaulatan.
6. **T10/T11 sisa — `/report/new` & `/report/[id]`**: form + preview PDF + tombol bagikan.
7. **T12/T13 sisa — `/offline`, `/settings`, `/about`**: unduh area, hapus data, atribusi.

---

## 5. Rencana minggu 3–4 ( ringkas )

- **T14** Uji HP nyata (Android menengah)
- **T15** Aksesibilitas + keamanan (CSP, SRI, cek network tab: no PII)
- **T16** Video demo 60 detik + README + slide
- **T17** Buffer + submit Devpost

---

## 6. Aturan kerja (jangan dilanggar)

1. **100% gratis** — hanya OSS / free-tier. Dilarang API berbayar & key berbayar.
2. **Tanpa login / cloud sync** — data lokal (IndexedDB/OPFS).
3. **Privasi default** — tidak ada PII keluar perangkat.
4. **Offline-first** — fitur inti (peta area, POI, lapor, kartu hak) wajib jalan offline.
5. **Jangan scope creep** — Non-Goals §4.2 dilarang (LLM, panic button, blockchain, dsb).
6. **Atribusi** — OSM ODbL wajib tampil di `/about`. Jangan hapus.
7. **Setiap task selesai:** commit + push + update `docs/ROADMAP.md` (`[x]`) + `docs/NOTES.md`.
8. **Bloker?** STOP, catat di sini, tanya Muhammad.

---

## 7. Blocker / Catatan teknis

- Next.js 14 `output: 'export'` → header custom di `next.config.mjs` **tidak** ikut ke static export (warning). Header (CSP dll) harus di Cloudflare Pages `_headers` file nanti.
- `@vitejs/plugin-react` versi **4** (bukan 6) karena vitest 2.1 pakai vite 5 (CJS).
- Next 14 `next lint` tak mendukung flat config → script `lint` = `eslint .`.
- `eslint-plugin-next` (dummy) dihapus; pakai `@next/eslint-plugin-next`.
- `tsconfig.json` butuh `target: ES2020` (untuk `Array.prototype.entries()`).
- `next build` gagal bila `data/bundles` kosong? Tidak — `copy-data.mjs` membuat folder `out/bundles`.
- PDF render diuji di Node (bukan jsdom): `renderToBuffer` dari `@react-pdf/renderer`.
- **Belum ada halaman selain `/`.** Semua AC frontend menunggu T5+.
- **Uji browser (penting):** service worker lama menjebak navigasi (`navigateFallback` → halaman onboarding → redirect `/map`). Sebelum menguji route baru di browser, jalankan: unregister semua SW + `caches.delete` semua, baru buka route. Prefs/laporan kadang hilang antar call browser headless — seed prefs lewat IndexedDB bila perlu, dan uji alur end-to-end dalam satu call.
- **Port 3000** dipakai proyek lain; server statis uji di **3111** (`npx serve out -l 3111`).

---

## 8. Perintah penting

```bash
npm run dev          # http://localhost:3000
npm run build        # next build -> copy-data -> Workbox SW (out/)
npm run lint         # eslint .
npm run test         # vitest run (143 test)
npm run format       # prettier --write
npm run data:fetch   # Overpass -> bundle (contoh: lihat NOTES lama)
npm run data:validate
```
