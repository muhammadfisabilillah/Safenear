import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IncidentReport } from '@/lib/poi/types';
import {
  attachPdfHash,
  createReport,
  deleteReport,
  getReport,
  listReports,
  saveReport,
} from './store';

const { reportsStore, resetDb } = vi.hoisted(() => {
  const db = new Map<string, unknown>();
  return {
    reportsStore: {
      put: async (r: { id: string }) => void db.set(r.id, r),
      get: async (id: string) => db.get(id),
      getAll: async () => [...db.values()],
      delete: async (id: string) => void db.delete(id),
      clear: async () => db.clear(),
    },
    resetDb: () => db.clear(),
  };
});

vi.mock('@/lib/prefs/store', () => ({ reportsStore }));

const input = {
  category: 'police' as const,
  occurredAt: '2026-11-19T10:00:00.000Z',
  location: { lat: 29.7604, lon: -95.3698, address: 'X' },
  description: 'Dihina',
};

describe('createReport', () => {
  it('membuat id unik + timestamp', () => {
    const a = createReport(input);
    const b = createReport(input);
    expect(a.id).not.toBe(b.id);
    expect(a.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(a.evidence).toEqual([]);
  });

  it('occurredAt kosong -> pakai now', () => {
    const r = createReport({ ...input, occurredAt: '' });
    expect(r.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('deskripsi kosong -> error', () => {
    expect(() => createReport({ ...input, description: '' })).toThrow();
  });

  it('kategori invalid -> error', () => {
    expect(() => createReport({ ...input, category: 'x' as never })).toThrow();
  });

  it('witnesses kosong tidak disimpan sebagai array kosong', () => {
    const r = createReport({ ...input, witnesses: [] });
    expect(r.witnesses).toBeUndefined();
  });
});

describe('save/get/list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDb();
  });

  it('save lalu get mengembalikan laporan', async () => {
    const r = createReport(input);
    await saveReport(r);
    const got = await getReport(r.id);
    expect(got?.id).toBe(r.id);
  });

  it('get id tidak ada -> undefined', async () => {
    expect(await getReport('nope')).toBeUndefined();
  });

  it('list urut dibuat terbaru', async () => {
    const a: IncidentReport = {
      ...createReport(input),
      id: 'a',
      createdAt: '2026-11-19T10:00:00.000Z',
    };
    const b: IncidentReport = {
      ...createReport(input),
      id: 'b',
      createdAt: '2026-11-19T11:00:00.000Z',
    };
    await saveReport(a);
    await saveReport(b);
    const list = await listReports();
    expect(list[0].id).toBe('b');
  });

  it('delete menghapus', async () => {
    const r = createReport(input);
    await saveReport(r);
    await deleteReport(r.id);
    expect(await getReport(r.id)).toBeUndefined();
  });
});

describe('attachPdfHash', () => {
  it('menempelkan hash', async () => {
    const r = createReport(input);
    await saveReport(r);
    await attachPdfHash(r.id, 'abc');
    expect((await getReport(r.id))?.pdfHash).toBe('abc');
  });
  it('laporan tidak ada -> error', async () => {
    await expect(attachPdfHash('nope', 'abc')).rejects.toThrow(/tidak ditemukan/);
  });
});
