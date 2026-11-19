# ROADMAP.md — Task Breakdown 28 Hari (SAFE NEAR)

> Turunan dari `PROJECT_CONTEXT.md` §20. Satu task = satu sesi. Jangan loncat.
> Setiap task punya **Acceptance Criteria (AC)**; centang setelah terpenuhi + dibuktikan.

Legenda status: `[ ]` belum · `[~]` progres · `[x]` selesai + terbukti

---

## MINGGU 1 — Fondasi + Data

### T0 — Setup repo & tooling

- [x] Repo `safe-near`, Next.js 14 App Router, TS strict, Tailwind, ESLint, Prettier, Vitest.
- [x] `.gitignore` (node_modules, .next, .env*, cache/), `.env.example`.
- [x] README awal (cara jalankan).
- **AC:** `npm install && npm run dev` jalan; `npm run build` hijau; `npm run lint` hijau.

### T1 — PWA shell

- [x] `manifest.webmanifest`, ikon 192/512, Workbox precache, service worker.
- [x] i18next id/en + deteksi bahasa.
- [ ] Layout dasar: Header, BottomNav, Banner disclaimer. _(dikerjakan bersama T5)_
- **AC:** `npm run build` menghasilkan SW; install prompt muncul; bahasa id/en berpindah; banner "bukan layanan darurat" selalu tampil.

### T2 — Skema data + validasi

- [x] `src/lib/poi/types.ts` (Poi, Category, CountryProfile, UserPrefs, IncidentReport, PoiBundle).
- [x] zod schema untuk semua tipe + normalisasi OSM (`normalizeOsm`).
- [x] `data/profiles/{ID,PH,BD,NP}.json` (lengkap, hotline resmi terverifikasi).
- **AC:** test unit normalisasi lulus (kasus: node, way/relation pakai `center`, nama kosong, telepon tak valid).

### T3 — Ingest POI

- [x] `scripts/fetch-poi.ts` (Overpass, User-Agent khusus, rate limit 1/dtk).
- [x] Normalisasi -> `data/bundles/<country>-<city>.json`.
- [x] Validasi zod + laporan jumlah per kategori.
- **AC:** untuk Houston, bundle berisi polisi/RS/dll; hash & attribution tercatat; gagal fetch -> pesan jelas, bundle kosong tidak ditulis.

### T4 — Onboarding + prefs

- [x] Halaman `/`: pilih kewarganegaraan, negara tuan rumah, kota (pilot), bahasa.
- [x] `src/lib/prefs/store.ts` (IndexedDB, tanpa login).
- [x] Lewati onboarding bila sudah ada prefs; ubah di `/settings`.
- **AC:** prefs tersimpan & bertahan reload; pilihan kota memuat bundle yang benar; bisa ubah.
- **Catatan (19 Nov 2026):** daftar negara tuan rumah dipisah dari profil kewarganegaraan (`HOST_COUNTRIES`) supaya "US" bisa dipilih; `UserPrefs.cityBundleId` menyimpan slug bundle (lebih andal daripada derivasi label).

**DoD M1:** app berjalan; onboarding tersimpan; bundle Houston dari OSM; build+lint hijau.

---

## MINGGU 2 — Peta + Terdekat + Navigasi

### T5 — Peta dasar

- [x] MapLibre GL JS + style OpenFreeMap `liberty` + attribution.
- [x] Geolocation -> marker user; tombol "locate me" (GeolocateControl).
- [x] Chips kategori (police/hospital/embassy/fire/courthouse/shelter).
- **AC:** peta tampil <3 dtk; marker user; chip filter berfungsi; attribution OSM tampil.
- **Bukti (19 Nov 2026):** dibuka di browser headless -> peta Houston tampil, marker polisi tampil, klik chip "Polisi" -> 47 menjadi 15 tempat, atribusi "OpenFreeMap © OpenMapTiles Data from OpenStreetMap" tampil.

### T6 — POI repository + nearest

- [x] `src/lib/poi/repository.ts`: coba bundle lokal -> fallback Overpass -> error state.
- [x] nearest 5 (haversine + sort, lihat ADR-009) + jarak & estimasi waktu.
- [x] Halaman `/nearby?category=...` + `PoiList`.
- **AC:** hasil <2 dtk online, <1 dtk offline; urutan terdekat benar (uji dengan titik known); data kosong -> pesan + tombol unduh.
- **Bukti (19 Nov 2026):** UI headless menampilkan 5 polisi terdekat Houston: 511 m, 551 m, 1,2 km, 1,2 km, 1,3 km (urut benar) + estimasi jalan/kendaraan; label sumber bundle lokal.

### T7 — Detail tempat

- [x] `/place?id=...`: nama, alamat, telepon (`tel:`), jam buka, url, kategori.
- [x] Panel sumber: `source`, `verifiedAt`, `sourceUrl`, peringatan "verifikasi dulu".
- [x] Tombol: Navigasi, Telepon, Bagikan, "Lapor tempat salah".
- **AC:** field kosong -> "tidak tersedia"; navigasi membuka URL benar; tombol koreksi mencatat (lokal, fase 2 publish).
- **Bukti (19 Nov 2026):** halaman detail tampil; field kosong -> "not available"; tombol Navigate -> `https://www.google.com/maps/dir/?api=1&destination=29.7649432,-95.3706247&travelmode=walking&dir_action=navigate`; koreksi tersimpan di IndexedDB (`corrections`: reason `wrong-info`, note, `status: pending`).

### T8 — Navigasi

- [x] `src/lib/routing/mapsUrl.ts`: builder Google Maps URL (`api=1`, destination lat/lon, travelmode, dir_action=navigate).
- [x] Fallback offline: catatan `OfflineNote` (navigator.onLine) + alamat + telepon + estimasi; mode offline tidak error.
- [ ] (Opsional) OSRM client + Docker self-host.
- **AC:** URL valid & tanpa key; tujuan = koordinat tempat; mode offline tidak error.
- **Bukti (19 Nov 2026):** tombol Navigate -> URL Google Maps `api=1` dengan destination = koordinat tempat; `OfflineNote` tampil saat `navigator.onLine=false` (test).

### T9 — Kartu hak

- [x] `/rights`: kartu "Ditangkap/ditahan (Pasal 36 Konvensi Wina)" + "Diganggu di ruang publik".
- [x] Script bahasa Inggris + Indonesia; tautan sumber; disclaimer "bukan nasihat hukum".
- [x] Bundle offline (konten statis + profil ter-bundle).
- **AC:** tampil offline; teks singkat; ada disclaimer "bukan nasihat hukum".
- **Bukti (19 Nov 2026):** `/rights` menampilkan hak konsuler Pasal 36 + hotline Peduli WNI; semua konten lokal (tanpa fetch).

**DoD M2:** ≤3 ketukan dari peta ke 5 terdekat + navigasi; detail tampil sumber; kartu hak offline.

---

## MINGGU 3 — Lapor + Offline

### T10 — Form lapor

- [x] `/report/new`: kategori, waktu (default now), lokasi (GPS + edit), deskripsi, saksi (opsional), bukti (foto).
- [x] zod validation; simpan `IncidentReport` di IndexedDB; bukti di evidence store (maks 5 MB).
- **AC:** laporan tersimpan & bisa dibuka lagi; validasi menolak input tak lengkap; bukti tidak dikirim ke jaringan.
- **Bukti (19 Nov 2026):** form tampil, submit -> redirect `/report?id=...`, laporan muncul di daftar; test validasi (deskripsi kosong ditolak).

### T11 — PDF

- [x] `@react-pdf/renderer`: PDF EN+ID (identitas opsional, kronologi, lokasi, deskripsi, saksi, daftar bukti, hash SHA-256, timestamp, disclaimer).
- [x] Tombol bagikan (Web Share API) / unduh.
- **AC:** PDF terbuka; hash konsisten dengan isi; EN & ID sama-sama ada.
- **Bukti (19 Nov 2026):** di browser, klik "Export PDF" -> pesan "PDF downloaded (EN+ID + hash)" + `pdfHash` tersimpan (`849b5485…cf996`). Node: `renderToBuffer` menghasilkan buffer berawalan `%PDF-`; hash deterministik.

### T12 — Offline penuh

- [x] `/offline`: unduh area (bundle POI) dengan progres; profil hak sudah ter-bundle.
- [x] Simpan di IndexedDB; status storage tampil (usage/quota/percent).
- [x] Hapus area + hapus semua data.
- [ ] Mode pesawat mengetes peta/POI/lapor/kartu hak (uji manual HP).
- **AC:** semua fitur inti jalan di mode pesawat setelah unduh; hapus berfungsi; status storage tampil.
- **Bukti (19 Nov 2026):** klik "Download area" -> pesan "Area ready for offline use" + bundle `US-houston` (47 POI) tersimpan di IndexedDB; status storage & tombol hapus tampil.

### T13 — Pengaturan + About

- [x] `/settings`: ubah kewarganegaraan/negara/bahasa; info privasi; "hapus semua data".
- [x] `/about`: atribusi lengkap (OSM/ODbL, OpenFreeMap, Overpass, EmergencyNumberAPI, VCCR, Kemenlu), lisensi, disclaimer, sumber.
- [ ] Uji "hapus semua data" benar-benar membersihkan prefs+laporan+bundle+koreksi.
- **AC:** semua sumber tampil; hapus semua data menghapus prefs+laporan+bundle.
- **Bukti (19 Nov 2026):** `/settings` (4 select + tombol hapus) dan `/about` (atribusi OSM, OpenFreeMap, Vienna tampil).

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
