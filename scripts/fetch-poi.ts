// SAFE NEAR — ambil POI dari Overpass -> normalisasi -> tulis bundle.
//
// Pakai: npx tsx scripts/fetch-poi.ts --country US --city Houston --lat 29.7604 --lon -95.3698 --radius 6000 --out data/bundles/US-houston.json
//
// Aturan: docs/DATA.md §3-§4. Hormati rate limit (1 req/detik).
// Instance: dresel NA (default) -> overpass-api.de -> overpass.osm.ch.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORY_TAGS, dedupeById, normalizeElements } from '../src/lib/poi/normalize';
import type { Category, OverpassResponse, PoiBundle } from '../src/lib/poi/types';

const ENDPOINTS = [
  'https://ovp.dresel.systems/api-na/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

const USER_AGENT = 'safe-near-dev/0.1 (hackathon; contact: local)';

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || !process.argv[i + 1]) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Argumen --${name} wajib`);
  }
  return process.argv[i + 1];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildQuery(category: Category, lat: number, lon: number, radius: number): string {
  const { tag, value } = CATEGORY_TAGS.find((c) => c.category === category)!;
  return `[out:json][timeout:60];nwr["${tag}"="${value}"](around:${radius},${lat},${lon});out center tags;`;
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
  let lastErr: unknown;
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: new URLSearchParams({ data: query }).toString(),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} dari ${endpoint}`);
      return (await res.json()) as OverpassResponse;
    } catch (e) {
      lastErr = e;
      await sleep(1200);
    }
  }
  throw new Error(`Semua endpoint Overpass gagal: ${String(lastErr)}`);
}

async function main() {
  const country = arg('country').toUpperCase();
  const city = arg('city');
  const lat = Number(arg('lat'));
  const lon = Number(arg('lon'));
  const radius = Number(arg('radius', '6000'));
  const nationality = arg('nationality', '').toUpperCase();
  const outPath = resolve(process.cwd(), arg('out'));

  const categories: Category[] = ['police', 'hospital', 'fire', 'courthouse'];
  const pois = [];
  let osmBase: string | undefined;

  for (const category of categories) {
    const data = await fetchOverpass(buildQuery(category, lat, lon, radius));
    osmBase = data.osm3s?.timestamp_osm_base ?? osmBase;
    pois.push(...normalizeElements(data.elements, category));
    console.log(`  ${category}: ${data.elements.length} elemen`);
    await sleep(1100); // rate limit
  }

  // Kedutaan negara pilihan (opsional) — radius lebih besar.
  if (nationality) {
    const q = `[out:json][timeout:60];nwr["office"="diplomatic"]["country"="${nationality}"](around:${radius * 4},${lat},${lon});out center tags;`;
    const data = await fetchOverpass(q);
    pois.push(...normalizeElements(data.elements, 'embassy'));
    console.log(`  embassy(${nationality}): ${data.elements.length} elemen`);
  }

  const bundle: PoiBundle = {
    schemaVersion: 1,
    id: `${country}-${city.toLowerCase().replace(/\s+/g, '-')}`,
    country,
    city,
    center: { lat, lon },
    bbox: [lon - 0.3, lat - 0.08, lon + 0.06, lat + 0.04],
    downloadedAt: new Date().toISOString(),
    osmBaseTimestamp: osmBase,
    attribution: {
      osm: '© OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright',
      openfreemap: 'OpenFreeMap — https://openfreemap.org/',
      note: 'Data komunitas ODbL. Verifikasi sebelum berangkat.',
    },
    pois: dedupeById(pois),
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
  console.log(`OK: ${bundle.pois.length} POI -> ${outPath}`);
}

main().catch((e) => {
  console.error('GAGAL:', e instanceof Error ? e.message : e);
  process.exit(1);
});
