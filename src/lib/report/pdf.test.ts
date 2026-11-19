// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderReportPdf } from './pdf';
import type { IncidentReport } from '@/lib/poi/types';

const report: IncidentReport = {
  id: 'r-pdf-1',
  category: 'police',
  occurredAt: '2026-11-19T10:00:00.000Z',
  createdAt: '2026-11-19T11:00:00.000Z',
  location: { lat: 29.7604, lon: -95.3698, address: '1200 Travis St' },
  description: 'Dihina orang asing di halte.',
  witnesses: [{ name: 'Budi', contact: '+62 812' }],
  evidence: [],
};

describe('renderReportPdf', () => {
  it('menghasilkan buffer PDF', async () => {
    const { buffer } = await renderReportPdf(report);
    const head = new TextDecoder().decode(buffer.slice(0, 5));
    expect(head).toBe('%PDF-');
  });

  it('hash konsisten dengan isi laporan', async () => {
    const a = await renderReportPdf(report);
    const b = await renderReportPdf(report);
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hash berubah bila isi berubah', async () => {
    const a = await renderReportPdf(report);
    const b = await renderReportPdf({ ...report, description: 'lain' });
    expect(a.hash).not.toBe(b.hash);
  });

  it('laporan tanpa bukti tetap render', async () => {
    const { buffer } = await renderReportPdf({ ...report, evidence: [], witnesses: [] });
    expect(new TextDecoder().decode(buffer.slice(0, 5))).toBe('%PDF-');
  });
});
