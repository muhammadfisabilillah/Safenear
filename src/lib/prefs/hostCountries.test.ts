import { describe, it, expect } from 'vitest';
import {
  HOST_COUNTRIES,
  PILOT_CITIES,
  bundleIdFromCity,
  citiesForHost,
  findCityLabel,
  hostCountryLabel,
} from './hostCountries';

describe('HOST_COUNTRIES', () => {
  it('memuat US & ID (pilot)', () => {
    const isos = HOST_COUNTRIES.map((c) => c.iso);
    expect(isos).toContain('US');
    expect(isos).toContain('ID');
  });
  it('iso unik 2 huruf', () => {
    const isos = HOST_COUNTRIES.map((c) => c.iso);
    expect(new Set(isos).size).toBe(isos.length);
    for (const i of isos) expect(i).toMatch(/^[A-Z]{2}$/);
  });
});

describe('PILOT_CITIES', () => {
  it('Houston punya bundle US-houston', () => {
    const houston = PILOT_CITIES.US[0];
    expect(houston.bundleId).toBe('US-houston');
    expect(houston.hasBundle).toBe(true);
  });
  it('kota ID belum punya bundle', () => {
    for (const c of PILOT_CITIES.ID) expect(c.hasBundle).toBe(false);
  });
  it('bundleId unik', () => {
    const ids = Object.values(PILOT_CITIES)
      .flat()
      .map((c) => c.bundleId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('bundleIdFromCity', () => {
  it('US + Houston, TX -> US-houston', () => {
    expect(bundleIdFromCity('US', 'Houston, TX')).toBe('US-houston');
  });
  it('ID + Jakarta -> ID-jakarta', () => {
    expect(bundleIdFromCity('ID', 'Jakarta')).toBe('ID-jakarta');
  });
  it('tanpa city -> null', () => {
    expect(bundleIdFromCity('US', undefined)).toBeNull();
  });
  it('kota tak dikenal -> null', () => {
    expect(bundleIdFromCity('US', 'Mars')).toBeNull();
  });
});

describe('citiesForHost / hostCountryLabel / findCityLabel', () => {
  it('citiesForHost', () => {
    expect(citiesForHost('US')).toHaveLength(1);
    expect(citiesForHost('XX')).toEqual([]);
  });
  it('hostCountryLabel', () => {
    expect(hostCountryLabel('US')).toBe('United States');
    expect(hostCountryLabel('ZZ')).toBe('ZZ');
  });
  it('findCityLabel', () => {
    expect(findCityLabel('US', 'Houston, TX')).toBe('Houston, TX');
    expect(findCityLabel('US', 'Mars')).toBe('Mars');
    expect(findCityLabel(undefined, 'Mars')).toBe('');
  });
});
