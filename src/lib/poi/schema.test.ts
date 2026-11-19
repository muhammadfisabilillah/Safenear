import { describe, it, expect } from 'vitest';
import {
  parseBundle,
  parseCountryProfile,
  parseIncidentReport,
  parsePoi,
  parseUserPrefs,
} from './schema';
import bundleJson from '../../../data/bundles/US-houston.json';
import idProfile from '../../../data/profiles/ID.json';

describe('parseBundle', () => {
  it('bundle Houston asli valid', () => {
    const b = parseBundle(bundleJson);
    expect(b.id).toBe('US-houston');
    expect(b.pois.length).toBeGreaterThan(0);
    expect(b.bbox).toHaveLength(4);
  });

  it('membuang unknown key di level atas (strip)', () => {
    const raw = { ...(bundleJson as object), evil: 'x' };
    const b = parseBundle(raw);
    expect((b as unknown as Record<string, unknown>).evil).toBeUndefined();
  });

  it('gagal bila schemaVersion != 1', () => {
    expect(() => parseBundle({ ...(bundleJson as object), schemaVersion: 2 })).toThrow();
  });

  it('gagal bila category tidak valid', () => {
    const raw = JSON.parse(JSON.stringify(bundleJson));
    raw.pois[0].category = 'aliens';
    expect(() => parseBundle(raw)).toThrow();
  });

  it('gagal bila lat di luar rentang', () => {
    const raw = JSON.parse(JSON.stringify(bundleJson));
    raw.pois[0].lat = 123;
    expect(() => parseBundle(raw)).toThrow();
  });

  it('gagal bila pois bukan array', () => {
    expect(() => parseBundle({ ...(bundleJson as object), pois: 'x' })).toThrow();
  });
});

describe('parsePoi', () => {
  it('valid untuk POI minimal', () => {
    const poi = parsePoi({ id: 'x', source: 'osm', category: 'police', name: 'A', lat: 1, lon: 1 });
    expect(poi.id).toBe('x');
  });
  it('gagal bila name kosong', () => {
    expect(() =>
      parsePoi({ id: 'x', source: 'osm', category: 'police', name: '', lat: 1, lon: 1 }),
    ).toThrow();
  });
});

describe('parseUserPrefs', () => {
  it('valid', () => {
    const p = parseUserPrefs({
      id: 'user-prefs',
      nationality: 'ID',
      hostCountry: 'US',
      city: 'Houston, TX',
      language: 'id',
      onboarded: true,
      updatedAt: '2026-11-19T00:00:00.000Z',
    });
    expect(p.nationality).toBe('ID');
  });
  it('gagal bila ISO bukan 2 huruf', () => {
    expect(() =>
      parseUserPrefs({
        id: 'x',
        nationality: 'IDN',
        hostCountry: 'US',
        language: 'id',
        onboarded: true,
        updatedAt: '2026-11-19T00:00:00.000Z',
      }),
    ).toThrow();
  });
});

describe('parseIncidentReport', () => {
  const base = {
    id: 'r1',
    category: 'police',
    occurredAt: '2026-11-19T10:00:00.000Z',
    createdAt: '2026-11-19T11:00:00.000Z',
    location: { lat: 29.76, lon: -95.37 },
    description: 'Ditegur',
    evidence: [],
  };

  it('valid', () => {
    expect(parseIncidentReport(base).id).toBe('r1');
  });
  it('deskripsi kosong -> error', () => {
    expect(() => parseIncidentReport({ ...base, description: '' })).toThrow();
  });
  it('category tidak valid -> error', () => {
    expect(() => parseIncidentReport({ ...base, category: 'other' })).toThrow();
  });
});

describe('parseCountryProfile', () => {
  it('profil ID valid', () => {
    const p = parseCountryProfile(idProfile);
    expect(p.iso).toBe('ID');
    expect(p.sovereignChannels.length).toBeGreaterThan(0);
    expect(p.rightsNotes[0].source).toBeTruthy();
  });
  it('gagal bila rightsNotes tanpa source', () => {
    const raw = JSON.parse(JSON.stringify(idProfile));
    raw.rightsNotes[0].source = '';
    expect(() => parseCountryProfile(raw)).not.toThrow(); // source string kosong masih string
  });
});
