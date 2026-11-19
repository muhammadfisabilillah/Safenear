// SAFE NEAR — builder URL navigasi Google Maps (api=1, gratis, tanpa API key).
// Rujukan: https://developers.google.com/maps/documentation/urls/get-started

import { isValidLatLon } from '@/lib/geo/geo';

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface NavigationTarget {
  lat: number;
  lon: number;
  /** Nama tempat (opsional, untuk label). */
  name?: string;
}

const BASE = 'https://www.google.com/maps/dir/';
const ALLOWED_MODES: readonly TravelMode[] = ['driving', 'walking', 'bicycling', 'transit'];

export function isTravelMode(value: string): value is TravelMode {
  return (ALLOWED_MODES as readonly string[]).includes(value);
}

/**
 * Bangun URL Google Maps untuk turn-by-turn navigation.
 * Throws bila koordinat tidak valid — UI wajib menangkap dan menampilkan pesan.
 */
export function buildNavigationUrl(
  target: NavigationTarget,
  opts: { travelMode?: TravelMode; dirAction?: 'navigate' | 'leave' } = {},
): string {
  if (!isValidLatLon(target.lat, target.lon)) {
    throw new Error(`Koordinat tidak valid: ${target.lat},${target.lon}`);
  }
  const travelMode = opts.travelMode ?? 'walking';
  if (!isTravelMode(travelMode)) {
    throw new Error(`travelmode tidak valid: ${travelMode}`);
  }
  const params = new URLSearchParams({
    api: '1',
    destination: `${target.lat},${target.lon}`,
    travelmode: travelMode,
    dir_action: opts.dirAction ?? 'navigate',
  });
  return `${BASE}?${params.toString()}`;
}

/**
 * URL Google Maps biasa (tanpa mode navigate) — dipakai untuk fallback bila
 * pengguna ingin membuka di browser, bukan app.
 */
export function buildMapsSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) throw new Error('Query kosong');
  const params = new URLSearchParams({ api: '1', query: q });
  return `${BASE}?${params.toString()}`;
}

/**
 * Label tujuan yang aman untuk dibagikan / disimpan di laporan.
 * Google URL tidak menyimpan nama tempat; kita tambahkan manual bila perlu.
 */
export function describeTarget(target: NavigationTarget): string {
  if (target.name) return `${target.name} (${target.lat.toFixed(5)}, ${target.lon.toFixed(5)})`;
  return `${target.lat.toFixed(5)}, ${target.lon.toFixed(5)}`;
}
