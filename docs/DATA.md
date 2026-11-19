# DATA.md — Sumber Data, Skema, Ingest (SAFE NEAR)

> Bagian dari `PROJECT_CONTEXT.md` §10–§12, §23. Baca dulu dokumen induk.

---

## 1. Prinsip data

1. **Semua data pihak ketiga punya sumber + tanggal verifikasi.**
2. **Normalisasi** ke skema `Poi` (lihat `PROJECT_CONTEXT.md` §10) — jangan simpan bentuk mentah OSM di UI.
3. **Cache & bundle** untuk pemakaian offline; jangan query Overpass terus-menerus.
4. **Atribusi wajib** tampil di `/about` dan tersimpan di metadata bundle.
5. **Tidak ada data pribadi** di bundle (hanya data publik).

---

## 2. Sumber data

| Sumber                       | Isi                                                              | Lisensi       | Cara ambil                                 | Catatan                            |
| ---------------------------- | ---------------------------------------------------------------- | ------------- | ------------------------------------------ | ---------------------------------- |
| OpenStreetMap (via Overpass) | POI polisi, RS, pemadam, pengadilan, townhall, shelter, kedutaan | ODbL          | Query Overpass QL                          | Wajib atribusi; cache              |
| OpenFreeMap                  | Tile vektor (basemap)                                            | OSM/ODbL      | CDN `tiles.openfreemap.org`                | No key; offline ≤3.000 tile/≤50 MB |
| Nominatim                    | Geocode / reverse geocode                                        | ODbL          | REST                                       | User-Agent wajib; ~1 req/dtk       |
| EmergencyNumberAPI           | Nomor darurat per negara                                         | ODbL          | `emergencynumberapi.com/api/country/{iso}` | Cache per negara                   |
| Google Maps URLs             | Navigasi turn-by-turn                                            | ToS Google    | URL `api=1`                                | Gratis, no key                     |
| OSRM (opsional)              | Rute/polyline                                                    | BSD-2         | Self-host Docker                           | Demo publik ~1 req/dtk             |
| Portal Peduli WNI            | Hotline/email/portal WNI                                         | Pemerintah RI | Manual -> `profiles/ID.json`               | Verified 2026-11                   |
| Konvensi Wina 1963           | Teks Pasal 36                                                    | UN            | Manual -> `rights`                         | Sumber primer                      |

---

## 3. Tag OSM yang dipakai

| Kategori   | Tag utama                           | Tag alternatif                        |
| ---------- | ----------------------------------- | ------------------------------------- |
| police     | `amenity=police`                    | —                                     |
| hospital   | `amenity=hospital`                  | `healthcare=hospital`                 |
| fire       | `amenity=fire_station`              | —                                     |
| courthouse | `amenity=courthouse`                | —                                     |
| shelter    | `amenity=shelter`                   | `emergency=shelter`                   |
| townhall   | `amenity=townhall`                  | `office=government`                   |
| embassy    | `amenity=embassy` + `country=<ISO>` | `office=diplomatic` + `country=<ISO>` |

Rujukan: https://wiki.openstreetmap.org/wiki/Map_features · https://wiki.openstreetmap.org/wiki/Overpass_API

---

## 4. Query Overpass (siap pakai)

### 4.1 POI umum di sekitar titik

```
[out:json][timeout:25];
(
  nwr["amenity"="police"](around:6000, LAT, LON);
  nwr["amenity"="hospital"](around:6000, LAT, LON);
  nwr["amenity"="fire_station"](around:6000, LAT, LON);
  nwr["amenity"="courthouse"](around:6000, LAT, LON);
  nwr["amenity"="shelter"](around:6000, LAT, LON);
  nwr["amenity"="townhall"](around:6000, LAT, LON);
);
out center tags;
```

### 4.2 Kedutaan negara tertentu (mis. ID)

```
[out:json][timeout:25];
nwr["amenity"="embassy"]["country"="ID"](around:25000, LAT, LON);
out center tags;
```

Catatan: `around:RADIUS, LAT, LON` (meter). `out center` = centroid untuk way/relation.

### 4.3 Instance & batas

- Utama: `https://overpass-api.de/api/interpreter`
- Alternatif: `https://overpass.osm.ch/api/interpreter`, `https://ovp.dresel.systems/api/interpreter` (Eropa), `https://ovp.dresel.systems/api-na/interpreter` (Amerika Utara)
- Batas utama: <10.000 query/hari, <1 GB/hari; **untuk app: cache + bundle wajib**. Sumber: https://wiki.openstreetmap.org/wiki/Overpass_API

---

## 5. Normalisasi (OSM element -> Poi)

```ts
// aturan singkat
function normalizeOsm(el: OverpassElement, category: Category): Poi {
  const center =
    el.lat != null ? { lat: el.lat, lon: el.lon! } : { lat: el.center!.lat, lon: el.center!.lon };
  return {
    id: `osm:${el.type}/${el.id}`,
    source: 'osm',
    category,
    name: el.tags?.name ?? '(tanpa nama)',
    lat: center.lat,
    lon: center.lon,
    address: buildAddress(el.tags), // "addr:street" + "addr:city" + "addr:postcode"
    phone: normalizePhone(el.tags?.phone),
    openingHours: el.tags?.opening_hours,
    url: el.tags?.website,
    tags: el.tags,
    verifiedAt: new Date().toISOString().slice(0, 10),
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}
```

Aturan:

- `name` fallback: `name` -> `name:en` -> `operator` -> `'(tanpa nama)'`.
- `phone` normalize ke format yang bisa dipanggil (`tel:`); buang karakter tak valid.
- `address`: gabungkan `addr:street`, `addr:housenumber`, `addr:city`, `addr:postcode`, `addr:country`.
- Simpan `tags` mentah (untuk audit) tapi jangan tampilkan semua ke user.
- `verifiedAt` = tanggal ambil, bukan tanggal OSM berubah.

---

## 6. Format bundle offline

`data/bundles/<COUNTRY>-<CITY>.json`:

```json
{
  "id": "US-houston",
  "country": "US",
  "city": "Houston",
  "bbox": [-95.8, 29.5, -95.0, 30.1],
  "downloadedAt": "2026-11-14T08:00:00Z",
  "sizeBytes": 184320,
  "attribution": {
    "osm": "© OpenStreetMap contributors, ODbL",
    "openfreemap": "OpenFreeMap"
  },
  "pois": [/* Poi[] */]
}
```

Bundle tile: PMTiles area, disimpan di OPFS; nama file `<COUNTRY>-<CITY>.pmtiles`.

Aturan:

- Satu kota = satu bundle POI + satu PMTiles.
- Bundel **versi** (`schemaVersion: 1`).
- Simpan `attribution` di bundle -> UI menampilkannya.
- Hapus bundle = hapus file OPFS + entri IndexedDB.

---

## 7. Profil kewarganegaraan

`data/profiles/<ISO>.json` — skema di `PROJECT_CONTEXT.md` §10.3.

Contoh `ID.json` (lihat §10.7 dokumen induk). Aturan:

- `sovereignChannels` hanya diisi dari sumber resmi terverifikasi.
- `rightsNotes` wajib punya `source`.
- Jangan mengisi nomor/hak yang tidak terverifikasi; pakai placeholder `"—"` + catatan.

Profil MVP: `ID`, `PH`, `BD`, `NP` — semua hotline resmi terverifikasi (DMW/OWWA 1348; BMET Probashi Bondhu; FEB 16600150005). Lihat field `sources` di tiap profil.

---

## 8. Pipeline ingest

```
[Overpass QL] -> (fetch, User-Agent khusus) -> [raw JSON]
   -> normalizeOsm() -> [Poi[]] -> filter/validasi (zod)
   -> data/bundles/<country>-<city>.json  (commit ke repo / upload R2)
   -> PMTiles area (planetiler/pmtiles) -> R2 / aset PWA
```

Script:

- `scripts/fetch-poi.ts` — argumen: `--country --city --lat --lon --radius --out`.
- `scripts/build-bundle.ts` — gabung + validasi + hitung hash.

Aturan:

- Rate limit: minimal 1 req/dtk; jangan paralel ke Overpass.
- Simpan `raw` di folder `cache/` (tidak di-commit) untuk audit.
- Gagal fetch -> pesan jelas; jangan tulis bundle kosong.

---

## 9. Atribusi (teks siap tampil)

```
Map data © OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright
Basemap: OpenFreeMap — https://openfreemap.org/
POI/geo: Overpass API / OpenStreetMap
Emergency numbers: EmergencyNumberAPI (ODbL) — https://emergencynumberapi.com/
Routing: Google Maps URLs / OSRM (BSD-2)
Consular content: Kemenlu PWNI — https://peduliwni.kemlu.go.id/
Legal reference: Vienna Convention on Consular Relations (1963), UN
Code: MIT — © 2026 Muhammad
```

---

## 10. Keputusan data (dikunci 14 Nov 2026)

1. Kota pilot: **Houston (AS)** (bundle asli sudah ada). Kota tambahan = tambah bundle.
2. Profil MVP: **ID, PH, BD, NP** (hotline resmi terverifikasi).
3. Bundle: di-commit ke repo (contoh) + bisa di-host di R2 untuk runtime.
4. Refresh: per rilis, bukan runtime.
