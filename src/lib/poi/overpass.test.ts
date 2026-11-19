import { describe, it, expect, vi } from 'vitest';
import { createOverpassClient, OVERPASS_ENDPOINTS } from './overpass';

const ELEMENT = {
  type: 'node' as const,
  id: 1,
  lat: 29.7604,
  lon: -95.3698,
  tags: { amenity: 'police', name: 'Central Police' },
};

function okResponse(elements: unknown[]): Response {
  return { ok: true, status: 200, json: async () => ({ elements }) } as unknown as Response;
}

describe('OverpassClient', () => {
  it('queryCategory mengirim query yang benar & menormalkan', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse([ELEMENT]));
    const client = createOverpassClient({
      fetchImpl: fetchImpl as never,
      endpoints: ['https://overpass.test'],
      sleepMs: 0,
    });
    const pois = await client.queryCategory('police', 29.7604, -95.3698, 6000);
    expect(pois).toHaveLength(1);
    expect(pois[0]).toMatchObject({ category: 'police', name: 'Central Police', id: 'osm:node/1' });

    const call = fetchImpl.mock.calls[0];
    expect(call[0]).toBe('https://overpass.test');
    const body = new URLSearchParams(call[1].body as string).get('data') as string;
    expect(body).toContain('amenity');
    expect(body).toContain('police');
    expect(body).toContain('around:6000');
    expect(call[1].headers['User-Agent']).toBeTruthy();
  });

  it('fallback ke endpoint lain bila yang pertama gagal', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(okResponse([ELEMENT]));
    const client = createOverpassClient({
      fetchImpl: fetchImpl as never,
      endpoints: ['https://a.test', 'https://b.test'],
      sleepMs: 0,
    });
    const pois = await client.queryCategory('police', 0, 0, 1000);
    expect(pois).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('semua endpoint gagal -> error jelas', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('down'));
    const client = createOverpassClient({
      fetchImpl: fetchImpl as never,
      endpoints: ['https://a.test'],
      sleepMs: 0,
    });
    await expect(client.queryCategory('police', 0, 0, 1000)).rejects.toThrow(/Semua endpoint/);
  });

  it('queryCategories berurutan dengan jeda', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse([ELEMENT]));
    const client = createOverpassClient({
      fetchImpl: fetchImpl as never,
      endpoints: ['https://a.test'],
      sleepMs: 5,
    });
    const pois = await client.queryCategories(['police', 'hospital'], 0, 0, 1000);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(pois).toHaveLength(2);
  });

  it('abort menghentikan loop kategori', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse([ELEMENT]));
    const client = createOverpassClient({
      fetchImpl: fetchImpl as never,
      endpoints: ['https://a.test'],
      sleepMs: 0,
    });
    const controller = new AbortController();
    controller.abort();
    const pois = await client.queryCategories(
      ['police', 'hospital'],
      0,
      0,
      1000,
      controller.signal,
    );
    expect(pois).toHaveLength(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('OVERPASS_ENDPOINTS terisi', () => {
    expect(OVERPASS_ENDPOINTS.length).toBeGreaterThanOrEqual(2);
  });
});
