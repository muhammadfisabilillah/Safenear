// SAFE NEAR — konversi Poi[] -> GeoJSON FeatureCollection untuk MapLibre.
// Properti per-fitur memuat data yang dipakai popup (nama, kategori, jarak, id).

import type { Category, Poi } from '@/lib/poi/types';
import type { NearbyPoi } from '@/lib/geo/geo';
import { categoryColor } from './config';

export type PoiFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Point>;

export interface PoiProperties {
  id: string;
  name: string;
  category: Category;
  color: string;
  address?: string;
  phone?: string;
  distanceMeters?: number;
}

export function poiToFeature(poi: Poi | NearbyPoi): GeoJSON.Feature<GeoJSON.Point, PoiProperties> {
  const distance = (poi as NearbyPoi).distanceMeters;
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [poi.lon, poi.lat] },
    properties: {
      id: poi.id,
      name: poi.name,
      category: poi.category,
      color: categoryColor(poi.category),
      ...(poi.address ? { address: poi.address } : {}),
      ...(poi.phone ? { phone: poi.phone } : {}),
      ...(typeof distance === 'number' ? { distanceMeters: Math.round(distance) } : {}),
    },
  };
}

export function poisToFeatureCollection(pois: readonly (Poi | NearbyPoi)[]): PoiFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: pois.map(poiToFeature),
  };
}

/** Saring POI berdasarkan kategori aktif (kosong = semua). */
export function filterByCategories<T extends { category: Category }>(
  pois: readonly T[],
  active: readonly Category[] | null,
): T[] {
  if (!active || active.length === 0) return [...pois];
  const set = new Set(active);
  return pois.filter((p) => set.has(p.category));
}

/** Urutkan feature collection berdasarkan kategori aktif (supaya warna konsisten). */
export function sortByDistance<T extends { distanceMeters?: number }>(pois: readonly T[]): T[] {
  return [...pois].sort(
    (a, b) =>
      (a.distanceMeters ?? Number.POSITIVE_INFINITY) -
      (b.distanceMeters ?? Number.POSITIVE_INFINITY),
  );
}
