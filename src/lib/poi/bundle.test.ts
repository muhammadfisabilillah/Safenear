import { describe, it, expect, vi } from 'vitest';
import {
  bundleAttributionLines,
  bundleFileName,
  bundleIdFor,
  bundleSizeBytes,
  bundleUrl,
  fetchBundle,
} from './bundle';
import bundleJson from '../../../data/bundles/US-houston.json';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('bundleIdFor', () => {
  it('negara + kota -> slug', () => {
    expect(bundleIdFor('US', 'Houston, TX')).toBe('US-houston-tx');
    expect(bundleIdFor('ID', 'Kuala Lumpur')).toBe('ID-kuala-lumpur');
  });
  it('tanpa kota -> hanya negara', () => {
    expect(bundleIdFor('US')).toBe('US');
  });
  it('negara kosong -> null', () => {
    expect(bundleIdFor('  ')).toBeNull();
    expect(bundleIdFor('')).toBeNull();
  });
});

describe('bundleFileName / bundleUrl', () => {
  it('nama file + URL', () => {
    expect(bundleFileName('US-houston')).toBe('US-houston.json');
    expect(bundleUrl('US-houston')).toBe('/bundles/US-houston.json');
  });
});

describe('fetchBundle', () => {
  it('mengambil & memvalidasi bundle', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(bundleJson));
    const b = await fetchBundle('US-houston', { fetchImpl: fetchImpl as never });
    expect(b.id).toBe('US-houston');
    expect(b.pois.length).toBeGreaterThan(0);
    expect(fetchImpl).toHaveBeenCalledWith(
      '/bundles/US-houston.json',
      expect.objectContaining({ headers: expect.anything() }),
    );
  });

  it('base kustom dipakai', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(bundleJson));
    await fetchBundle('US-houston', { fetchImpl: fetchImpl as never, base: 'https://cdn.x/' });
    expect(fetchImpl).toHaveBeenCalledWith('https://cdn.x/US-houston.json', expect.anything());
  });

  it('HTTP 404 -> error ramah', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, false, 404));
    await expect(fetchBundle('XX-none', { fetchImpl: fetchImpl as never })).rejects.toThrow(
      /tidak tersedia/,
    );
  });

  it('network error -> error ramah', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchBundle('US-houston', { fetchImpl: fetchImpl as never })).rejects.toThrow(
      /Gagal menghubungi/,
    );
  });

  it('JSON invalid -> error "tidak valid"', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ foo: 'bar' }));
    await expect(fetchBundle('US-houston', { fetchImpl: fetchImpl as never })).rejects.toThrow(
      /tidak valid/,
    );
  });
});

describe('bundleSizeBytes', () => {
  it('pakai sizeBytes bila ada', () => {
    const b = { ...(bundleJson as object), sizeBytes: 1234 } as never;
    expect(bundleSizeBytes(b)).toBe(1234);
  });
  it('fallback hitung dari JSON', () => {
    const b = bundleJson as never;
    expect(bundleSizeBytes(b)).toBeGreaterThan(0);
  });
});

describe('bundleAttributionLines', () => {
  it('kembalikan semua nilai string attribution', () => {
    const b = bundleJson as never;
    const lines = bundleAttributionLines(b);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((l) => l.includes('OpenStreetMap'))).toBe(true);
  });
});
