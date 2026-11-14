# AGENTS.md — SAFE NEAR

> File ini dibaca otomatis oleh OpenCode. Bacalah **PROJECT_CONTEXT.md**
> (dokumen induk) sebelum menulis kode apa pun.

## 1. Proyek dalam 3 kalimat

**SAFE NEAR** adalah PWA offline-first yang membantu **warga asing di negara mana pun** menemukan **pihak berwajib terdekat** (polisi, RS/UGD, kedutaan negara mereka, pemadam, pengadilan, shelter) lewat peta, menavigasinya, dan menyiapkan laporan insiden yang rapi (PDF EN+ID).

Target: hackaton **Code for Change 2026** (HackathonForEveryone), 5 Nov–2 Des 2026, online, khusus pelajar, **100% gratis**, dinilai dari Impact, Originality, Technical Execution, Presentation.

Pemilik: solo fullstack developer (Indonesia). Waktu: 4 minggu.

## 2. Aturan keras (WAJIB PATUH — jangan dilanggar)

1. **100% GRATIS.** Hanya open-source atau free-tier yang murah hati.
   - Dilarang: API berbayar, layanan berbayar, model berbayar, DB berbayar.
   - Dilarang: API key berbayar. Key gratis (mis. Nominatim User-Agent) boleh, tapi prioritaskan solusi **tanpa key**.
2. **TANPA server wajib.** Arsitektur PWA; backend maksimal free-tier serverless (Cloudflare). Tidak ada biaya berjalan.
3. **TANPA login/akun.** Tidak ada autentikasi, tidak ada data pengguna di server.
4. **PRIVASI DEFAULT.** Lokasi, laporan, bukti: **lokal di perangkat** (IndexedDB/OPFS, terenkripsi bila memungkinkan). Tidak ada pelacakan, tidak ada analytics PII.
5. **OFFLINE-FIRST.** App harus tetap berguna tanpa internet (app shell, peta area, POI, lapor).
6. **PATUH LISENSI & KEBIJAKAN.**
   - Data OpenStreetMap = **ODbL** -> wajib atribusi + tautan lisensi.
   - Overpass: hormati batas (lihat PROJECT_CONTEXT.md), cache, jangan brute-force.
   - Nominatim: wajib `User-Agent` unik, patuhi usage policy.
   - OpenFreeMap: patuhi aturan offline (≤3.000 tile / ≤50 MB per unduhan, ≤4 request paralel).
7. **JANGAN SCOPE CREEP.** Hanya bangun **MVP** di PROJECT_CONTEXT.md. Fitur fase 2 dilarang masuk tanpa persetujuan pemilik.
8. **JANGAN NGAJALIN FITUR BERBAHAYA TANPA PERINGATAN.** App bukan layanan darurat. Selalu tampilkan: "Bila dalam bahaya nyawa, hubungi nomor darurat lokal dulu."
9. **BUKAN NASIAT HUKUM.** Konten = pathway + hak dasar + bukti. Bukan pengganti pengacara/kepolisian.
10. **TIDAK MENGCURI / TIDAK PLAGIAT.** Semua dependency bebas lisensi; semua data pihak ketiga wajib atribusi.

## 3. Stack (jangan diganti tanpa persetujuan)

- **Next.js 14 (App Router) + React 18 + TypeScript** (strict)
- **Tailwind CSS + shadcn/ui (Radix)** + **zod** (validasi)
- **MapLibre GL JS** + **OpenFreeMap** (style `liberty`/`positron`) + **PMTiles** (`pmtiles`, `pmtiles-js`) + **Cloudflare R2** (egress gratis)
- **turf.js** (`@turf/turf`, `@turf/nearest-point`) — jarak & nearest
- **Workbox** (`next-pwa` / `workbox-build`) + **OPFS** + **idb** (IndexedDB)
- **@react-pdf/renderer** — export PDF (client-side)
- **i18next + react-i18next** — id/en + bahasa lokal
- **OSRM** (self-host via Docker, Oracle Cloud Always Free) — opsional; default pakai **Google Maps URLs `api=1`**
- **Vitest + Testing Library** — test unit/komponen
- **Cloudflare Pages** — hosting (gratis)

## 4. Perintah

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run test
npm run data:fetch # ambil POI dari Overpass (script)
npm run data:bundle# bangun bundle POI per kota
```

## 5. Struktur folder (ringkas)

```
safe-near/
  AGENTS.md                 # file ini
  PROJECT_CONTEXT.md        # DOKUMEN INDUK — baca penuh
  package.json
  tsconfig.json
  next.config.mjs
  public/
    manifest.webmanifest
    icons/
  src/
    app/                    # App Router
      page.tsx              # onboarding
      map/page.tsx
      nearby/page.tsx
      place/[id]/page.tsx
      report/new/page.tsx
      report/[id]/page.tsx
      offline/page.tsx
      about/page.tsx
    components/
      map/  poi/  report/  ui/  layout/
    lib/
      poi/        # repository, overpass client, bundle loader
      geo/        # turf helpers, geolocation
      routing/    # maps url builder, osrm client
      report/     # pdf, schema, storage
      prefs/      # user prefs (IndexedDB)
      i18n/
    data/
      profiles/   # <ISO>.json (kewarganegaraan)
      bundles/    # <country>-<city>.json (POI, ter-generate)
    styles/
  scripts/
    fetch-poi.ts
    build-bundle.ts
  docs/
    DATA.md
    ROADMAP.md
```

## 6. Cara bekerja (protokol untuk OpenCode)

1. Baca `PROJECT_CONTEXT.md` **penuh** dulu; pahami batasan & MVP.
2. Kerjakan **satu task** dari `docs/ROADMAP.md` (T0, T1, ...). Jangan loncat.
3. Sebelum coding, sebutkan: file yang diubah, pendekatan, risiko.
4. Setiap fitur wajib memenuhi **acceptance criteria** di PROJECT_CONTEXT.md.
5. Tambahkan test untuk logika non-UI (geo, schema, routing URL, PDF).
6. Jangan tambah dependency baru tanpa alasan kuat + cek lisensi & biaya.
7. Jangan hardcode rahasia/API key. Kosongkan fallback.
8. Kalau ada keputusan arsitektur, tulis di `docs/ADR.md` (format ringkas).
9. Lapor: apa yang selesai, output/error nyata, apa yang belum.

## 7. Definisi "Selesai" (global)

- Build sukses (`npm run build` hijau).
- Lint hijau.
- Test logika inti hijau.
- App bisa dipakai **tanpa internet** setelah di-install (peta area + POI + lapor).
- Semua layanan eksternal = gratis & atribusi tampil.
- Tidak ada data PII yang dikirim ke server.
- README berisi cara menjalankan + atribusi + disclaimer.

## 8. Dilarang keras (hard no)

- Menambah login/akun/cloud sync laporan.
- Menyimpan lokasi/laporan di server mana pun.
- Menggunakan Google Places/Directions/Mapbox/ORS berbayar.
- Menggunakan model/AI berbayar.
- Menghapus atribusi OSM/ODbL.
- Mengklaim "laporan otomatis ke polisi".
- Menambah fitur fase 2 (LLM triage, evidence blockchain, panic button, anti-surveillance) sebelum MVP selesai.
