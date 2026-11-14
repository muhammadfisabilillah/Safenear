// SAFE NEAR — normalisasi elemen OSM/Overpass -> Poi.
// Aturan: PROJECT_CONTEXT.md §10 + docs/DATA.md §5.

import type { Category, OverpassElement, Poi } from './types';

export const CATEGORY_TAGS: ReadonlyArray<{
  category: Category;
  tag: string;
  value: string;
}> = [
  { category: 'police', tag: 'amenity', value: 'police' },
  { category: 'hospital', tag: 'amenity', value: 'hospital' },
  { category: 'fire', tag: 'amenity', value: 'fire_station' },
  { category: 'courthouse', tag: 'amenity', value: 'courthouse' },
  { category: 'shelter', tag: 'amenity', value: 'shelter' },
  { category: 'embassy', tag: 'amenity', value: 'embassy' },
];

/** Deteksi kategori dari tag OSM (dukungan office=diplomatic juga). */
export function detectCategory(
  tags: Record<string, string> | undefined,
): Category | null {
  if (!tags) return null;
  for (const { category, tag, value } of CATEGORY_TAGS) {
    if (tags[tag] === value) return category;
  }
  if (tags['office'] === 'diplomatic') return 'embassy';
  return null;
}

/** Susun alamat dari tag addr:* (mengikuti docs/DATA.md §5). */
export function buildAddress(
  tags: Record<string, string> | undefined,
): string | undefined {
  if (!tags) return undefined;
  const street = [tags['addr:housenumber'], tags['addr:street']]
    .filter(Boolean)
    .join(' ');
  const parts = [
    street,
    tags['addr:city'],
    tags['addr:postcode'],
    tags['addr:state'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

/** Normalisasi telepon: buang karakter tak valid, pertahankan '+'. */
export function normalizePhone(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d+()\-\s]/g, '').trim();
  return cleaned || undefined;
}

function nameOf(tags: Record<string, string> | undefined): string {
  if (!tags) return '(tanpa nama)';
  return (
    tags['name'] ||
    tags['name:en'] ||
    tags['operator'] ||
    '(tanpa nama)'
  );
}

/** Normalisasi satu elemen Overpass menjadi Poi. */
export function normalizeOsm(
  el: OverpassElement,
  category: Category,
): Poi {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) {
    throw new Error(`Elemen ${el.type}/${el.id} tidak punya koordinat`);
  }
  const isEmbassy = category === 'embassy';
  return {
    id: `osm:${el.type}/${el.id}`,
    source: 'osm',
    category,
    name: nameOf(tags),
    lat,
    lon,
    address: buildAddress(tags),
    phone: normalizePhone(tags['phone'] ?? tags['contact:phone']),
    openingHours: tags['opening_hours'],
    url: tags['website'] ?? tags['url'],
    tags,
    verifiedAt: new Date().toISOString().slice(0, 10),
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    ...(isEmbassy && tags['country'] ? { nationality: tags['country'] } : {}),
  };
}

/** Normalisasi banyak elemen untuk satu kategori; buang yang tak punya koordinat. */
export function normalizeElements(
  elements: OverpassElement[],
  category: Category,
): Poi[] {
  const out: Poi[] = [];
  for (const el of elements) {
    try {
      out.push(normalizeOsm(el, category));
    } catch {
      // lewati elemen tanpa koordinat
    }
  }
  return out;
}

/** Dedupe berdasarkan id (jaga-jaga bila area query beririsan). */
export function dedupeById(pois: Poi[]): Poi[] {
  const seen = new Set<string>();
  const out: Poi[] = [];
  for (const p of pois) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
