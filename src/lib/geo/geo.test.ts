import { describe, it, expect } from 'vitest';
import {
  estimateDriveMinutes,
  estimateWalkMinutes,
  formatDistance,
  haversineMeters,
  isInsideBBox,
  isValidLatLon,
  nearestPois,
} from './geo';
import type { Poi } from '@/lib/poi/types';

const mk = (id: string, lat: number, lon: number, category: Poi['category'] = 'police'): Poi => ({
  id,
  source: 'osm',
  category,
  name: id,
  lat,
  lon,
});

describe('haversineMeters', () => {
  it('0 untuk titik yang sama', () => {
    expect(haversineMeters({ lat: 29.76, lon: -95.37 }, { lat: 29.76, lon: -95.37 })).toBe(0);
  });

  it('jarak monas-ish ~1,85 km (1 derajat lintang)', () => {
    const d = haversineMeters({ lat: 0, lon: 0 }, { lat: 1, lon: 0 });
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it('simetris (a->b == b->a)', () => {
    const a = { lat: 29.7604, lon: -95.3698 };
    const b = { lat: 29.8, lon: -95.4 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});

describe('formatDistance', () => {
  it('<1000 m -> meter bulat', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(849.6)).toBe('850 m');
  });
  it('>=1000 m -> km 1 desimal dengan koma', () => {
    expect(formatDistance(1500)).toBe('1,5 km');
    expect(formatDistance(12345)).toBe('12,3 km');
  });
  it('negatif/NaN -> em-dash', () => {
    expect(formatDistance(-5)).toBe('—');
    expect(formatDistance(NaN)).toBe('—');
  });
});

describe('estimasi waktu', () => {
  it('walk ~12 min/km, min 1', () => {
    expect(estimateWalkMinutes(0)).toBe(1);
    expect(estimateWalkMinutes(1000)).toBe(12);
    expect(estimateWalkMinutes(5000)).toBe(60);
  });
  it('drive ~2,4 min/km, min 1', () => {
    expect(estimateDriveMinutes(0)).toBe(1);
    expect(estimateDriveMinutes(2400)).toBe(6);
  });
});

describe('nearestPois', () => {
  const origin = { lat: 29.7604, lon: -95.3698 };
  const pois = [
    mk('far', 30.5, -96.5, 'police'),
    mk('near', 29.7605, -95.3699, 'police'),
    mk('mid', 29.78, -95.39, 'hospital'),
    mk('near2', 29.7606, -95.37, 'police'),
  ];

  it('urut dari terdekat', () => {
    const out = nearestPois(pois, origin, 'police', 5);
    expect(out.map((p) => p.id)).toEqual(['near', 'near2', 'far']);
  });

  it('menghormati limit', () => {
    const out = nearestPois(pois, origin, 'police', 1);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('near');
  });

  it('memfilter kategori', () => {
    const out = nearestPois(pois, origin, 'hospital', 5);
    expect(out.map((p) => p.id)).toEqual(['mid']);
  });

  it('kategori null = semua', () => {
    const out = nearestPois(pois, origin, null, 4);
    expect(out).toHaveLength(4);
  });

  it('menyertakan metrik jarak & waktu', () => {
    const out = nearestPois(pois, origin, 'police', 1)[0];
    expect(out.distanceMeters).toBeGreaterThan(0);
    expect(out.walkMinutes).toBeGreaterThanOrEqual(1);
    expect(out.driveMinutes).toBeGreaterThanOrEqual(1);
  });

  it('array kosong -> hasil kosong', () => {
    expect(nearestPois([], origin, 'police', 5)).toEqual([]);
  });

  it('limit <= 0 -> kosong', () => {
    expect(nearestPois(pois, origin, 'police', 0)).toEqual([]);
  });
});

describe('bbox & validasi', () => {
  const bbox: [number, number, number, number] = [-95.6, 29.6, -95.3, 29.85];
  it('titik di dalam bbox', () => {
    expect(isInsideBBox({ lat: 29.76, lon: -95.37 }, bbox)).toBe(true);
  });
  it('titik di luar bbox', () => {
    expect(isInsideBBox({ lat: 30.5, lon: -96.5 }, bbox)).toBe(false);
  });
  it('isValidLatLon', () => {
    expect(isValidLatLon(29.76, -95.37)).toBe(true);
    expect(isValidLatLon(91, 0)).toBe(false);
    expect(isValidLatLon(0, 181)).toBe(false);
    expect(isValidLatLon('x', 0)).toBe(false);
    expect(isValidLatLon(NaN, 0)).toBe(false);
  });
});
