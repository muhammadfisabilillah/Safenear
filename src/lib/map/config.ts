// SAFE NEAR — konfigurasi peta (style, attribution, kategori, marker).
// Terpisah agar bisa di-test tanpa DOM/WebGL.

import type { Category } from '@/lib/poi/types';

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export const MAP_ATTRIBUTION = [
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors (ODbL)',
  'Tiles: <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a>',
].join(' · ');

export interface CategoryStyle {
  category: Category;
  labelId: string;
  labelEn: string;
  color: string;
}

export const CATEGORY_STYLES: readonly CategoryStyle[] = [
  { category: 'police', labelId: 'Polisi', labelEn: 'Police', color: '#2563eb' },
  { category: 'hospital', labelId: 'RS / UGD', labelEn: 'Hospital', color: '#dc2626' },
  { category: 'fire', labelId: 'Pemadam', labelEn: 'Fire dept.', color: '#ea580c' },
  { category: 'courthouse', labelId: 'Pengadilan', labelEn: 'Courthouse', color: '#7c3aed' },
  { category: 'embassy', labelId: 'Kedutaan', labelEn: 'Embassy', color: '#0d9488' },
  { category: 'shelter', labelId: 'Shelter', labelEn: 'Shelter', color: '#65a30d' },
];

export const CATEGORY_ORDER: readonly Category[] = CATEGORY_STYLES.map((c) => c.category);

export function categoryStyle(category: Category): CategoryStyle {
  return CATEGORY_STYLES.find((c) => c.category === category)!;
}

export function categoryLabel(category: Category, lang: 'id' | 'en' = 'id'): string {
  const s = categoryStyle(category);
  return lang === 'id' ? s.labelId : s.labelEn;
}

export function categoryColor(category: Category): string {
  return categoryStyle(category).color;
}

export interface MapCenter {
  lat: number;
  lon: number;
  zoom: number;
}

/** Pusat peta per kota pilot (bila prefs.city dikenali). */
export const PILOT_CENTERS: Record<string, MapCenter> = {
  'Houston, TX': { lat: 29.7604, lon: -95.3698, zoom: 12 },
  Jakarta: { lat: -6.2088, lon: 106.8456, zoom: 12 },
  Surabaya: { lat: -7.2575, lon: 112.7521, zoom: 12 },
};

export const DEFAULT_CENTER: MapCenter = { lat: 29.7604, lon: -95.3698, zoom: 12 };

export function centerForCity(city?: string): MapCenter {
  if (!city) return DEFAULT_CENTER;
  return PILOT_CENTERS[city] ?? DEFAULT_CENTER;
}

/** Warna marker user (posisi saat ini). */
export const USER_MARKER_COLOR = '#0ea5e9';
export const USER_MARKER_RING = '#ffffff';
