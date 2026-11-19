import { describe, it, expect, vi } from 'vitest';
import { geoErrorMessage, getCurrentPosition } from './geolocation';

function position(lat: number, lon: number, accuracy = 10): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lon,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as GeolocationPosition;
}

describe('geoErrorMessage', () => {
  it('kode 1/2/3 -> pesan ID', () => {
    expect(geoErrorMessage(1)).toContain('ditolak');
    expect(geoErrorMessage(2)).toContain('tidak tersedia');
    expect(geoErrorMessage(3)).toContain('habis');
  });
  it('kode lain -> generik', () => {
    expect(geoErrorMessage(99)).toContain('Gagal');
  });
});

describe('getCurrentPosition', () => {
  it('resolve posisi valid', async () => {
    const geo = {
      getCurrentPosition: vi.fn((ok) => ok(position(29.76, -95.37, 25))),
    } as unknown as Geolocation;
    const p = await getCurrentPosition({ geolocation: geo, timeoutMs: 100 });
    expect(p.lat).toBe(29.76);
    expect(p.lon).toBe(-95.37);
    expect(p.accuracy).toBe(25);
  });

  it('menolak bila geolocation tidak ada', async () => {
    await expect(getCurrentPosition({ geolocation: undefined })).rejects.toThrow(/tidak didukung/);
  });

  it('menolak PermissionError (code 1)', async () => {
    const geo = {
      getCurrentPosition: vi.fn((_ok, err) => err({ code: 1 })),
    } as unknown as Geolocation;
    await expect(getCurrentPosition({ geolocation: geo })).rejects.toThrow(/ditolak/);
  });

  it('menolak koordinat tidak valid', async () => {
    const geo = {
      getCurrentPosition: vi.fn((ok) => ok(position(200, 500))),
    } as unknown as Geolocation;
    await expect(getCurrentPosition({ geolocation: geo })).rejects.toThrow(/tidak valid/);
  });

  it('meneruskan opsi timeout & maximumAge', async () => {
    const geo = {
      getCurrentPosition: vi.fn((_ok, _err, opts) => {
        expect(opts.timeout).toBe(1234);
        expect(opts.maximumAge).toBe(5678);
        return _ok(position(1, 1));
      }),
    } as unknown as Geolocation;
    await getCurrentPosition({ geolocation: geo, timeoutMs: 1234, maximumAgeMs: 5678 });
  });
});
