# ROADMAP.md — Task Breakdown 28 Hari (SAFE NEAR)

> Turunan dari `PROJECT_CONTEXT.md` §20. Satu task = satu sesi. Jangan loncat.
> Setiap task punya **Acceptance Criteria (AC)**; centang setelah terpenuhi + dibuktikan.

Legenda status: `[ ]` belum · `[~]` progres · `[x]` selesai + terbukti

---

## MINGGU 1 — Fondasi + Data

### T0 — Setup repo & tooling
- [ ] Repo `safe-near`, Next.js 14 App Router, TS strict, Tailwind, ESLint, Prettier, Vitest.
- [ ] `.gitignore` (node_modules, .next, .env*, cache/), `.env.example`.
- [ ] README awal (cara jalankan).
- **AC:** `npm install && npm run dev` jalan; `npm run build` hijau; `npm run lint` hijau.

### T1 — PWA shell
- [ ] `manifest.webmanifest`, ikon 192/512, Workbox precache, service worker.
- [ ] Layout dasar: Header, BottomNav, Banner disclaimer.
- [ ] i18next id/en + deteksi bahasa.
- **AC:** `npm run build` menghasilkan SW; install prompt muncul; bahasa id/en berpindah; banner "bukan layanan darurat" selalu tampil.

### T2 — Skema data + validasi
- [ ] `src/lib/poi/types.ts` (Poi, Category, CountryProfile, UserPrefs, IncidentReport, PoiBundle).
- [ ] zod schema untuk semua tipe + normalisasi OSM (`normalizeOsm`).
- [ ] `data/profiles/{ID,PH,BD,NP}.json` (lengkap, hotline resmi terverifikasi).
- **AC:** test unit normalisasi lulus (kasus: node, way/relation pakai `center`, nama kosong, telepon tak valid).

### T3 — Ingest POI
- [ ] `scripts/fetch-poi.ts` (Overpass, User-Agent khusus, rate limit 1/dtk).
- [ ] Normalisasi -> `data/bundles/<country>-<city>.json`.
- [ ] Validasi zod + laporan jumlah per kategori.
- **AC:** untuk Houston, bundle berisi polisi/RS/dll; hash & attribution tercatat; gagal fetch -> pesan jelas, bundle kosong tidak ditulis.

### T4 — Onboarding + prefs
- [ ] Halaman `/`: pilih kewarganegaraan, negara tuan rumah, kota (pilot), bahasa.
- [ ] `src/lib/prefs/store.ts` (IndexedDB, tanpa login).
- [ ] Lewati onboarding bila sudah ada prefs; ubah di `/settings`.
- **AC:** prefs tersimpan & bertahan reload; pilihan kota memuat bundle yang benar; bisa ubah.

**DoD M1:** app berjalan; onboarding tersimpan; bundle Houston dari OSM; build+lint hijau.

---

## MINGGU 2 — Peta + Terdekat + Navigasi

### T5 — Peta dasar
- [ ] MapLibre GL JS + style OpenFreeMap `liberty` + attribution.
- [ ] Geolocation -> marker user; tombol "locate me".
- [ ] Chips kategori (police/hospital/embassy/fire/courthouse/shelter).
- **AC:** peta tampil <3 dtk; marker user; chip filter berfungsi; attribution OSM tampil.

### T6 — POI repository + nearest
- [ ] `src/lib/poi/repository.ts`: coba bundle lokal -> fallback Overpass -> error state.
- [ ] nearest 5 via `@turf/nearest-point`; jarak (haversine) + estimasi waktu.
- [ ] Halaman `/nearby?category=...` + `PoiList`.
- **AC:** hasil <2 dtk online, <1 dtk offline; urutan terdekat benar (uji dengan titik known); data kosong -> pesan + tombol unduh.

### T7 — Detail tempat
- [ ] `/place/[id]`: nama, alamat, telepon (`tel:`), jam buka, url, kategori.
- [ ] Panel sumber: `source`, `verifiedAt`, `sourceUrl`, peringatan "verifikasi dulu".
- [ ] Tombol: Navigasi, Telepon, Bagikan, "Laporkan tempat salah".
- **AC:** field kosong -> "tidak tersedia"; navigasi membuka URL benar; tombol koreksi mencatat (lokal, fase 2 publish).

### T8 — Navigasi
- [ ] `src/lib/routing/mapsUrl.ts`: builder Google Maps URL (`api=1`, destination lat/lon, travelmode, dir_action=navigate).
- [ ] Fallback offline: garis lurus (turf) + alamat + telepon + catatan "navigasi butuh internet".
- [ ] (Opsional) OSRM client + Docker self-host.
- **AC:** URL valid & tanpa key; tujuan = koordinat tempat; mode offline tidak error.

### T9 — Kartu hak
- [ ] `/rights`: kartu "Ditangkap/ditahan (Pasal 36 Konvensi Wina)" + "Diganggu di ruang publik".
- [ ] Script bahasa Inggris + Indonesia; tautan sumber; disclaimer "bukan nasihat hukum".
- [ ] Bundle offline.
- **AC:** tampil offline; teks ≤ ~120 kata per kartu; sumber tertera.

**DoD M2:** ≤3 ketukan dari peta ke 5 terdekat + navigasi; detail tampil sumber; kartu hak offline.

---

## MINGGU 3 — Lapor + Offline

### T10 — Form lapor
- [ ] `/report/new`: kategori, waktu (default now), lokasi (GPS + edit), deskripsi, saksi (opsional), bukti (foto).
- [ ] zod validation; simpan `IncidentReport` di IndexedDB; bukti di OPFS (maks ukuran wajar).
- **AC:** laporan tersimpan & bisa dibuka lagi; validasi menolak input tak lengkap; bukti tidak dikirim ke jaringan.

### T11 — PDF
- [ ] `@react-pdf/renderer`: PDF EN+ID (identitas opsional, kronologi, lokasi, deskripsi, saksi, daftar bukti, hash SHA-256, timestamp, disclaimer).
- [ ] Tombol bagikan (Web Share API) / unduh.
- **AC:** PDF terbuka; hash konsisten dengan isi; EN & ID sama-sama ada.

### T12 — Offline penuh
- [ ] `/offline`: unduh area (tile PMTiles + POI bundle + profil hak) dengan progres.
- [ ] Simpan di OPFS; mode pesawat mengetes peta/POI/lapor/kartu hak.
- [ ] Hapus area + hapus semua data.
- **AC:** semua fitur inti jalan di mode pesawat setelah unduh; hapus berfungsi; status storage tampil.

### T13 — Pengaturan + About
- [ ] `/settings`: ubah kewarganegaraan/negara/bahasa; info privasi; "hapus semua data".
- [ ] `/about`: atribusi lengkap (DATA.md §9), lisensi, disclaimer, sumber.
- **AC:** semua sumber tampil; hapus semua data menghapus prefs+laporan+bundle.

**DoD M3:** laporan -> PDF EN+ID; fitur inti offline; atribusi tampil.

---

## MINGGU 4 — Uji, Polish, Demo

### T14 — Uji perangkat
- [ ] Android menengah (4 GB), iOS bila memungkinkan;uji onboarding -> terdekat -> navigasi -> lapor -> offline.
- [ ] Perbaiki bug & UX.
- **AC:** flow end-to-end lulus di HP nyata; tidak ada crash.

### T15 — Aksesibilitas + keamanan
- [ ] WCAG 2.1 AA dasar (kontras, label, fokus, sentuh ≥44px).
- [ ] CSP, SRI, HTTPS; pastikan tidak ada PII keluar perangkat (cek network tab).
- **AC:** audit dasar hijau; bukti network bersih.

### T16 — Demo + dokumentasi
- [ ] Video demo 60 detik (3 adegan: peta -> terdekat+navigasi -> lapor PDF offline).
- [ ] README: cara jalan, arsitektur, sumber, disclaimer, cara kontribusi.
- [ ] Slide presentasi (impact, originality, teknik, demo).
- **AC:** video jelas; README lengkap; siap Devpost.

### T17 — Buffer + submission
- [ ] Perbaikan bug; uji ulang AC; bersihkan repo.
- [ ] Submit Devpost (deskripsi, repo, video).
- **AC:** semua AC §7 terpenuhi; build/lint/test hijau.

**DoD M4:** siap lomba.

---

## Checklist global sebelum submit

- [ ] `PROJECT_CONTEXT.md` §4.1 (semua Tujuan MVP) terpenuhi.
- [ ] §4.2 (Non-Goals) tidak dilanggar.
- [ ] §5 (C1–C10) dipatuhi.
- [ ] Atribusi §23 tampil & benar.
- [ ] Tidak ada API berbayar / key berbayar.
- [ ] Tidak ada PII ke server.
- [ ] Build, lint, test hijau.
- [ ] Demo + README siap.
