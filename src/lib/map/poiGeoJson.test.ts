import { describe, it, expect } from 'vitest';
import { filterByCategories, poisToFeatureCollection, sortByDistance } from './poiGeoJson';
import type { Poi } from '@/lib/poi/types';

const mk = (id: string, category: Poi['category'], lon = -95.37, lat = 29.76): Poi => ({
  id,
  source: 'osm',
  category,
  name: id,
  lat,
  lon,
});

describe('poisToFeatureCollection', () => {
  it('membuat FeatureCollection dengan koordinat [lon, lat]', () => {
    const fc = poisToFeatureCollection([mk('a', 'police', -95.37, 29.76)]);
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].geometry.coordinates).toEqual([-95.37, 29.76]);
  });

  it('properti membawa id, nama, kategori, warna', () => {
    const p = { ...mk('a', 'hospital'), name: 'RS X', address: 'Jl. A', phone: '110' };
    const props = poisToFeatureCollection([p]).features[0].properties!;
    expect(props.id).toBe('a');
    expect(props.name).toBe('RS X');
    expect(props.category).toBe('hospital');
    expect(props.color).toMatch(/^#/);
    expect(props.address).toBe('Jl. A');
    expect(props.phone).toBe('110');
  });

  it('membawa distanceMeters dari NearbyPoi', () => {
    const fc = poisToFeatureCollection([{ ...mk('a', 'police'), distanceMeters: 1234 } as never]);
    expect(fc.features[0].properties!.distanceMeters).toBe(1234);
  });

  it('array kosong -> features kosong', () => {
    expect(poisToFeatureCollection([]).features).toEqual([]);
  });
});

describe('filterByCategories', () => {
  const pois = [mk('a', 'police'), mk('b', 'hospital'), mk('c', 'police')];

  it('null/kosong -> semua', () => {
    expect(filterByCategories(pois, null)).toHaveLength(3);
    expect(filterByCategories(pois, [])).toHaveLength(3);
  });
  it('filter satu kategori', () => {
    const out = filterByCategories(pois, ['police']);
    expect(out.map((p) => p.id)).toEqual(['a', 'c']);
  });
  it('filter banyak kategori', () => {
    const out = filterByCategories(pois, ['police', 'hospital']);
    expect(out).toHaveLength(3);
  });
  it('kategori tak ada -> kosong', () => {
    expect(filterByCategories(pois, ['shelter'])).toEqual([]);
  });
});

describe('sortByDistance', () => {
  it('urut terdekat', () => {
    const out = sortByDistance([
      { id: 'b', distanceMeters: 500 },
      { id: 'a', distanceMeters: 100 },
    ]);
    expect(out.map((p) => p.id)).toEqual(['a', 'b']);
  });
  it('undefined di akhir', () => {
    const out = sortByDistance([{ id: 'x' }, { id: 'a', distanceMeters: 1 }]);
    expect(out[0].id).toBe('a');
  });
});
