# SAFE NEAR — PROJECT_CONTEXT.md

**Versi:** 1.0 · **Tanggal:** 14 Nov 2026 · **Pemilik:** Muhammad (solo developer)
**Status:** Rancangan matang (siap masuk OpenCode) · **Batas waktu:** 4 minggu

> Dokumen ini adalah **satu-satunya sumber kebenaran** untuk OpenCode.
> Kalau ada konflik antara chat/diskusi dan dokumen ini, **dokumen ini menang**.

---

## 0. Cara membaca dokumen ini

- **AGENTS.md** = ringkasan + aturan kerja (otomatis dibaca OpenCode).
- **PROJECT_CONTEXT.md** (file ini) = rancangan lengkap: masalah, batasan, arsitektur, data, fitur, acceptance criteria, roadmap, risiko.
- **docs/DATA.md** = detail skema data + sumber + query (akan dibuat oleh OpenCode dari sini).
- **docs/ROADMAP.md** = daftar task T0..Tn (akan dibuat oleh OpenCode dari sini).
- **docs/ADR.md** = decision record (ditulis saat ada keputusan arsitektur).

---

## 1. Identitas proyek

| Item | Nilai |
|---|---|
| Nama | **SAFE NEAR** |
| Tagline | "Peta & pendamping keselamatan warga asing — offline, gratis, untuk siapa pun." |
| Jenis | PWA (Progressive Web App) offline-first |
| Bahasa default | Indonesia + Inggris (multi-bahasa) |
| Konteks lomba | Code for Change 2026 — HackathonForEveryone |
| Lomba mulai–selesai | 5 Nov 2026 – 2 Des 2026 (online, global, khusus pelajar) |
| Kriteria penilaian | Impact, Originality, Technical Execution, Presentation |
| Aturan lomba | Hanya tools/API/layanan **100% gratis** (free-tier atau open-source) |
| Lisensi kode | MIT (usulan) |
| Lisensi data | OpenStreetMap = **ODbL**; sumber lain mengikuti lisensinya |
| Repo | `safe-near` |

---

## 2. Masalah (ringkas + bukti)

Warga asing (pelajar, pekerja, turis, migran) yang mengalami **perundungan / gangguan / orang tak dikenal / diskriminasi / salah tangkap** di negara tuan rumah:

1. **Tidak tahu ke mana pergi.** Nomor darurat, polisi non-darurat, RS, kedutaan, bantuan hukum terpecah di banyak sumber; sering butuh internet.
2. **Butuh internet di saat genting.** Sinyal/SIM bisa tidak ada; Google/terjemahan umum tidak paham konteks hukum.
3. **Hak konsuler sering dilanggar.** Pasal 36 Konvensi Wina (1963): warga asing yang ditangkap berhak diberitahu "tanpa penundaan" haknya menghubungi konsulat. 182 negara pihak; ICJ *LaGrand* (2001) & *Avena* (2004) memutus pelanggaran mewajibkan "review and reconsideration". Di AS kepatuhan tidak konsisten dan **tidak ada UU federal** yang menjamin kepatuhan negara bagian/daerah.
   - Sumber: https://legal.un.org/avl///ha/vccr/vccr.html · https://www.nyulawglobal.org/globalex/Vienna_Convention_Consular_Relations1.html [UN/ICJ, 1963/2001/2004]
4. **Insiden tidak dilaporkan.** Mahasiswa internasional di AS (>1.000.000, IIE 2023) lebih rentan mengalami kekerasan/pelecehan/diskriminasi; hambatan melapor: tidak tahu hukum AS, takut balasan, tekanan teman.
   - Sumber: https://www.ojed.org/jis/article/download/6635/2958/42297 · https://www.ojed.org/jis/article/download/6711/2971/42400 [OJED, 2024/2025]
5. **Kanal resmi ada tapi tidak memandu.** Mis. Kemenlu Dit PWNI: 67.297 kasus WNI di luar negeri (2024), 60.122 selesai; layanan Peduli WNI, app Safe Travel, hotline +62 812-9007-0027. SLA 1 hari (kasus khusus) / 5 hari (umum). Butuh internet + form panjang; tidak ada triage insiden, tidak ada peta/navigasi, tidak ada laporan siap kirim.
   - Sumber: https://kemlu.go.id/files/repositori/65397/174071018667c1212ae1402_LKJ_Dit__PWNI_2024.pdf · https://peduliwni.kemlu.go.id/ [Kemenlu, 2024]

**Kesimpulan:** ada celah antara "kejadian" dan "kanal resmi" — dan celah itu bisa diisi oleh PWA offline yang **menemukan pihak berwajib terdekat + memandu + menyiapkan laporan**.

---

## 3. Solusi & posisi

**SAFE NEAR** = peta + navigasi + jalur lapor untuk warga asing.

Posisi: **jembatan antara kejadian dan kanal resmi**. Bukan pengganti polisi/kedutaan/pengacara. Bukan layanan darurat.

Pembeda utama:
1. **Sadar kewarganegaraan**: pilih negara asal → tampil kedutaan/konsulat *negaramu* + hotline kedaulatan yang relevan.
2. **Offline-first**: peta area + POI + lapor tetap jalan tanpa internet.
3. **Data terbuka terverifikasi**: OSM + sumber resmi, dengan label "last verified" + tombol koreksi.
4. **Bukti siap pakai**: laporan terstruktur EN+ID, hash integritas.
5. **Privasi**: tanpa login, data lokal.

---

## 4. Tujuan MVP & Non-Goals

### 4.1 Tujuan MVP (WAJIB)
- Pengguna dapat memilih **kewarganegaraan** dan **negara/kota** tempat berada.
- Pengguna dapat melihat **peta** dan **posisinya**.
- Pengguna dapat mencari **pihak berwajib terdekat** per kategori dan melihat daftar 5 terdekat.
- Pengguna dapat membuka **navigasi** (turn-by-turn) ke tempat terpilih.
- Pengguna dapat melihat **detail tempat** (nama, alamat, telepon, jam buka, sumber, verifikasi).
- Pengguna dapat membuat **laporan insiden ringan** dan export **PDF (EN+ID)**.
- Pengguna dapat memakai fitur inti **tanpa internet** (setelah area diunduh).
- App menampilkan **atribusi + disclaimer** yang benar.

### 4.2 Non-Goals MVP (DILARANG)
- Login/akun/cloud sync.
- LLM/triage AI otomatis (fase 2; boleh prototipe ringan bila waktu lebih).
- Evidence chain blockchain/timestamp publik (fase 2).
- Panic button + anti-surveillance (ikon samaran/PIN/quick-exit) (fase 2).
- Kirim laporan otomatis ke polisi/kedutaan (tidak ada API resmi; dilarang mengklaim).
- Banyak negara sekaligus (mulai 1–2 kota pilot).
- Kontribusi komunitas/edit data (fase 2).
- Model bisnis, monetisasi, akun pengguna.

---

## 5. Batasan keras (constraint) — WAJIB

| # | Batasan | Konsekuensi |
|---|---|---|
| C1 | 100% gratis | Hanya OSS/free-tier. Tidak ada biaya berjalan. |
| C2 | Tanpa server wajib | PWA; backend maksimal Cloudflare free-tier serverless. |
| C3 | Tanpa login | Tidak ada auth; prefs & laporan lokal. |
| C4 | Privasi default | Lokasi/laporan/bukti tidak dikirim ke server. |
| C5 | Offline-first | App shell + peta area + POI + lapor harus jalan offline. |
| C6 | Patuh lisensi | OSM ODbL + atribusi; patuhi Overpass/Nominatim/OpenFreeMap. |
| C7 | Waktu 4 minggu solo | Scope dipangkas; fokus MVP. |
| C8 | Bukan layanan darurat | Selalu tampilkan "hubungi darurat lokal dulu". |
| C9 | Bukan nasihat hukum | Disclaimer + "konsultasi ke lembaga resmi". |
| C10 | Hackathon rule | Tidak boleh pakai tools berbayar; wajib atribusi pihak ketiga. |

---

## 6. Persona & User Stories

### Persona utama
**"Rara"**, 22 th, mahasiswa Indonesia di Houston, AS. Bahasa sehari-hari Indonesia; bahasa Inggris pasif. HP Android menengah (4 GB RAM). Kadang tanpa paket data. Baru pertama kali di luar negeri.

### Persona sekunder
**"Alex"**, turis/pegawai asal Filipina di Kuala Lumpur; **"Nadia"**, pekerja asal Maroko di Paris.

### User Stories (format: Sebagai X, agar Y, saya ingin Z)
- US-01: Sebagai warga asing, agar tahu pihak berwajib terdekat, saya ingin peta + daftar polisi/RS/kedutaan terdekat.
- US-02: Sebagai warga asing, agar bisa meminta tolong, saya ingin navigasi satu ketuk ke tempat terpilih.
- US-03: Sebagai warga asing, agar tahu hak saya, saya ingin kartu hak singkat (mis. hak konsuler saat ditangkap).
- US-04: Sebagai korban insiden, agar bisa melapor, saya ingin form ringkas + PDF siap kirim.
- US-05: Sebagai pengguna di daerah sinyal buruk, agar tetap terbantu, saya ingin fitur inti jalan offline.
- US-06: Sebagai pengguna, agar percaya, saya ingin tahu data berasal dari mana dan kapan diverifikasi.
- US-07: Sebagai pengguna yang waspada, agar privasi terjaga, saya ingin tahu data saya tidak dikirim ke mana pun.

### Acceptance criteria per fitur (ringkas; detail di §7)
- US-01: Dari peta, ≤3 ketukan menuju daftar 5 tempat terdekat dengan jarak & estimasi waktu.
- US-02: Satu ketuk membuka navigasi (Google Maps) dengan tujuan = tempat terpilih.
- US-03: Tersedia kartu "ditangkap/ditahan" (Pasal 36) dan "diganggu di jalan".
- US-04: Laporan menghasilkan PDF EN+ID dengan kronologi + daftar bukti + hash.
- US-05: Mode offline: peta area, POI, lapor, kartu hak berfungsi.
- US-06: Setiap tempat menampilkan sumber + "last verified" + tombol "tempat salah".
- US-07: Tidak ada request jaringan untuk lokasi/laporan; prefs & laporan hanya lokal.

---

## 7. Fitur MVP (detail + acceptance criteria)

### F1. Onboarding (halaman `/`)
- Pilih **kewarganegaraan** (dropdown ISO, cari nama) → memuat `profiles/<ISO>.json`.
- Pilih **negara tuan rumah** + **kota** (pilihan pilot; bisa "otentikasi otomatis" via Geolocation + reverse geocode bila online).
- Pilih **bahasa** (id/en + default negara tuan rumah bila ada).
- Simpan di IndexedDB (tanpa login).
- **AC:** pilihan tersimpan; membuka app berikutnya melewati onboarding; bisa ubah di pengaturan.

### F2. Peta (halaman `/map`)
- MapLibre GL JS + style OpenFreeMap (`liberty`), center ke posisi user (Geolocation API) atau kota pilihan.
- Marker user + marker POI per kategori (ikon beda warna).
- Tombol "locate me", "layer kategori".
- **AC:** peta tampil <3 dtk di koneksi biasa; marker POI dari bundle lokal bila offline; attribution OSM tampil.

### F3. Cari "Terdekat" (halaman `/nearby?category=...`)
- Kategori: `police`, `hospital`, `embassy`, `fire`, `courthouse`, `shelter`.
- Ambil POI: **offline bundle** dulu; bila online & bundle belum ada → **Overpass**.
- Hitung jarak (haversine/turf) → 5 terdekat; tampilkan nama, alamat, jarak (m/km), estimasi waktu (jalan kaki/kendaraan, faktor sederhana).
- **AC:** hasil ≤2 dtk; urut terdekat benar; bila data kosong → pesan "area belum diunduh / data belum tersedia" + tombol unduh area.

### F4. Detail tempat (halaman `/place/[id]`)
- Nama, alamat, telepon (`tel:`), jam buka, situs, kategori, koordinat.
- **Bukti sumber**: `source` (OSM/node id), `verified_at`, `source_url`.
- Tombol: **Navigasi**, **Telepon**, **Bagikan**, **Laporkan tempat salah**.
- Peringatan: "Verifikasi sebelum berangkat" + "Data komunitas OSM".
- **AC:** semua field tampil bila ada; field kosong → "tidak tersedia"; tombol navigasi membuka URL yang benar.

### F5. Navigasi (eksternal)
- Bangun **Google Maps URL** `https://www.google.com/maps/dir/?api=1&destination=LAT,LON&travelmode=walking|driving&dir_action=navigate`.
- Bila Google Maps tidak ada → fallback URL web.
- Offline: tampilkan garis lurus (turf + MapLibre) + alamat + catatan "navigasi butuh internet".
- Opsional (bila waktu): **OSRM self-host** untuk polyline rute di dalam app.
- **AC:** URL valid, tidak butuh API key, tujuan tepat; mode offline tidak error.

### F6. Lapor insiden (halaman `/report/new`, `/report/[id]`)
- Field: kategori, waktu kejadian (default sekarang), lokasi (GPS/otomatis + edit), deskripsi, saksi (nama/kontak opsional), bukti (foto, maks ukuran wajar, **disimpan lokal terenkripsi bila memungkinkan**).
- Validasi zod; simpan di IndexedDB.
- Export **PDF (EN + ID)** via `@react-pdf/renderer`: identitas (opsional), kronologi, lokasi, deskripsi, daftar bukti, hash SHA-256 konten, timestamp pembuatan, disclaimer.
- Tombol **Bagikan** (Web Share API) / simpan file.
- **AC:** PDF terbuka/terunduh; isi lengkap; hash konsisten dengan isi; data tidak dikirim ke server.

### F7. Kartu hak (offline)
- Minimal 2 kartu: (a) "Ditangkap/ditahan — hak konsuler (Pasal 36 Konvensi Wina)"; (b) "Diganggu/maki di ruang publik".
- Format: kalimat pendek + script bahasa Inggris/Indonesia + tautan ke kanal resmi.
- **AC:** tersedia offline; teks singkat; ada disclaimer "bukan nasihat hukum".

### F8. Offline & manajemen unduhan (halaman `/offline`)
- Unduh area: tile (OpenFreeMap, ≤50 MB / ≤3.000 tile) + POI bundle kota + profil hak.
- Tampilkan status: tersimpan, ukuran, tanggal, hapus.
- **AC:** setelah unduh, fitur inti jalan di mode pesawat; hapus data berfungsi.

### F9. Tentang & atribusi (halaman `/about`)
- Atribusi OSM/ODbL, OpenFreeMap, sumber data lain, disclaimer, lisensi kode, kontak.
- **AC:** atribusi tampil; tautan lisensi valid.

### F10. Pengaturan
- Ubah kewarganegaraan/negara/bahasa; hapus semua data lokal; info privasi.
- **AC:** perubahan tersimpan; "hapus semua data" menghapus prefs + laporan + bundle.

---

## 8. Arsitektur

### 8.1 Diagram (teks)
```
[HP Pengguna]
   |
   | (1) install PWA sekali, online
   v
[PWA SAFE NEAR]  -- app shell + JS + CSS (Workbox precache)
   |
   +-- MapLibre GL --> tile: OpenFreeMap (online) / PMTiles bundle (offline, OPFS)
   |
   +-- POI Repository --> (a) bundle lokal (IndexedDB/OPFS)   [utama, offline]
   |                     (b) Overpass API (online, fallback)  [bila bundle belum ada]
   |
   +-- Geo (Geolocation + turf) --> jarak, nearest, bbox
   |
   +-- Routing --> Google Maps URL (eksternal) / OSRM (opsional)
   |
   +-- Report --> IndexedDB (lokal) --> @react-pdf/renderer --> PDF (lokal/bagikan)
   |
   +-- Prefs --> IndexedDB (lokal)
   v
[TIDAK ADA SERVER APLIKASI. Tidak ada PII keluar perangkat.]
```

### 8.2 Prinsip
- **No backend** (kecuali Cloudflare Pages statis + R2 untuk aset).
- **Repository pattern** untuk POI: `PoiRepository` dengan dua sumber (bundle/Overpass) — UI tidak tahu sumber mana aktif.
- **Cache-first** untuk tile & POI; **network-first** hanya untuk data yang belum ada di bundle.
- **Semua fitur inti harus gagal dengan anggun** (graceful degradation) saat offline/data kosong.

---

## 9. Tech stack (versi & alasan)

| Layer | Pilihan | Alasan | Batas free |
|---|---|---|---|
| Framework | Next.js 14 (App Router) | PWA, RSC, ekosistem | OSS |
| UI | React 18 + TS strict + Tailwind + shadcn/ui | Cepat, accessible | OSS |
| Validasi | zod | Schema + types sinkron | OSS |
| Peta | MapLibre GL JS | OSS, dukung PMTiles & style bebas | OSS |
| Tile | OpenFreeMap (style liberty/positron) | Gratis, no key, no cookie | Tidak ada batas request; offline ≤3.000 tile/≤50 MB |
| Tile bundle | PMTiles + pmtiles-js | Satu file, range request, offline | OSS |
| Aset | Cloudflare R2 | Egress gratis | 10 GB penyimpanan |
| Geospasial | @turf/turf, @turf/nearest-point | Jarak/nearest | OSS |
| Offline | Workbox + OPFS + idb | App shell + cache | OSS |
| PDF | @react-pdf/renderer | Client-side | OSS |
| i18n | i18next + react-i18next | Multi-bahasa | OSS |
| Geocoding | Nominatim (OSM) | Gratis | Wajib User-Agent; usage policy |
| POI query | Overpass API | Gratis | Lihat §11; cache wajib |
| Routing (opsional) | OSRM self-host (Docker) | Gratis, unlimited | Oracle Cloud Always Free |
| Routing (default) | Google Maps URLs `api=1` | Gratis, no key | OSS-free, ada batas 2048 char |
| Hosting | Cloudflare Pages | Gratis, CDN global | 500 build/bln, bandwidth unlimited |
| Test | Vitest + Testing Library | Cepat | OSS |

**Dependency baru hanya bila:** (a) tidak ada alternatif OSS, (b) lisensi kompatibel MIT/Apache/BSD, (c) tidak ada biaya, (d) pemilik disahkan.

---

## 10. Data model (TypeScript)

```ts
// 10.1 Kategori pihak berwajib
export type Category =
  | 'police'      // kantor polisi
  | 'hospital'    // RS / UGD
  | 'embassy'     // kedutaan / konsulat negara pilihan
  | 'fire'        // pemadam
  | 'courthouse'  // pengadilan
  | 'shelter';    // tempat berlindung

// 10.2 POI ternormalisasi (sumber apa pun -> bentuk ini)
export interface Poi {
  id: string;                 // "osm:node:123" | "bundle:uuid"
  source: 'osm' | 'official' | 'community';
  category: Category;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;             // E.164 atau format lokal
  openingHours?: string;      // OSM opening_hours
  url?: string;
  tags?: Record<string, string>;
  verifiedAt?: string;        // ISO date
  sourceUrl?: string;
  nationality?: string;       // ISO, khusus embassy (negara yang diwakili)
}

// 10.3 Profil kewarganegaraan
export interface CountryProfile {
  iso: string;                // ISO 3166-1 alpha-2, mis. "ID"
  name: string;
  flag: string;
  languages: string[];        // kode bahasa yang didukung
  sovereignChannels: SovereignChannel[]; // hotline/email/portal kedaulatan
  consulateStrategy: {
    osmQuery: string;         // mis. amenity=embassy + country=ID
    officialDirectoryUrl?: string;
    note?: string;
  };
  rightsNotes: { title: string; body: string; source: string }[];
}

export interface SovereignChannel {
  label: string;
  kind: 'phone' | 'email' | 'web' | 'chat';
  value: string;
  url?: string;
  hours?: string;
  note?: string;
}

// 10.4 Preferensi pengguna (lokal)
export interface UserPrefs {
  nationality: string;        // ISO
  hostCountry: string;        // ISO negara tuan rumah
  city?: string;
  language: string;           // 'id' | 'en' | ...
  onboarded: boolean;
  updatedAt: string;          // ISO datetime
}

// 10.5 Laporan insiden
export interface IncidentReport {
  id: string;                 // uuid
  category: Category;
  occurredAt: string;         // ISO datetime
  createdAt: string;
  location: {
    lat: number; lon: number;
    address?: string;
    label?: string;
  };
  description: string;
  witnesses?: { name?: string; contact?: string }[];
  evidence: EvidenceRef[];    // meta + path/bytes (lokal)
  pdfHash?: string;           // SHA-256 isi PDF
}

export interface EvidenceRef {
  id: string;
  kind: 'photo' | 'audio' | 'note' | 'file';
  name: string;
  size: number;
  createdAt: string;
  storageKey: string;         // kunci di OPFS/IndexedDB
}

// 10.6 Entri bundle offline
export interface PoiBundle {
  id: string;                 // "US-houston"
  country: string;
  city: string;
  bbox: [number, number, number, number]; // minLon,minLat,maxLon,maxLat
  pois: Poi[];
  downloadedAt: string;
  sizeBytes: number;
}
```

### 10.7 Contoh JSON
`data/profiles/ID.json`:
```json
{
  "iso": "ID",
  "name": "Indonesia",
  "flag": "🇮🇩",
  "languages": ["id", "en"],
  "sovereignChannels": [
    { "label": "Peduli WNI (Kemenlu)", "kind": "phone", "value": "+62-812-9007-0027", "url": "https://peduliwni.kemlu.go.id", "note": "Layanan & perlindungan WNI di luar negeri" },
    { "label": "Email PWNI", "kind": "email", "value": "pelindunganwni@kemlu.go.id" },
    { "label": "Portal Peduli WNI", "kind": "web", "value": "https://peduliwni.kemlu.go.id" }
  ],
  "consulateStrategy": {
    "osmQuery": "nwr[\"amenity\"=\"embassy\"][\"country\"=\"ID\"]",
    "officialDirectoryUrl": "https://peduliwni.kemlu.go.id/",
    "note": "Gunakan OSM; fallback ke direktori resmi BKBRI/Peduli WNI."
  },
  "rightsNotes": [
    { "title": "Hak konsuler saat ditangkap/ditahan", "body": "Pasal 36 Konvensi Wina 1963: otoritas wajib memberitahu hakmu menghubungi konsulat 'tanpa penundaan'. Kamu berhak menghubungi dan menerima kunjungan konsuler.", "source": "https://legal.un.org/avl///ha/vccr/vccr.html" }
  ]
}
```

Contoh POI:
```json
{
  "id": "osm:node:123456789",
  "source": "osm",
  "category": "police",
  "name": "Houston Police Department - Central Division",
  "lat": 29.7604,
  "lon": -95.3698,
  "address": "1200 Travis St, Houston, TX 77002",
  "phone": "+1-713-884-3131",
  "openingHours": "24/7",
  "tags": { "amenity": "police", "operator": "Houston Police Department" },
  "verifiedAt": "2026-11-01",
  "sourceUrl": "https://www.openstreetmap.org/node/123456789"
}
```

---

## 11. Sumber data & cara ingest

### 11.1 POI pihak berwajib — OpenStreetMap (ODbL)
Tag yang dipakai:
- `amenity=police`
- `amenity=hospital`
- `amenity=fire_station`
- `amenity=courthouse`
- `amenity=townhall`
- `amenity=shelter`
- `amenity=embassy` (+ `country=<ISO>` untuk kedutaan negara tertentu)
- `office=diplomatic`
- `emergency=phone`
- `healthcare=*` (opsional)

Sumber tag: https://wiki.openstreetmap.org/wiki/Overpass_API · https://wiki.openstreetmap.org/wiki/Map_features [OpenStreetMap, 2026]

### 11.2 Query Overpass (contoh siap pakai)
```
[out:json][timeout:25];
(
  nwr["amenity"="police"](around:6000, LAT, LON);
  nwr["amenity"="hospital"](around:6000, LAT, LON);
  nwr["amenity"="fire_station"](around:6000, LAT, LON);
  nwr["amenity"="courthouse"](around:6000, LAT, LON);
  nwr["amenity"="shelter"](around:6000, LAT, LON);
  nwr["amenity"="embassy"]["country"="ID"](around:25000, LAT, LON);
);
out center tags;
```
Catatan: `around:RADIUS, LAT, LON` (meter). `out center` memberi centroid untuk way/relation.
Instance: `https://overpass-api.de/api/interpreter` (utama), alternatif `https://overpass.osm.ch/api/interpreter`, `https://ovp.dresel.systems/api/interpreter` (Eropa), `https://ovp.dresel.systems/api-na/interpreter` (Amerika Utara).
**Batas:** <10.000 query/hari & <1 GB/hari (instance utama); untuk app, cache & bundle wajib. Sumber: https://wiki.openstreetmap.org/wiki/Overpass_API [OSM, 2026]

### 11.3 Tile & gaya
- OpenFreeMap public instance: `https://tiles.openfreemap.org/styles/liberty` (atau `/positron`). Gratis, no key, no cookie, tanpa batas request tampilan. Offline: unduh area ≤3.000 tile / ≤50 MB, ≤4 request paralel, User-Agent khusus.
- Sumber: https://openfreemap.org/ · https://openfreemap.org/quick_start/ [OpenFreeMap, 2026]

### 11.4 Bundle offline
- Bangun `<negara>-<kota>.json` (POI) + PMTiles area dari OSM (planetiler / pmtiles extract).
- Simpan di Cloudflare R2 (egress gratis) dan/atau sebagai aset PWA; unduh sekali per kota.
- Alat: `planetiler` atau `pmtiles` CLI (OSS).

### 11.5 Geocoding & reverse geocode
- Nominatim OSM: `https://nominatim.openstreetmap.org/search|reverse`. Wajib header `User-Agent` unik; patuhi usage policy (maks ~1 req/detik, jangan heavy).
- Alternatif self-host: Photon (`photon.komoot.io`) atau Pelias.

### 11.6 Nomor darurat lokal
- EmergencyNumberAPI (open database, ODbL): `https://emergencynumberapi.com/api/country/{code}` → police/fire/ambulance/dispatch per negara. GitHub data: https://github.com/EmergencyNumbersAPI/data [EmergencyNumberAPI, 2026]
- Android AOSP `eccdata.txt` (referensi tambahan).

### 11.7 Routing / navigasi
- **Default:** Google Maps URLs `api=1` (gratis, no key): `https://www.google.com/maps/dir/?api=1&destination=LAT,LON&travelmode=walking|driving&dir_action=navigate`. Sumber: https://developers.google.com/maps/documentation/urls/get-started [Google, 2026]
- **Opsional:** OSRM self-host (`router.project-osrm.org` demo gratis ~1 req/detik, tanpa SLA; produksi = Docker di Oracle Cloud Always Free). Sumber: https://github.com/Project-OSRM/osrm-backend [OSRM, 2026]

### 11.8 Konten hak & hotline
- Pasal 36 Konvensi Wina: https://legal.un.org/avl///ha/vccr/vccr.html [UN, 1963]
- Kemenlu PWNI: https://peduliwni.kemlu.go.id/ · hotline +62 812-9007-0027 · email pelindunganwni@kemlu.go.id [Kemenlu, 2024]
- Judul hak kampus (AS): Title VI/Title IX, Office for Civil Rights (Sumber: laporan OCR/Dept of Education; jangan buat klaim spesifik tanpa verifikasi).

---

## 12. Integrasi API (ringkas + fallback)

| Kebutuhan | Utama | Fallback | Bila keduanya gagal |
|---|---|---|---|
| POI | bundle lokal | Overpass | pesan "area belum diunduh" |
| Tile | PMTiles lokal | OpenFreeMap CDN | polos + catatan |
| Geocoding | cache lokal | Nominatim | input manual koordinat |
| Rute | Google Maps URL | garis lurus (turf) | alamat + telepon |
| Nomor darurat | profile + EmergencyNumberAPI cache | EmergencyNumberAPI live | "cek sumber resmi" |

**Aturan:** jangan pernah memblokir UI; selalu ada pesan/status yang jelas.

---

## 13. Alur pengguna (contoh)

### Alur A — "Di-bully orang asing di dekat kampus" (Rara, Houston)
1. Buka app (mode pesawat pun bisa). Onboarding sudah tersimpan.
2. Halaman peta menampilkan posisi + POI polisi/RS/kedutaan.
3. Ketuk **Polisi Terdekat** → daftar 5 kantor polisi (nama, alamat, jarak, telepon).
4. Ketuk satu → kartu detail + tombol **Navigasi** (buka Google Maps) / **Telepon**.
5. Ketuk **Laporkan insiden** → isi ringkas → **PDF EN+ID** → bagikan ke polisi/kedutaan.
6. App menampilkan juga: **KJRI Houston** (kedutaan Indonesia terdekat) + hotline Peduli WNI.

### Alur B — "Ditangkap/ditahan polisi"
1. Buka app → kartu **"Ditangkap/ditahan"** (Pasal 36).
2. Lihat script: "I am an Indonesian citizen. I invoke my right to contact my consulate under Article 36 of the Vienna Convention on Consular Relations."
3. Satu ketuk: hubungi KJRI terdekat / hotline Peduli WNI.
4. (Fase 2) panic button + kirim lokasi ke kontak tepercaya.

### Alur C — "Area belum diunduh & offline"
1. Buka app → halaman `/offline` → pilih kota → unduh area.
2. Setelah selesai: peta + POI + lapor + kartu hak berfungsi offline.
3. Hapus area bila butuh ruang.

---

## 14. UI/UX & struktur halaman

Halaman (App Router):
- `/` onboarding
- `/map` peta utama
- `/nearby?category=police` daftar terdekat
- `/place/[id]` detail tempat
- `/report/new` form lapor
- `/report/[id]` detail + PDF
- `/rights` kartu hak
- `/offline` unduh area
- `/settings` pengaturan
- `/about` atribusi + disclaimer

Prinsip UX:
- **≤3 ketukan** dari peta ke bantuan terdekat.
- Tombol besar, kontras tinggi, bisa dipakai satu tangan.
- Bahasa sederhana; istilah hukum dijelaskan.
- Peringatan kontekstual (bahaya, verifikasi data, "bukan layanan darurat").
- Aksesibel: WCAG 2.1 AA (target), dukungan screen reader dasar, ukuran sentuh ≥44px.
- Dukungan gelap/terang (opsional).

---

## 15. Strategi offline

1. **App shell** di-precache (Workbox).
2. **Tile** area kota: PMTiles di OPFS (baca via range request lokal).
3. **POI bundle**: JSON di IndexedDB; versi & bbox tercatat.
4. **Profil hak + nomor darurat**: di-bundle di app (atau unduh per negara).
5. **Laporan**: IndexedDB/OPFS; export PDF lokal.
6. **Tidak ada cloud sync** (privasi). Cadangan opsional: ekspor JSON terenkripsi oleh user.

**Aturan:** fitur inti (peta area, POI, lapor, kartu hak) WAJIB jalan offline. Fitur "cari area baru" boleh butuh internet.

---

## 16. Privasi & keamanan (threat model ringkas)

Aset: lokasi, identitas (opsional), laporan, bukti, prefs.
Ancaman:
- A1. Data bocor ke server → **mitigasi:** tidak ada server; semua lokal.
- A2. Pelaku menemukan app → **mitigasi (fase 2):** ikon samaran, PIN, quick-exit; MVP: sematkan catatan "hapus riwayat cepat" + hapus semua data.
- A3. Metadata bukti → **mitigasi:** simpan lokal; user yang memutuskan membagikan.
- A4. Man-in-the-middle saat online → **mitigasi:** HTTPS, SRI, CSP ketat.
- A5. Ketergantungan data pihak ketiga → **mitigasi:** label sumber + verifikasi + fallback.

Prinsip: **data minimization**; tidak ada PII wajib; lokasi tidak disimpan permanen (sesi saja, kecuali user simpan laporan).

---

## 17. Keputusan desain (ADR ringkas — tulis detail di docs/ADR.md)

- **ADR-001: Map-first.** Peta + navigasi adalah pilon; triage AI/hukum fase 2. Alasan: paling feasible, paling demonstrable.
- **ADR-002: Tanpa login/backend.** Alasan: privasi + anggaran $0 + kesederhanaan.
- **ADR-003: Repository POI dua sumber (bundle/Overpass).** Alasan: offline-first + graceful degradation.
- **ADR-004: Navigasi via Google Maps URL (bukan Maps API).** Alasan: gratis, no key, UX terbaik.
- **ADR-005: Data OSM sebagai sumber utama + label verifikasi.** Alasan: gratis, global, ODbL; akurasi dikelola dengan transparansi + koreksi.
- **ADR-006: Laporan = dokumen siap kirim, bukan laporan otomatis.** Alasan: tidak ada API polisi resmi; etika & legal.
- **ADR-007: Scope dipangkas ke 1–2 kota pilot.** Alasan: waktu 4 minggu solo.

---

## 18. Struktur proyek (target)

```
safe-near/
  AGENTS.md
  PROJECT_CONTEXT.md
  README.md
  LICENSE
  package.json
  tsconfig.json
  next.config.mjs
  tailwind.config.ts
  public/
    manifest.webmanifest
    icons/icon-192.png, icon-512.png
  src/
    app/
      layout.tsx  page.tsx  globals.css
      map/page.tsx
      nearby/page.tsx
      place/[id]/page.tsx
      report/new/page.tsx
      report/[id]/page.tsx
      rights/page.tsx
      offline/page.tsx
      settings/page.tsx
      about/page.tsx
    components/
      map/MapView.tsx, PoiLayer.tsx, CategoryChips.tsx
      poi/PoiCard.tsx, PoiList.tsx, DistanceBadge.tsx
      report/ReportForm.tsx, EvidencePicker.tsx, PdfButton.tsx
      layout/BottomNav.tsx, Header.tsx, Banner.tsx
      ui/ (shadcn)
    lib/
      poi/types.ts, normalize.ts, repository.ts, overpass.ts, bundle.ts
      geo/location.ts, distance.ts
      routing/mapsUrl.ts, osrm.ts
      report/schema.ts, store.ts, pdf.ts, hash.ts
      prefs/store.ts
      i18n/index.ts, locales/*.json
      offline/manager.ts, workbox.ts
    data/
      profiles/ID.json, PH.json, MA.json, ...
      bundles/ (ter-generate)
  scripts/
    fetch-poi.ts
    build-bundle.ts
  docs/
    DATA.md
    ROADMAP.md
    ADR.md
  tests/
```

---

## 19. Konvensi kode

- **TypeScript strict**; tanpa `any` (kecuali boundary yang terjustifikasi + dikomentari).
- **Komponen:** function component + hooks; state lokal; server component bila memungkinkan.
- **Penamaan:** file `kebab-case.tsx`; komponen `PascalCase`; util `camelCase`.
- **Validasi:** zod di boundary (form, API, bundle).
- **Error:** semua fetch/IO dalam try/catch; UI menampilkan pesan ramah + status.
- **Atribusi:** jangan hapus komentar sumber di data.
- **Commit:** conventional commits (`feat:`, `fix:`, `data:`, `docs:`).
- **Test:** logika murni (geo, schema, mapsUrl, hash, pdf content) wajib test.
- **Aksesibilitas:** semantic HTML, label form, fokus terlihat, kontras.

---

## 20. Roadmap 28 hari + Definition of Done (DoD)

> Detail task di `docs/ROADMAP.md`. Ringkasan:

**Minggu 1 — Fondasi + data (T0–T4)**
- T0 Setup repo, Next.js, TS, Tailwind, ESLint, Vitest.
- T1 PWA shell + Workbox + manifest + i18n (id/en).
- T2 Skema data + types + zod + profil ID/PH/BD/NP + bundle Houston (asli).
- T3 Script fetch POI Overpass + normalisasi + simpan JSON.
- T4 Onboarding (kewarganegaraan/negara/bahasa) + prefs store.
- **DoD M1:** app berjalan, onboarding tersimpan, data POI Houston terkuras dari OSM, build hijau.

**Minggu 2 — Peta + terdekat + navigasi (T5–T9)**
- T5 MapLibre + tile OpenFreeMap + marker user + kategori.
- T6 POI repository (bundle/Overpass) + nearest (turf) + daftar 5 terdekat.
- T7 Halaman detail tempat + tombol navigasi/telepon + sumber/verifikasi.
- T8 Navigasi Google Maps URL + fallback garis lurus.
- T9 Kartu hak (Pasal 36 + gangguan) offline.
- **DoD M2:** dari peta ≤3 ketukan ke 5 tempat terdekat + navigasi; detail tampil sumber.

**Minggu 3 — Lapor + offline (T10–T13)**
- T10 Form lapor + zod + simpan IndexedDB + bukti (foto lokal).
- T11 Export PDF EN+ID + hash + bagikan.
- T12 Offline: unduh area (tile + POI) + mode pesawat + hapus data.
- T13 Pengaturan + hapus semua data + halaman about/atribusi.
- **DoD M3:** laporan -> PDF EN+ID; fitur inti jalan offline setelah unduh; atribusi tampil.

**Minggu 4 — Uji, polish, demo (T14–T17)**
- T14 Test di HP nyata (Android menengah), perbaikan akurasi/UX.
- T15 Test aksesibilitas dasar + keamanan (CSP, SRI, tanpa PII).
- T16 Demo video 60 detik + dokumentasi README +presentasi.
- T17 Buffer + perbaikan bug + submission Devpost.
- **DoD M4:** semua AC terpenuhi; build+lint+test hijau; demo siap; repo rapi.

---

## 21. Risiko & mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R1 | Data OSM salah/tidak lengkap (kantor polisi tutup, alamat keliru) | user menuju tempat salah | Sedang | label sumber + last verified + tombol koreksi; prioritas sumber resmi untuk kedutaan/hotline; peringatan "verifikasi dulu" |
| R2 | Data OSM kosong di kota pilot | fitur tidak berguna | Sedang | pilih kota pilot dengan coverage baik; sediakan input manual; pesan jelas |
| R3 | Mengarahkan orang ke polisi di negara tidak ramah | bahaya bagi user | Sedang | peringatan kontekstual per negara; opsi hubungi kedutaan/ONG; disclaimer |
| R4 | Lokasi/privasi bocor | bahaya | Rendah-Sedang | default lokal, tanpa server; hapus data instan |
| R5 | Scope creep (mau tambah fitur) | gagal waktu | Tinggi | patuhan Non-Goals; pemilik kunci scope |
| R6 | Overpass/OpenFreeMap/Nominatim rate limit / perubahan kebijakan | fitur mati | Sedang | cache + bundle + fallback; pantau policy |
| R7 | navigasi butuh internet | user kecewa offline | Rendah | garis lurus + alamat + telepon; jelaskan |
| R8 | dianggap "pengganti layanan darurat" | reputasi/legal | Sedang | banner permanen + disclaimer + tautan resmi |

---

## 22. Metrik sukses (KPI MVP)

- Jumlah area yang bisa diunduh & dipakai offline (target: 2–3 kota).
- Waktu dari peta ke "5 terdekat" (target <2 dtk online, <1 dtk offline).
- Laporan PDF berhasil dibuat (target: 100% pada flow uji).
- Tes: semua test logika inti lulus; build & lint hijau.
- Demo: video 60 detik jelas; presentasi 3 menit menjelaskan impact + teknik.
- Atribusi: 100% tampil & benar.

---

## 23. Atribusi & lisensi (WAJIB tampil di /about)

- Map data © **OpenStreetMap** contributors, **ODbL** — https://www.openstreetmap.org/copyright
- Tiles: **OpenFreeMap** (OSM-based) — https://openfreemap.org/
- POI/geo query: **Overpass API** / OSM — https://wiki.openstreetmap.org/wiki/Overpass_API
- Nomor darurat: **EmergencyNumberAPI** (ODbL) — https://emergencynumberapi.com/ · https://github.com/EmergencyNumbersAPI/data
- Routing: **Google Maps URLs** / **OSRM** (BSD-2) — https://github.com/Project-OSRM/osrm-backend
- Konten hak: **Konvensi Wina 1963** (UN) — https://legal.un.org/avl///ha/vccr/vccr.html ; **Kemenlu PWNI** — https://peduliwni.kemlu.go.id/
- Kode: **MIT** (usulan) — © 2026 Muhammad.
- Disclaimer: "SAFE NEAR bukan layanan darurat dan bukan nasihat hukum. Bila dalam bahaya nyawa, hubungi nomor darurat lokal."

---

## 24. Glossary

- **POI** — Point of Interest (titikarik): kantor polisi, RS, kedutaan, dst.
- **ODbL** — Open Database License (lisensi data OSM).
- **PMTiles** — format arsip tile satu file (range request).
- **OPFS** — Origin Private File System (penyimpanan privat browser).
- **Workbox** — library service worker/precache.
- **turf.js** — library analisis geospasial di JS.
- **Overpass** — API query data OSM.
- **Nominatim** — geocoder OSM.
- **VCCR** — Vienna Convention on Consular Relations (1963).
- **DoD** — Definition of Done.

---

## 25. Instruksi khusus untuk OpenCode (WAJIB DIBACA)

1. **Baca dulu** `AGENTS.md` + `PROJECT_CONTEXT.md` **penuh**. Jangan mulai coding sebelum paham batasan C1–C10.
2. **Ikut scope MVP.** Non-Goals (§4.2) dilarang. Kalau ide fitur baru muncul, tulis di `docs/PROPOSAL.md`, jangan langsung coding.
3. **Satu task satu kali.** Ambil task dari `docs/ROADMAP.md` (T0, T1, ...). Selesaikan, test, lalu lapor.
4. **Patuhi arsitektur** (§8) & struktur folder (§18). Jangan pindahkan lapisan sembarangan.
5. **Jangan tambah dependency** tanpa: cek lisensi, cek biaya, cek apakah sudah ada alternatif. Laporkan alasannya.
6. **Jangan hardcode** rahasia/key. Pakai env (`.env.local`, tidak di-commit) untuk hal yang opsional.
7. **Data adalah aset.** Normalisasi ke `Poi`; jangan simpan mentah OSM tanpa versi.
8. **Setiap fitur wajib** memenuhi AC di §7; kalau ragu, tanyakan dulu.
9. **Offline-first**: kalau menambah fitur yang butuh internet, sediakan fallback & pesan status.
10. **Privasi**: jangan menambahkan analytics/pengiriman data. Jangan tambah login.
11. **Atribusi**: jangan hapus/mengubah atribusi di §23; kalau menambah sumber data, tambahkan ke sana.
12. **Lapor dengan bukti nyata**: sebutkan file yang diubah, output/error build/test, dan status AC.
13. **Kalau ada keputusan desain**, tulis di `docs/ADR.md` (ringkas: konteks, keputusan, alternatif, konsekuensi).
14. **Berhenti & tanya** bila: (a) butuh layanan berbayar, (b) butuh data yang tidak tersedia gratis, (c) AC tidak bisa dipenuhi, (d) ada konflik antar batasan.

---

## 26. Keputusan final (dikunci 14 Nov 2026)

| # | Keputusan | Nilai final | Catatan |
|---|---|---|---|
| A1 | Nama | **SAFE NEAR** | final |
| A2 | Kota pilot | **Houston (AS)** sebagai pilot #1 | data asli 27 POI sudah ada; kota tambahan cukup menambah bundle |
| A3 | Profil kewarganegaraan MVP | **ID, PH, BD, NP** (terverifikasi) + fallback generik | hotline resmi: ID Peduli WNI; PH DMW/OWWA 1348; BD BMET Probashi Bondhu; NP FEB 16600150005 |
| A4 | Navigasi | **Google Maps URLs `api=1` (default)** + garis lurus offline; **OSRM self-host opsional** | gratis, tanpa API key |
| A5 | LLM di MVP | **TIDAK ADA LLM** | triase pakai aturan deterministik; LLM = fase 2 (stretch) |
| A6 | Lisensi kode | **MIT** | final |
| A7 | Waktu | 4 minggu | final |
| A8 | Data OSM | cukup di Houston (27 POI) | terverifikasi |

### A5 — Kenapa MVP tanpa LLM (penjelasan)

LLM menjanjikan triase otomatis dari teks bebas, tapi:
1. **Risiko hallucinasi berbahaya** untuk konteks keselamatan/hukum (saran salah bisa membahayakan).
2. **Model ~1,5 GB** + butuh WebGPU (fallback WASM lambat di HP menengah) -> UX berisiko.
3. **Effort besar**: prompt engineering, evaluasi, manajemen model offline.

Deterministik (pilih kategori + urgensi) lebih **aman, instan, offline, dan bisa di-demo-kan tanpa risiko**. LLM ditambahkan di **fase 2** bila MVP sudah hijau dan ada waktu (ADR-008).

---

**Akhir dokumen.** Untuk OpenCode: mulai dari `docs/ROADMAP.md` T0, dan jangan lupa baca §25.
