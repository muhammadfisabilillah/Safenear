import { describe, it, expect } from 'vitest';
import { buildMapsSearchUrl, buildNavigationUrl, describeTarget, isTravelMode } from './mapsUrl';

describe('buildNavigationUrl', () => {
  it('URL dasar dengan api=1, destination, travelmode, dir_action', () => {
    const url = buildNavigationUrl({ lat: 29.7604, lon: -95.3698 });
    expect(url.startsWith('https://www.google.com/maps/dir/?')).toBe(true);
    const q = new URL(url).searchParams;
    expect(q.get('api')).toBe('1');
    expect(q.get('destination')).toBe('29.7604,-95.3698');
    expect(q.get('travelmode')).toBe('walking');
    expect(q.get('dir_action')).toBe('navigate');
  });

  it('travelmode driving', () => {
    const url = buildNavigationUrl({ lat: 1, lon: 1 }, { travelMode: 'driving' });
    expect(new URL(url).searchParams.get('travelmode')).toBe('driving');
  });

  it('dir_action leave', () => {
    const url = buildNavigationUrl({ lat: 1, lon: 1 }, { dirAction: 'leave' });
    expect(new URL(url).searchParams.get('dir_action')).toBe('leave');
  });

  it('tanpa API key di URL', () => {
    const url = buildNavigationUrl({ lat: 29.7, lon: -95.3 });
    expect(url).not.toContain('key=');
  });

  it('melempar error untuk koordinat tidak valid', () => {
    expect(() => buildNavigationUrl({ lat: 91, lon: 0 })).toThrow(/koordinat/i);
    expect(() => buildNavigationUrl({ lat: 0, lon: 200 })).toThrow(/koordinat/i);
    expect(() => buildNavigationUrl({ lat: NaN, lon: 0 })).toThrow(/koordinat/i);
  });

  it('travelmode tak valid -> error', () => {
    expect(() =>
      buildNavigationUrl({ lat: 1, lon: 1 }, { travelMode: 'teleport' as never }),
    ).toThrow(/travelmode/i);
  });
});

describe('buildMapsSearchUrl', () => {
  it('membungkus query dengan api=1', () => {
    const url = buildMapsSearchUrl('Hospital near Houston');
    const q = new URL(url).searchParams;
    expect(q.get('api')).toBe('1');
    expect(q.get('query')).toBe('Hospital near Houston');
  });

  it('query kosong/whitespace -> error', () => {
    expect(() => buildMapsSearchUrl('')).toThrow(/Query/);
    expect(() => buildMapsSearchUrl('   ')).toThrow(/Query/);
  });
});

describe('isTravelMode', () => {
  it('menerima 4 mode resmi', () => {
    expect(isTravelMode('driving')).toBe(true);
    expect(isTravelMode('walking')).toBe(true);
    expect(isTravelMode('bicycling')).toBe(true);
    expect(isTravelMode('transit')).toBe(true);
  });
  it('menolak lainnya', () => {
    expect(isTravelMode('flying')).toBe(false);
    expect(isTravelMode('')).toBe(false);
  });
});

describe('describeTarget', () => {
  it('pakai nama bila ada', () => {
    expect(describeTarget({ lat: 29.7604, lon: -95.3698, name: 'RS Houston' })).toContain(
      'RS Houston',
    );
  });
  it('tanpa nama -> koordinat 5 desimal', () => {
    expect(describeTarget({ lat: 29.7604, lon: -95.3698 })).toBe('29.76040, -95.36980');
  });
});
