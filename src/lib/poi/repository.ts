// SAFE NEAR — repository POI dua sumber (bundle lokal -> Overpass online).
// UI hanya memanggil repository; tidak tahu sumber data aktif.
//
// ADR-003: repository pattern. Cache-first untuk bundle, network-first hanya
// bila bundle belum ada. Semua jalur gagal dengan anggun (source: 'none').

import type { Category, Poi, PoiBundle } from './types';
import type { LatLon, NearbyPoi } from '@/lib/geo/geo';
import { nearestPois } from '@/lib/geo/geo';
import { bundleIdFor, bundleSizeBytes } from './bundle';

export type PoiSourceKind = 'bundle' | 'overpass' | 'none';

export interface NearbyQuery {
  category: Category;
  origin: LatLon;
  limit?: number;
  /** Khusus embassy: saring hanya kedutaan negara ini. */
  nationality?: string;
}

export interface NearbyResult {
  pois: NearbyPoi[];
  source: PoiSourceKind;
  /** Jumlah POI kategori yang ada di bundle (sebelum dipotong limit). */
  totalAvailable?: number;
  bundleId?: string;
}

export interface PoiRepositoryDeps {
  /** Muat bundle berdasarkan id. Throw bila gagal. */
  loadBundle?: (id: string) => Promise<PoiBundle>;
  /** Ambil POI dari Overpass untuk kategori. Throw bila gagal. */
  queryPois?: (category: Category, lat: number, lon: number, radius: number) => Promise<Poi[]>;
  /** Bundle yang dipakai prefs user (mis. "US-houston"). */
  bundleId?: string | null;
  overpassRadius?: number;
}

const DEFAULT_LIMIT = 5;

export class PoiRepository {
  private deps: PoiRepositoryDeps;

  constructor(deps: PoiRepositoryDeps = {}) {
    this.deps = deps;
  }

  /** Ambil N POI terdekat untuk kategori, cache-first. */
  async nearby(query: NearbyQuery): Promise<NearbyResult> {
    const limit = query.limit ?? DEFAULT_LIMIT;
    const bundleId = this.deps.bundleId ?? null;

    if (bundleId && this.deps.loadBundle) {
      try {
        const bundle = await this.deps.loadBundle(bundleId);
        const filtered = this.filterCategory(bundle.pois, query.category, query.nationality);
        if (filtered.length > 0) {
          return {
            pois: nearestPois(filtered, query.origin, null, limit),
            source: 'bundle',
            totalAvailable: filtered.length,
            bundleId,
          };
        }
        // Bundle ada tapi kategori kosong -> coba Overpass (bila tersedia).
      } catch {
        // Bundle gagal dimuat -> lanjut ke Overpass.
      }
    }

    if (this.deps.queryPois) {
      try {
        const radius = this.deps.overpassRadius ?? 6000;
        const pois = await this.deps.queryPois(
          query.category,
          query.origin.lat,
          query.origin.lon,
          radius,
        );
        const filtered = this.filterCategory(pois, query.category, query.nationality);
        if (filtered.length > 0) {
          return {
            pois: nearestPois(filtered, query.origin, null, limit),
            source: 'overpass',
            totalAvailable: filtered.length,
          };
        }
      } catch {
        // Overpass gagal -> none.
      }
    }

    return { pois: [], source: 'none' };
  }

  /** Simpan bundle (mis. hasil unduhan) + hitung sizeBytes. */
  async saveBundle(bundle: PoiBundle): Promise<PoiBundle> {
    const withSize: PoiBundle = {
      ...bundle,
      sizeBytes: bundleSizeBytes(bundle),
      downloadedAt: new Date().toISOString(),
    };
    const { bundlesStore } = await import('@/lib/prefs/store');
    await bundlesStore.put(withSize);
    return withSize;
  }

  /** Muat bundle dari penyimpanan lokal (IndexedDB). */
  async loadSavedBundle(id: string): Promise<PoiBundle | undefined> {
    const { bundlesStore } = await import('@/lib/prefs/store');
    return bundlesStore.get(id);
  }

  async listSavedBundles(): Promise<PoiBundle[]> {
    const { bundlesStore } = await import('@/lib/prefs/store');
    return bundlesStore.getAll();
  }

  async deleteSavedBundle(id: string): Promise<void> {
    const { bundlesStore } = await import('@/lib/prefs/store');
    await bundlesStore.delete(id);
  }

  /** Apakah area untuk negara+kota sudah tersimpan lokal? */
  async isAreaSaved(country: string, city?: string): Promise<boolean> {
    const id = bundleIdFor(country, city);
    if (!id) return false;
    const saved = await this.loadSavedBundle(id);
    return Boolean(saved);
  }

  private filterCategory(pois: Poi[], category: Category, nationality?: string): Poi[] {
    return pois.filter((p) => {
      if (p.category !== category) return false;
      if (category === 'embassy' && nationality) {
        return !p.nationality || p.nationality.toUpperCase() === nationality.toUpperCase();
      }
      return true;
    });
  }
}

export function createPoiRepository(deps?: PoiRepositoryDeps): PoiRepository {
  return new PoiRepository(deps);
}
