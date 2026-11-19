import { describe, it, expect } from 'vitest';
import {
  CATEGORY_ORDER,
  CATEGORY_STYLES,
  categoryColor,
  categoryLabel,
  centerForCity,
  DEFAULT_CENTER,
  MAP_ATTRIBUTION,
  MAP_STYLE_URL,
  PILOT_CENTERS,
} from './config';

describe('konfigurasi peta', () => {
  it('style OpenFreeMap liberty', () => {
    expect(MAP_STYLE_URL).toBe('https://tiles.openfreemap.org/styles/liberty');
  });

  it('atribusi memuat OSM + OpenFreeMap', () => {
    expect(MAP_ATTRIBUTION).toContain('OpenStreetMap');
    expect(MAP_ATTRIBUTION).toContain('ODbL');
    expect(MAP_ATTRIBUTION).toContain('OpenFreeMap');
  });

  it('6 kategori lengkap & unik', () => {
    expect(CATEGORY_ORDER).toHaveLength(6);
    expect(new Set(CATEGORY_ORDER).size).toBe(6);
    expect(CATEGORY_STYLES.map((c) => c.category)).toEqual([
      'police',
      'hospital',
      'fire',
      'courthouse',
      'embassy',
      'shelter',
    ]);
  });

  it('warna kategori unik', () => {
    const colors = CATEGORY_STYLES.map((c) => c.color);
    expect(new Set(colors).size).toBe(colors.length);
    for (const c of colors) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('label id/en', () => {
    expect(categoryLabel('police', 'id')).toBe('Polisi');
    expect(categoryLabel('police', 'en')).toBe('Police');
    expect(categoryLabel('hospital', 'id')).toContain('RS');
  });

  it('categoryColor konsisten dengan daftar', () => {
    for (const s of CATEGORY_STYLES) expect(categoryColor(s.category)).toBe(s.color);
  });

  it('centerForCity dikenali', () => {
    expect(centerForCity('Jakarta').lat).toBeCloseTo(-6.2088, 4);
    expect(centerForCity('Surabaya').lon).toBeCloseTo(112.7521, 4);
  });

  it('centerForCity tak dikenali -> default Houston', () => {
    expect(centerForCity('Mars')).toEqual(DEFAULT_CENTER);
    expect(centerForCity(undefined)).toEqual(DEFAULT_CENTER);
  });

  it('PILOT_CENTERS berisi Houston', () => {
    expect(PILOT_CENTERS['Houston, TX']).toBeDefined();
  });
});
