import { describe, it, expect } from 'vitest';
import {
  buildAddress,
  dedupeById,
  detectCategory,
  normalizeElements,
  normalizeOsm,
  normalizePhone,
} from './normalize';
import type { OverpassElement } from './types';

describe('detectCategory', () => {
  it('memetakan tag amenity ke kategori', () => {
    expect(detectCategory({ amenity: 'police' })).toBe('police');
    expect(detectCategory({ amenity: 'hospital' })).toBe('hospital');
    expect(detectCategory({ amenity: 'fire_station' })).toBe('fire');
    expect(detectCategory({ amenity: 'courthouse' })).toBe('courthouse');
    expect(detectCategory({ amenity: 'shelter' })).toBe('shelter');
    expect(detectCategory({ amenity: 'embassy' })).toBe('embassy');
  });

  it('mendukung office=diplomatic sebagai embassy', () => {
    expect(detectCategory({ office: 'diplomatic' })).toBe('embassy');
  });

  it('mengembalikan null untuk tag tak dikenal / kosong', () => {
    expect(detectCategory(undefined)).toBeNull();
    expect(detectCategory({})).toBeNull();
    expect(detectCategory({ amenity: 'cafe' })).toBeNull();
  });
});

describe('buildAddress', () => {
  it('menyusun alamat dari addr:* ', () => {
    const tags = {
      'addr:housenumber': '1200',
      'addr:street': 'Travis St',
      'addr:city': 'Houston',
      'addr:state': 'TX',
      'addr:postcode': '77002',
    };
    expect(buildAddress(tags)).toBe('1200 Travis St, Houston, 77002, TX');
  });

  it('mengembalikan undefined bila tak ada tag alamat', () => {
    expect(buildAddress(undefined)).toBeUndefined();
    expect(buildAddress({})).toBeUndefined();
  });

  it('hanya merangkai bagian yang ada', () => {
    expect(buildAddress({ 'addr:street': 'Main St' })).toBe('Main St');
  });
});

describe('normalizePhone', () => {
  it('membuang karakter tak valid tapi mempertahankan +', () => {
    expect(normalizePhone('+1 (713) 884-3131')).toBe('+1 (713) 884-3131');
    expect(normalizePhone('abc +62 812 9007')).toBe('+62 812 9007');
  });

  it('mengembalikan undefined untuk input kosong', () => {
    expect(normalizePhone(undefined)).toBeUndefined();
    expect(normalizePhone('')).toBeUndefined();
  });
});

describe('normalizeOsm', () => {
  const base: OverpassElement = {
    type: 'node',
    id: 123,
    lat: 29.7604,
    lon: -95.3698,
    tags: {
      amenity: 'police',
      name: 'Houston Police Department - Central',
      phone: '+1-713-884-3131',
    },
  };

  it('menghasilkan Poi lengkap dengan id & sourceUrl OSM', () => {
    const poi = normalizeOsm(base, 'police');
    expect(poi.id).toBe('osm:node/123');
    expect(poi.source).toBe('osm');
    expect(poi.name).toBe('Houston Police Department - Central');
    expect(poi.lat).toBe(29.7604);
    expect(poi.lon).toBe(-95.3698);
    expect(poi.phone).toBe('+1-713-884-3131');
    expect(poi.sourceUrl).toBe('https://www.openstreetmap.org/node/123');
    expect(poi.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('pakai center untuk way/relation', () => {
    const way: OverpassElement = {
      type: 'way',
      id: 9,
      center: { lat: 29.7, lon: -95.3 },
      tags: { amenity: 'hospital', name: 'RS' },
    };
    const poi = normalizeOsm(way, 'hospital');
    expect(poi.lat).toBe(29.7);
    expect(poi.lon).toBe(-95.3);
    expect(poi.id).toBe('osm:way/9');
  });

  it('melempar error bila koordinat tidak ada', () => {
    const noCoord: OverpassElement = { type: 'node', id: 1, tags: {} };
    expect(() => normalizeOsm(noCoord, 'police')).toThrow(/koordinat/);
  });

  it('nama kosong -> "(tanpa nama)"', () => {
    const noName: OverpassElement = {
      type: 'node',
      id: 2,
      lat: 1,
      lon: 1,
      tags: { amenity: 'police' },
    };
    expect(normalizeOsm(noName, 'police').name).toBe('(tanpa nama)');
  });

  it('mengisi nationality untuk embassy ber-tag country', () => {
    const emb: OverpassElement = {
      type: 'node',
      id: 5,
      lat: 29.7,
      lon: -95.4,
      tags: { office: 'diplomatic', country: 'ID', name: 'KJRI Houston' },
    };
    const poi = normalizeOsm(emb, 'embassy');
    expect(poi.nationality).toBe('ID');
  });
});

describe('normalizeElements', () => {
  it('membuang elemen tanpa koordinat tanpa menggagalkan batch', () => {
    const els: OverpassElement[] = [
      { type: 'node', id: 1, lat: 1, lon: 1, tags: { amenity: 'police', name: 'A' } },
      { type: 'node', id: 2, tags: { amenity: 'police' } },
      { type: 'way', id: 3, center: { lat: 2, lon: 2 }, tags: { amenity: 'police', name: 'B' } },
    ];
    const out = normalizeElements(els, 'police');
    expect(out).toHaveLength(2);
    expect(out.map((p) => p.id)).toEqual(['osm:node/1', 'osm:way/3']);
  });
});

describe('dedupeById', () => {
  it('membuang duplikat berdasarkan id', () => {
    const mk = (id: string) =>
      ({ id, source: 'osm' as const, category: 'police' as const, name: id, lat: 0, lon: 0 });
    const out = dedupeById([mk('a'), mk('b'), mk('a')]);
    expect(out.map((p) => p.id)).toEqual(['a', 'b']);
  });
});