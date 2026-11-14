# SAFE NEAR

> Peta & pendamping keselamatan **warga asing** di negara mana pun — **offline-first, 100% gratis**.

Untuk hackaton **Code for Change 2026** (HackathonForEveryone, 5 Nov–2 Des 2026).

---

## Apa ini

SAFE NEAR membantu warga asing (pelajar, pekerja, turis, migran) yang mengalami perundungan / gangguan / insiden lain di luar negeri untuk:

1. **Menemukan pihak berwajib terdekat** — polisi, RS/UGD, pemadam, pengadilan, kedutaan *negara mereka*, lewat peta.
2. **Menavigasi** ke tempat terpilih (satu ketuk).
3. **Menyiapkan laporan** insiden yang rapi (PDF EN+ID) untuk dikirim ke polisi/kedutaan.

Bukan pengganti polisi/kedutaan/pengacara. Bukan layanan darurat. Bila dalam bahaya nyawa, hubungi nomor darurat lokal dulu.

---

## Status (per 14 Nov 2026)

- ✅ Dokumen matang: `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/DATA.md`, `docs/ROADMAP.md`, `docs/ADR.md`
- ✅ Kode inti: `src/lib/poi/{types,normalize}.ts`
- ✅ Script: `scripts/fetch-poi.ts`, `scripts/validate-bundle.mjs`, `scripts/nearest-demo.mjs`
- ✅ **Data asli** (OSM, ODbL): `data/bundles/US-houston.json` — 27 POI (8 polisi, 6 RS, 6 pemadam, 6 pengadilan, 1 Konsulat Jenderal RI)
- ✅ Profil kewarganegaraan: `data/profiles/ID.json`
- ⬜ UI Next.js + MapLibre (belum dibangun — mulai dari `docs/ROADMAP.md` T0)

Buktinya:

```text
$ node scripts/validate-bundle.mjs
Total POI : 27   (police 8, hospital 6, fire 6, courthouse 6, embassy 1)  -> VALID

$ node scripts/nearest-demo.mjs
== POLISE terdekat ==
  0.51 km  Houston Police Station
  0.55 km  Houston Police Department — 1200 Travis Street, Houston, TX 77002
  ...
Kedutaan Indonesia terdekat: Consulate General of the Republic of Indonesia — 19.5 km
```

---

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run test
```

Data:

```bash
npm run data:fetch -- --country US --city Houston --lat 29.7604 --lon -95.3698 --radius 6000 --nationality ID --out data/bundles/US-houston.json
npm run data:validate
npm run data:demo
```

---

## Stack (100% gratis)

Next.js 14 · React 18 · TypeScript · Tailwind · shadcn/ui · zod · MapLibre GL JS · OpenFreeMap · PMTiles · Cloudflare R2 · turf.js · Workbox · OPFS · idb · @react-pdf/renderer · i18next · OSRM (opsional) · Cloudflare Pages.

Lihat `PROJECT_CONTEXT.md` §9 untuk alasan & batas free tiap layanan.

---

## Struktur

```
AGENTS.md                 konteks untuk OpenCode
PROJECT_CONTEXT.md        dokumen induk (batasan, arsitektur, data, roadmap)
docs/DATA.md              skema + sumber + query
docs/ROADMAP.md           task T0..T17 + acceptance criteria
docs/ADR.md               keputusan arsitektur
src/lib/poi/              types + normalisasi
scripts/                  fetch POI, validasi, demo nearest
data/profiles/            profil kewarganegaraan
data/bundles/             bundle POI per kota (offline)
```

---

## Atribusi & lisensi

- Map data © **OpenStreetMap** contributors, **ODbL** — https://www.openstreetmap.org/copyright
- Basemap: **OpenFreeMap** — https://openfreemap.org/
- POI/geo: **Overpass API** / OpenStreetMap
- Nomor darurat (bila dipakai): **EmergencyNumberAPI** (ODbL)
- Routing: **Google Maps URLs** / **OSRM** (BSD-2)
- Konten konsuler: **Kementerian Luar Negeri RI** — https://peduliwni.kemlu.go.id/
- Referensi hak: **Konvensi Wina 1963**, UN
- Kode: **MIT** — © 2026 Muhammad

---

## Disclaimer

SAFE NEAR bukan layanan darurat dan bukan nasihat hukum. Data berasal dari sumber komunitas (OSM) dan sumber resmi; **selalu verifikasi sebelum berangkat**. Untuk keadaan darurat, hubungi nomor darurat lokal.
