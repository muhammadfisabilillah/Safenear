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
