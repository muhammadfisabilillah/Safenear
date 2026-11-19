# ADR.md — Architecture Decision Records (SAFE NEAR)

> Format ringkas: **Konteks · Keputusan · Alternatif · Konsekuensi**.
> Tambah ADR baru saat ada keputusan arsitektur. Jangan ubah ADR lama; tambahkan revisi.

---

## ADR-001 — Map-first (peta sebagai pilon)

- **Konteks:** Ada beberapa calon pilon: triage AI insiden, konten hak/hukum, atau peta pihak berwajib. Waktu 4 minggu solo.
- **Keputusan:** Peta + navigasi + lapor ringan menjadi MVP. Triage AI & konten hak mendalam ditunda ke fase 2.
- **Alternatif:** (a) LLM triage dulu — menarik tapi risiko akurasi & effort tinggi; (b) konten hukum dulu — risiko kurasi & tanggung jawab tinggi.
- **Konsekuensi:** demo lebih mudah & technically feasible; fase 2 bisa menambah AI di atas data POI yang sudah ada.

---

## ADR-002 — Tanpa login/backend

- **Konteks:** Butuh $0 & privasi maksimal.
- **Keputusan:** PWA murni; prefs & laporan di perangkat.
- **Alternatif:** backend serverless + auth.
- **Konsekuensi:** lebih privat & murah; tidak ada sync antar perangkat, tidak ada akun.

---

## ADR-003 — Repository POI dua sumber (bundle + Overpass)

- **Konteks:** Harus jalan offline, tapi Overpass ada batas.
- **Keputusan:** `PoiRepository` mencoba bundle lokal -> Overpass -> error state.
- **Alternatif:** (a) selalu Overpass (gagal offline/rate limit); (b) selalu bundle (tidak fleksibel).
- **Konsekuensi:** graceful degradation; UI tak peduli sumber.

---

## ADR-004 — Navigasi via Google Maps URLs

- **Konteks:** Butuh navigasi turn-by-turn; Google Maps API berbayar & butuh key.
- **Keputusan:** Pakai URL `https://www.google.com/maps/dir/?api=1&...` (gratis, no key).
- **Alternatif:** (a) Maps API (berbayar); (b) OSRM + render sendiri (effort lebih); (c) ORS (key + atribusi CC-BY-SA).
- **Konsekuensi:** UX terbaik, $0; offline fallback = garis lurus + telepon.

---

## ADR-005 — OSM sebagai sumber POI utama + label verifikasi

- **Konteks:** Butuh data global gratis; akurasi OSM bervariasi.
- **Keputusan:** OSM sebagai sumber utama; tampilkan `source`, `verifiedAt`, `sourceUrl`, peringatan, tombol koreksi.
- **Alternatif:** Google Places (berbayar), Foursquare (berbayar), data berizin tertutup.
- **Konsekuensi:** gratis & global; akurasi dikelola lewat transparansi + koreksi komunitas (fase 2).

---

## ADR-006 — Laporan = dokumen siap kirim (bukan laporan otomatis)

- **Konteks:** Tidak ada API polisi/konsulat terbuka; otomatisasi berisiko legal & etika.
- **Keputusan:** App menyiapkan PDF EN+ID + hash; user yang mengirim ke kanal resmi.
- **Alternatif:** kirim otomatis (tidak mungkin / tidak etis).
- **Konsekuensi:** jujur & aman; tidak mengklaim fitur yang tidak ada.

---

## ADR-007 — Scope pilot 1–2 kota

- **Konteks:** Waktu terbatas; cakupan global ideal tapi tak realistis.
- **Keputusan:** MVP untuk 1–2 kota pilot; arsitektur siap diperluas.
- **Alternatif:** banyak kota setengah matang.
- **Konsekuensi:** kualitas lebih baik; perlu komunikasi "pilot" di demo.

---

## ADR-008 — LLM/triage AI ditunda (fase 2)

- **Konteks:** Ide awal memakai triage AI insiden.
- **Keputusan:** Tidak di MVP. Boleh prototipe ringan hanya bila semua AC MVP hijau lebih awal.
- **Alternatif:** masuk MVP.
- **Konsekuensi:** menghindari risiko hallucinasi & scope creep; narasi AI bisa ditambahkan nanti.

---

## ADR-009 — Nearest pakai haversine + sort (bukan turf)

- **Konteks:** PROJECT_CONTEXT.md §9 menyebut `@turf/turf` & `@turf/nearest-point` untuk jarak/nearest. Implementasi awal memakai haversine + sort.
- **Keputusan:** `nearestPois()` di `src/lib/geo/geo.ts` memakai haversine + pengurutan. turf dipakai hanya bila nanti perlu geometri kompleks (mis. poligon, rute).
- **Alternatif:** (a) `nearest-point` per kandidat — import lebih besar, hasil ekuivalen untuk titik; (b) spiderify/octhree — overkill untuk skala kota.
- **Konsekuensi:** bundle lebih kecil & logika deterministik yang mudah di-test; akurasi haversine cukup untuk radius <10 km (kesalahan <0,5%). Bila nanti butuh jarak jalan (bukan lurus), pakai OSRM.

---

## ADR-010 — Service worker Workbox + bundle data disalin ke static export

- **Konteks:** `output: 'export'` tidak menjalankan server; butuh SW untuk offline + bundle POI harus bisa di-fetch.
- **Keputusan:** `npm run build` = `next build` → `scripts/copy-data.mjs` (salin `data/bundles` & `data/profiles` ke `out/`) → `scripts/build-sw.mjs` (Workbox generateSW). SW precache app shell + runtime cache (tile, Overpass, Nominatim, emergency numbers).
- **Alternatif:** (a) `next-pwa` (plugin, lebih terikat Next); (b) tulis SW manual (effort, rawan salah).
- **Konsekuensi:** SW ikut ke static export; header keamanan (CSP/dll) tetap harus diatur di CDN (Cloudflare `_headers`) karena export statis mengabaikan `headers()`.
- **Revisi (19 Nov 2026):** navigasi offline ke halaman statis ber-query (mis. `/place/?id=...`) sebelumnya jatuh ke `navigateFallback` (halaman onboarding) karena query ikut dicocokkan. Ditambahkan `ignoreURLParametersMatching: [/.*/]` + `directoryIndex: 'index.html'`. Terbukti di browser: `/nearby/` -> klik tempat -> `/place/?id=...` kini memuat halaman detail yang benar.

---

## ADR-011 — Hash laporan dihitung dari konten kanonik (bukan byte PDF)

- **Konteks:** Perlu bukti isi laporan tidak berubah; byte PDF bisa beda antar render (metadata waktu).
- **Keputusan:** `hashReport()` meng-KANONIKASI objek laporan (key terurut rekursif) lalu SHA-256. PDF menampilkan hash yang sama.
- **Alternatif:** hash byte PDF (tidak stabil), timestamp server (tidak ada server).
- **Konsekuensi:** hash stabil lintas perangkat untuk isi yang sama; perubahan satu karakter deskripsi mengubah hash.

---

## ADR-013 — PDF laporan: `renderToBuffer` (Node) vs `pdf().toBlob()` (browser)

- **Konteks:** `renderReportPdf()` awal memakai `renderToBuffer` dari `@react-pdf/renderer`. Di Node (unit test) berhasil, tapi di browser ekspor PDF gagal diam-diam.
- **Keputusan:** dua fungsi terpisah di `src/lib/report/pdf.tsx`: `renderReportPdf()` (Node/SSR, `renderToBuffer`) untuk test; `renderReportPdfBrowser()` (UI, `pdf(<Doc/>).toBlob()`). Hash dihitung terpisah dari render (ADR-011), lalu ditempel ke laporan via `attachPdfHash`.
- **Alternatif:** satukan dengan `pdf().toBlob()` di semua lingkungan (belum terbukti di Node).
- **Konsekuensi:** UI memakai jalur browser yang benar; test tetap memakai jalur Node yang cepat. Terbukti: ekspor PDF di browser menyimpan `pdfHash` dan mengunduh berkas.

---

## ADR-012 — Offline: bundle POI eksplisit, tile via SW cache

- **Konteks:** AC T12 menyebut "unduh area (tile + POI + profil)". Mengunduh tile vector OpenFreeMap secara eksplisit butuh enumerasi tile + batas ≤3.000 tile/≤50 MB/≤4 request paralel, dan berisiko salah konfigurasi URL.
- **Keputusan:** Halaman `/offline` mengunduh **bundle POI** ke IndexedDB (eksplisit, terukur). Tile dikelola **otomatis oleh service worker** (CacheFirst untuk `tiles.openfreemap.org`), sehingga tile yang pernah dimuat tersedia offline. Profil hak/hotline sudah ter-bundle di app sejak instal.
- **Alternatif:** (a) enumerasi tile manual — effort & risiko melanggar aturan OpenFreeMap; (b) PMTiles per kota — butuh pipeline planetiler & aset besar (fase 2).
- **Konsekuensi:** status unduhan jujur (POI terukur; tile "via SW cache"); fitur inti (peta area yang pernah dibuka, POI, lapor, kartu hak) tetap jalan offline. Perlu pesan UI yang jelas agar user paham cakupannya.
