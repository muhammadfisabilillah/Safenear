// SAFE NEAR — utilitas geospasial (deterministik, tanpa dependency runtime).
// Dipakai untuk jarak, estimasi waktu, dan "N terdekat".
//
// Catatan ADR-009: nearest memakai haversine + sort, bukan turf.
// Alasan: skala kota (<10 km) membuat haversine cukup akurat; hasil deterministik,
// mudah di-test, dan bundle jauh lebih kecil di HP menengah.

import type { Category, Poi } from '@/lib/poi/types';

export interface LatLon {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_M = 6_371_008.8;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Jarak lurus (great-circle) dalam meter. */
export function haversineMeters(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Format jarak ramah: "850 m" atau "1,2 km". */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Estimasi jalan kaki (~5 km/jam), minimum 1 menit. */
export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000) * 12));
}

/** Estimasi kendaraan (~25 km/jam di kota, tanpa macet), minimum 1 menit. */
export function estimateDriveMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000) * 2.4));
}

export interface NearbyPoi extends Poi {
  distanceMeters: number;
  walkMinutes: number;
  driveMinutes: number;
}

/**
 * N POI terdekat dari titik, per kategori, dihitung haversine.
 * Urutan: dari terdekat. Bila limit <= 0 -> 0 hasil.
 */
export function nearestPois(
  pois: Poi[],
  origin: LatLon,
  category: Category | null,
  limit = 5,
): NearbyPoi[] {
  if (limit <= 0 || pois.length === 0) return [];
  const filtered = category ? pois.filter((p) => p.category === category) : pois;

  return filtered
    .map((p) => {
      const distanceMeters = haversineMeters(origin, { lat: p.lat, lon: p.lon });
      return {
        ...p,
        distanceMeters,
        walkMinutes: estimateWalkMinutes(distanceMeters),
        driveMinutes: estimateDriveMinutes(distanceMeters),
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

/** Apakah titik berada di dalam bbox [minLon, minLat, maxLon, maxLat]. */
export function isInsideBBox(point: LatLon, bbox: [number, number, number, number]): boolean {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return point.lon >= minLon && point.lon <= maxLon && point.lat >= minLat && point.lat <= maxLat;
}

/** Validasi sederhana koordinat geografis. */
export function isValidLatLon(lat: unknown, lon: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}
