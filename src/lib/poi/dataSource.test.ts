import { describe, it, expect, vi } from 'vitest';
import { createDefaultRepository, loadBundlePois, loadLocalOrRemoteBundle } from './dataSource';
import type { PoiBundle } from './types';

const bundle: PoiBundle = {
  schemaVersion: 1,
  id: 'US-houston',
  country: 'US',
  city: 'Houston',
  bbox: [-96, 29, -95, 30],
  downloadedAt: '2026-11-19T00:00:00.000Z',
  attribution: { osm: '© OSM' },
  pois: [
    {
      id: 'a',
      source: 'osm',
      category: 'police',
      name: 'A',
      lat: 29.76,
      lon: -95.37,
    },
  ],
};

const { bundlesStore } = vi.hoisted(() => {
  const db = new Map<string, PoiBundle>();
  return {
    bundlesStore: {
      get: async (id: string) => db.get(id),
      put: async (b: PoiBundle) => void db.set(b.id, b),
      delete: async (id: string) => void db.delete(id),
    },
  };
});

vi.mock('@/lib/prefs/store', () => ({ bundlesStore }));

function jsonResponse(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as unknown as Response;
}

describe('loadLocalOrRemoteBundle', () => {
  it('pakai bundle tersimpan bila ada', async () => {
    await bundlesStore.put(bundle);
    const b = await loadLocalOrRemoteBundle('US-houston');
    expect(b.id).toBe('US-houston');
    expect(b.pois).toHaveLength(1);
  });

  it('bundle tersimpan kosong -> fetch remote', async () => {
    const empty: PoiBundle = { ...bundle, id: 'US-empty', pois: [] };
    await bundlesStore.put(empty);
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(bundle));
    vi.stubGlobal('fetch', fetchImpl);
    try {
      const b = await loadLocalOrRemoteBundle('US-empty');
      expect(b.pois).toHaveLength(1);
      expect(fetchImpl).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('tidak ada tersimpan & fetch gagal -> error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('offline'));
    vi.stubGlobal('fetch', fetchImpl);
    try {
      await expect(loadLocalOrRemoteBundle('XX-none')).rejects.toThrow(/Gagal menghubungi/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('createDefaultRepository', () => {
  it('membawa bundleId & radius', () => {
    const repo = createDefaultRepository({ bundleId: 'US-houston', overpassRadius: 4000 });
    expect(repo).toBeDefined();
  });
});

describe('loadBundlePois', () => {
  it('fetchImpl dipakai bila diberikan', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(bundle));
    const b = await loadBundlePois('US-houston', fetchImpl as never);
    expect(b.id).toBe('US-houston');
    expect(fetchImpl).toHaveBeenCalled();
  });
});
