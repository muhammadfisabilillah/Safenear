import { describe, it, expect } from 'vitest';
import { buildReportContent, reportContentToPlainText, summarizeReport } from './content';
import type { IncidentReport } from '@/lib/poi/types';

const report: IncidentReport = {
  id: 'r-1',
  category: 'police',
  occurredAt: '2026-11-19T10:00:00.000Z',
  createdAt: '2026-11-19T11:00:00.000Z',
  location: { lat: 29.7604, lon: -95.3698, address: '1200 Travis St', label: 'Downtown' },
  description: 'Dihina orang asing di halte.',
  witnesses: [{ name: 'Budi', contact: '+62 812' }],
  evidence: [
    {
      id: 'e1',
      kind: 'photo',
      name: 'foto-1.jpg',
      size: 1024,
      createdAt: '2026-11-19T11:00:00.000Z',
      storageKey: 'ev/e1',
    },
  ],
};

describe('buildReportContent', () => {
  it('memuat judul EN + ID', () => {
    const c = buildReportContent(report);
    expect(c.docTitleId).toBe('Laporan Insiden');
    expect(c.docTitleEn).toBe('Incident Report');
  });

  it('hash ikut tercetak bila ada', () => {
    const c = buildReportContent(report, 'abc123');
    expect(c.hash).toBe('abc123');
  });

  it('sections berisi kronologi, lokasi, deskripsi, saksi, bukti', () => {
    const c = buildReportContent(report);
    const keys = c.sections.map((s) => s.key);
    expect(keys).toEqual(['chronology', 'location', 'description', 'witnesses', 'evidence']);
  });

  it('lokasi memuat koordinat + alamat + label', () => {
    const c = buildReportContent(report);
    const loc = c.sections.find((s) => s.key === 'location')!;
    expect(loc.lines.join('\n')).toContain('29.760400');
    expect(loc.lines.join('\n')).toContain('1200 Travis St');
    expect(loc.lines.join('\n')).toContain('Downtown');
  });

  it('saksi terdaftar dengan kontak', () => {
    const c = buildReportContent(report);
    const w = c.sections.find((s) => s.key === 'witnesses')!;
    expect(w.lines.join('\n')).toContain('Budi');
    expect(w.lines.join('\n')).toContain('+62 812');
  });

  it('bukti menandai "tidak dikirim"', () => {
    const c = buildReportContent(report);
    const ev = c.sections.find((s) => s.key === 'evidence')!;
    expect(ev.lines.join('\n')).toContain('tidak dikirim');
  });

  it('tanpa saksi -> section saksi tidak ada', () => {
    const c = buildReportContent({ ...report, witnesses: [] });
    expect(c.sections.map((s) => s.key)).not.toContain('witnesses');
  });

  it('tanpa bukti -> pesan "tidak ada bukti"', () => {
    const c = buildReportContent({ ...report, evidence: [] });
    const ev = c.sections.find((s) => s.key === 'evidence')!;
    expect(ev.lines.join('\n')).toContain('tidak ada bukti');
  });

  it('disclaimer EN & ID ada', () => {
    const c = buildReportContent(report);
    expect(c.disclaimerId).toContain('nasihat hukum');
    expect(c.disclaimerEn).toContain('Not legal advice');
  });
});

describe('reportContentToPlainText', () => {
  it('berisi judul, id, hash, dan disclaimer', () => {
    const text = reportContentToPlainText(buildReportContent(report, 'deadbeef'));
    expect(text).toContain('Laporan Insiden / Incident Report');
    expect(text).toContain('r-1');
    expect(text).toContain('deadbeef');
    expect(text).toContain('nasihat hukum');
  });
});

describe('summarizeReport', () => {
  it('ringkas berisi kategori & label', () => {
    expect(summarizeReport(report)).toContain('police');
    expect(summarizeReport(report)).toContain('Downtown');
  });
  it('tanpa label -> koordinat', () => {
    const s = summarizeReport({ ...report, location: { lat: 1, lon: 2 } });
    expect(s).toContain('1.000000');
  });
});
