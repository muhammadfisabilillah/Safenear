import { describe, it, expect, vi } from 'vitest';
import { OfflineManager, createOfflineManager } from './manager';
import type { PoiBundle } from '@/lib/poi/types';

function makeBundle(id: string, count = 3): PoiBundle {
  return {
    schemaVersion: 1,
    id,
    country: 'US',
    city: 'Houston',
    bbox: [-96, 29, -95, 30],
    downloadedAt: '2026-11-19T00:00:00.000Z',
    attribution: { osm: '© OSM' },
    pois: Array.from({ length: count }, (_, i) => ({
      id: `p${i}`,
      source: 'osm' as const,
      category: 'police' as const,
      name: `P${i}`,
      lat: 29.7 + i * 0.01,
      lon: -95.3,
    })),
  };
}

function makeDeps(overrides = {}) {
  return {
    fetchBundle: vi.fn(async () => makeBundle('US-houston')),
    saveBundle: vi.fn(async (b: PoiBundle) => b),
    loadBundle: vi.fn(async () => makeBundle('US-houston')),
    deleteBundle: vi.fn(async () => undefined),
    estimate: vi.fn(async () => ({ usage: 1000, quota: 10000 })),
    ...overrides,
  };
}

describe('OfflineManager.downloadArea', () => {
  it('mengunduh & menyimpan bundle, melaporkan progres', async () => {
    const deps = makeDeps();
    const manager = new OfflineManager(deps);
    const seen: string[] = [];
    const saved = await manager.downloadArea('US-houston', (p) => seen.push(p.step));

    expect(saved.pois).toHaveLength(3);
    expect(deps.fetchBundle).toHaveBeenCalledWith('US-houston');
    expect(deps.saveBundle).toHaveBeenCalled();
    expect(seen).toEqual(['bundle', 'bundle', 'profile', 'tiles']);
  });

  it('progres naik 0 -> 100', async () => {
    const manager = new OfflineManager(makeDeps());
    const percents: number[] = [];
    await manager.downloadArea('US-houston', (p) => percents.push(p.percent));
    expect(percents[0]).toBe(0);
    expect(percents[percents.length - 1]).toBe(100);
  });

  it('bundle kosong -> error', async () => {
    const deps = makeDeps({ fetchBundle: vi.fn(async () => makeBundle('X', 0)) });
    const manager = new OfflineManager(deps);
    await expect(manager.downloadArea('X')).rejects.toThrow(/kosong/);
  });

  it('fetch gagal -> error', async () => {
    const deps = makeDeps({
      fetchBundle: vi.fn(async () => {
        throw new Error('network');
      }),
    });
    const manager = new OfflineManager(deps);
    await expect(manager.downloadArea('US-houston')).rejects.toThrow(/network/);
  });
});

describe('OfflineManager storage', () => {
  it('isDownloaded true bila ada', async () => {
    const manager = new OfflineManager(makeDeps());
    expect(await manager.isDownloaded('US-houston')).toBe(true);
  });
  it('isDownloaded false bila kosong', async () => {
    const manager = new OfflineManager(makeDeps({ loadBundle: vi.fn(async () => undefined) }));
    expect(await manager.isDownloaded('X')).toBe(false);
  });
  it('deleteArea memanggil deleteBundle', async () => {
    const deps = makeDeps();
    const manager = new OfflineManager(deps);
    await manager.deleteArea('US-houston');
    expect(deps.deleteBundle).toHaveBeenCalledWith('US-houston');
  });
  it('storageStatus dari estimate', async () => {
    const manager = new OfflineManager(makeDeps());
    const s = await manager.storageStatus();
    expect(s.supported).toBe(true);
    expect(s.percent).toBe(10);
  });
  it('storageStatus quota 0 -> 0%', async () => {
    const manager = new OfflineManager(
      makeDeps({ estimate: vi.fn(async () => ({ usage: 5, quota: 0 })) }),
    );
    expect((await manager.storageStatus()).percent).toBe(0);
  });
  it('estimate error -> supported false', async () => {
    const manager = new OfflineManager(
      makeDeps({
        estimate: vi.fn(async () => {
          throw new Error('nope');
        }),
      }),
    );
    const s = await manager.storageStatus();
    expect(s.supported).toBe(false);
  });
});

describe('createOfflineManager', () => {
  it('bisa dibuat tanpa deps', () => {
    const m = createOfflineManager();
    expect(m).toBeInstanceOf(OfflineManager);
  });
});
