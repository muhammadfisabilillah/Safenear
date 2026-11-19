import { describe, it, expect, vi } from 'vitest';
import { createPoiRepository } from './repository';
import type { Poi, PoiBundle } from './types';

const mk = (
  id: string,
  category: Poi['category'],
  lat: number,
  lon: number,
  nationality?: string,
): Poi => ({
  id,
  source: 'osm',
  category,
  name: id,
  lat,
  lon,
  ...(nationality ? { nationality } : {}),
});

function makeBundle(pois: Poi[]): PoiBundle {
  return {
    schemaVersion: 1,
    id: 'US-houston',
    country: 'US',
    city: 'Houston',
    bbox: [-96, 29, -95, 30],
    downloadedAt: '2026-11-19T00:00:00.000Z',
    attribution: { osm: '© OSM' },
    pois,
  };
}

const origin = { lat: 29.7604, lon: -95.3698 };

describe('PoiRepository.nearby', () => {
  it('bundle dipakai bila ada (cache-first)', async () => {
    const loadBundle = vi
      .fn()
      .mockResolvedValue(makeBundle([mk('a', 'police', 29.7605, -95.3699)]));
    const queryPois = vi.fn();
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle, queryPois });

    const res = await repo.nearby({ category: 'police', origin });
    expect(res.source).toBe('bundle');
    expect(res.pois[0].id).toBe('a');
    expect(res.bundleId).toBe('US-houston');
    expect(queryPois).not.toHaveBeenCalled();
  });

  it('bundle ada tapi kategori kosong -> fallback Overpass', async () => {
    const loadBundle = vi.fn().mockResolvedValue(makeBundle([mk('a', 'hospital', 1, 1)]));
    const queryPois = vi.fn().mockResolvedValue([mk('b', 'police', 29.7605, -95.3699)]);
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle, queryPois });

    const res = await repo.nearby({ category: 'police', origin });
    expect(res.source).toBe('overpass');
    expect(res.pois[0].id).toBe('b');
  });

  it('bundle gagal dimuat -> fallback Overpass', async () => {
    const loadBundle = vi.fn().mockRejectedValue(new Error('not found'));
    const queryPois = vi.fn().mockResolvedValue([mk('b', 'police', 29.7605, -95.3699)]);
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle, queryPois });

    const res = await repo.nearby({ category: 'police', origin });
    expect(res.source).toBe('overpass');
  });

  it('bundle & overpass gagal -> none', async () => {
    const loadBundle = vi.fn().mockRejectedValue(new Error('not found'));
    const queryPois = vi.fn().mockRejectedValue(new Error('network'));
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle, queryPois });

    const res = await repo.nearby({ category: 'police', origin });
    expect(res.source).toBe('none');
    expect(res.pois).toEqual([]);
  });

  it('tanpa bundleId & tanpa queryPois -> none', async () => {
    const repo = createPoiRepository({});
    const res = await repo.nearby({ category: 'police', origin });
    expect(res.source).toBe('none');
  });

  it('urutan terdekat benar & limit dihormati', async () => {
    const loadBundle = vi
      .fn()
      .mockResolvedValue(
        makeBundle([
          mk('far', 'police', 30.5, -96.5),
          mk('near', 'police', 29.7605, -95.3699),
          mk('mid', 'police', 29.78, -95.39),
        ]),
      );
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle });
    const res = await repo.nearby({ category: 'police', origin, limit: 2 });
    expect(res.pois.map((p) => p.id)).toEqual(['near', 'mid']);
    expect(res.totalAvailable).toBe(3);
  });

  it('embassy disaring berdasarkan nationality', async () => {
    const loadBundle = vi
      .fn()
      .mockResolvedValue(
        makeBundle([
          mk('id', 'embassy', 29.76, -95.36, 'ID'),
          mk('us', 'embassy', 29.77, -95.37, 'US'),
        ]),
      );
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle });
    const res = await repo.nearby({ category: 'embassy', origin, nationality: 'ID' });
    expect(res.pois.map((p) => p.id)).toEqual(['id']);
  });

  it('embassy tanpa nationality -> semua kedutaan', async () => {
    const loadBundle = vi
      .fn()
      .mockResolvedValue(
        makeBundle([
          mk('id', 'embassy', 29.76, -95.36, 'ID'),
          mk('us', 'embassy', 29.77, -95.37, 'US'),
        ]),
      );
    const repo = createPoiRepository({ bundleId: 'US-houston', loadBundle });
    const res = await repo.nearby({ category: 'embassy', origin });
    expect(res.pois).toHaveLength(2);
  });

  it('queryPois dipanggil dengan radius default 6000', async () => {
    const queryPois = vi.fn().mockResolvedValue([]);
    const repo = createPoiRepository({ queryPois });
    await repo.nearby({ category: 'police', origin });
    expect(queryPois).toHaveBeenCalledWith('police', origin.lat, origin.lon, 6000);
  });
});
