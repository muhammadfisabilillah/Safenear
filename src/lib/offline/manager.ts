// SAFE NEAR — manajemen unduhan area offline (POI + status storage).
//
// Cakupan jujur (ADR-012):
// - Bundle POI diunduh & disimpan di IndexedDB (dipakai offline).
// - Profil hak/hotline sudah ter-bundle di app (offline sejak instal).
// - Tile peta di-cache otomatis oleh service worker (cache-first) saat area
//   dibuka online; halaman /offline menampilkan statusnya, bukan mengklaim
//   mengunduh tile eksplisit (OpenFreeMap membatasi unduhan offline).

import type { PoiBundle } from '@/lib/poi/types';

export interface DownloadProgress {
  step: 'bundle' | 'profile' | 'tiles';
  current: number;
  total: number;
  percent: number;
  message: string;
}

export interface StorageStatus {
  usage: number;
  quota: number;
  /** Persen terpakai (0..100), 0 bila tak tersedia. */
  percent: number;
  supported: boolean;
}

export interface OfflineManagerDeps {
  fetchBundle: (id: string) => Promise<PoiBundle>;
  saveBundle: (bundle: PoiBundle) => Promise<PoiBundle>;
  loadBundle: (id: string) => Promise<PoiBundle | undefined>;
  deleteBundle: (id: string) => Promise<void>;
  estimate?: () => Promise<{ usage: number; quota: number }>;
}

const percent = (current: number, total: number) =>
  total <= 0 ? 100 : Math.min(100, Math.round((current / total) * 100));

export class OfflineManager {
  private deps: OfflineManagerDeps;

  constructor(deps: OfflineManagerDeps) {
    this.deps = deps;
  }

  /**
   * Unduh area: bundle POI -> profil (sudah ada) -> tile (via SW cache).
   * Mengembalikan bundle tersimpan. Melempar bila bundle gagal diunduh.
   */
  async downloadArea(id: string, onProgress?: (p: DownloadProgress) => void): Promise<PoiBundle> {
    const report = (step: DownloadProgress['step'], current: number, message: string) =>
      onProgress?.({ step, current, total: 3, percent: percent(current, 3), message });

    report('bundle', 0, 'Mengunduh tempat (POI)...');
    const bundle = await this.deps.fetchBundle(id);
    if (!bundle || bundle.pois.length === 0) {
      throw new Error(`Bundle "${id}" kosong atau tidak tersedia`);
    }
    const saved = await this.deps.saveBundle(bundle);
    report('bundle', 1, `Tersimpan: ${saved.pois.length} tempat.`);

    report('profile', 2, 'Profil hak & hotline siap (offline).');
    report('tiles', 3, 'Tile dikelola service worker (cache-first).');

    return saved;
  }

  async listAreas(): Promise<PoiBundle[]> {
    const { bundlesStore } = await import('@/lib/prefs/store');
    const all = await bundlesStore.getAll();
    return all.sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt));
  }

  async isDownloaded(id: string): Promise<boolean> {
    const b = await this.deps.loadBundle(id);
    return Boolean(b && b.pois.length > 0);
  }

  async deleteArea(id: string): Promise<void> {
    await this.deps.deleteBundle(id);
  }

  /** Status storage (navigator.storage.estimate). */
  async storageStatus(): Promise<StorageStatus> {
    const fallback: StorageStatus = { usage: 0, quota: 0, percent: 0, supported: false };
    if (this.deps.estimate) {
      try {
        const e = await this.deps.estimate();
        return {
          usage: e.usage,
          quota: e.quota,
          percent: e.quota > 0 ? Math.min(100, Math.round((e.usage / e.quota) * 100)) : 0,
          supported: true,
        };
      } catch {
        return fallback;
      }
    }
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      try {
        const e = await navigator.storage.estimate();
        return {
          usage: e.usage ?? 0,
          quota: e.quota ?? 0,
          percent:
            e.quota && e.quota > 0
              ? Math.min(100, Math.round(((e.usage ?? 0) / e.quota) * 100))
              : 0,
          supported: true,
        };
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  /** Total byte bundle tersimpan (untuk info storage). */
  async savedBytes(): Promise<number> {
    const all = await this.listAreas();
    return all.reduce((sum, b) => sum + (b.sizeBytes ?? 0), 0);
  }
}

export function createOfflineManager(deps?: Partial<OfflineManagerDeps>): OfflineManager {
  const fallbackFetch = async (id: string) => {
    const { fetchBundle } = await import('@/lib/poi/bundle');
    return fetchBundle(id);
  };
  return new OfflineManager({
    fetchBundle: deps?.fetchBundle ?? fallbackFetch,
    saveBundle:
      deps?.saveBundle ??
      (async (b) => {
        const { bundlesStore } = await import('@/lib/prefs/store');
        await bundlesStore.put({ ...b, downloadedAt: new Date().toISOString() });
        return b;
      }),
    loadBundle:
      deps?.loadBundle ??
      (async (id) => {
        const { bundlesStore } = await import('@/lib/prefs/store');
        return bundlesStore.get(id);
      }),
    deleteBundle:
      deps?.deleteBundle ??
      (async (id) => {
        const { bundlesStore } = await import('@/lib/prefs/store');
        await bundlesStore.delete(id);
      }),
    estimate: deps?.estimate,
  });
}
