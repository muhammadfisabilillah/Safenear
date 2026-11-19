import { describe, it, expect, vi } from 'vitest';
import { fetchEmergencyNumbers, parseEmergencyResponse } from './numbers';

describe('parseEmergencyResponse', () => {
  it('membaca field police/fire/ambulance/dispatch', () => {
    const n = parseEmergencyResponse('US', {
      data: { police: '911', fire: '911', ambulance: '911', dispatch: '+1-911' },
    });
    expect(n.police).toBe('911');
    expect(n.fire).toBe('911');
    expect(n.ambulance).toBe('911');
    expect(n.dispatch).toBe('+1911');
  });

  it('menormalisasi nomor', () => {
    const n = parseEmergencyResponse('ID', {
      data: { police: '110', ambulance: '(021) 568-0000' },
    });
    expect(n.police).toBe('110');
    expect(n.ambulance).toBe('0215680000');
  });

  it('nomor pendek <3 digit dibuang', () => {
    const n = parseEmergencyResponse('XX', { data: { police: '12' } });
    expect(n.police).toBeUndefined();
  });

  it('country dipaksa uppercase', () => {
    expect(parseEmergencyResponse('us', {}).country).toBe('US');
  });

  it('respon kosong tidak error', () => {
    const n = parseEmergencyResponse('US', null);
    expect(n.police).toBeUndefined();
    expect(n.source).toContain('US');
  });
});

describe('fetchEmergencyNumbers', () => {
  it('fetch + parse', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { police: '110' } }),
    });
    const n = await fetchEmergencyNumbers('ID', { fetchImpl: fetchImpl as never });
    expect(n.police).toBe('110');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://emergencynumberapi.com/api/country/ID',
      expect.anything(),
    );
  });

  it('HTTP error -> throw', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchEmergencyNumbers('ZZ', { fetchImpl: fetchImpl as never })).rejects.toThrow(
      /HTTP 404/,
    );
  });

  it('network error -> throw', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchEmergencyNumbers('ID', { fetchImpl: fetchImpl as never })).rejects.toThrow();
  });
});
