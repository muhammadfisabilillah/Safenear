// SAFE NEAR — merangkai repository POI default (bundle IndexedDB -> bundle statis -> Overpass).
// Dipakai halaman peta/nearby agar sumber data konsisten.

import { createPoiRepository, type PoiRepository } from './repository';
import { fetchBundle } from './bundle';
import { OverpassClient } from './overpass';
import { bundlesStore } from '@/lib/prefs/store';

export interface DataSourceOptions {
  bundleId?: string | null;
  overpassRadius?: number;
  overpassClient?: OverpassClient;
}

/** Muat bundle: IndexedDB dulu (hasil unduhan), lalu fetch statis (precache SW). */
export async function loadLocalOrRemoteBundle(id: string) {
  const saved = await bundlesStore.get(id);
  if (saved && saved.pois.length > 0) return saved;
  return fetchBundle(id);
}

export function createDefaultRepository(opts: DataSourceOptions = {}): PoiRepository {
  const overpass = opts.overpassClient ?? new OverpassClient();
  return createPoiRepository({
    bundleId: opts.bundleId ?? null,
    loadBundle: (id) => loadLocalOrRemoteBundle(id),
    queryPois: (category, lat, lon, radius) => overpass.queryCategory(category, lat, lon, radius),
    overpassRadius: opts.overpassRadius ?? 6000,
  });
}

/** Ambil semua POI dari bundle untuk kota (tanpa nearest) — dipakai peta. */
export async function loadBundlePois(
  bundleId: string,
  fetchImpl?: typeof fetch,
): Promise<ReturnType<typeof loadLocalOrRemoteBundle>> {
  if (fetchImpl) return fetchBundle(bundleId, { fetchImpl });
  return loadLocalOrRemoteBundle(bundleId);
}
