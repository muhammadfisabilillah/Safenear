import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportDetail } from './ReportDetail';
import type { IncidentReport } from '@/lib/poi/types';

const { attachHash, deleteReport, rendered } = vi.hoisted(() => ({
  attachHash: vi.fn(async () => undefined),
  deleteReport: vi.fn(async () => undefined),
  rendered: vi.fn(async () => ({
    blob: new Blob(['%PDF-'], { type: 'application/pdf' }),
    hash: 'abc123',
  })),
}));

vi.mock('@/lib/report/pdf', () => ({ renderReportPdfBrowser: rendered }));
vi.mock('@/lib/report/store', () => ({
  attachPdfHash: attachHash,
  deleteReport: deleteReport,
}));

const report: IncidentReport = {
  id: 'r-1',
  category: 'police',
  occurredAt: '2026-11-19T10:00:00.000Z',
  createdAt: '2026-11-19T11:00:00.000Z',
  location: { lat: 29.7604, lon: -95.3698, address: 'X' },
  description: 'Dihina di halte',
  witnesses: [{ name: 'Budi', contact: '+62 812' }],
  evidence: [],
};

describe('ReportDetail', () => {
  it('menampilkan ringkasan, deskripsi, saksi, hash', () => {
    render(<ReportDetail report={{ ...report, pdfHash: 'abc123' }} onDeleted={vi.fn()} />);
    expect(screen.getByText(/Dihina di halte/)).toBeTruthy();
    expect(screen.getByText(/Budi/)).toBeTruthy();
    expect(screen.getAllByText(/abc123/).length).toBeGreaterThan(0);
  });

  it('export PDF memanggil renderReportPdf + attachPdfHash', async () => {
    render(<ReportDetail report={report} onDeleted={vi.fn()} />);
    fireEvent.click(screen.getAllByText(/reportDetail\.exportPdf/)[0]);
    await waitFor(() => expect(rendered).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(attachHash).toHaveBeenCalledWith('r-1', 'abc123'));
  });

  it('hapus -> konfirmasi -> deleteReport + onDeleted', async () => {
    const onDeleted = vi.fn();
    render(<ReportDetail report={report} onDeleted={onDeleted} />);
    fireEvent.click(screen.getAllByText(/reportDetail\.delete/)[0]);
    const confirm = await screen.findByText(/common\.confirmDelete/);
    expect(confirm).toBeTruthy();
    fireEvent.click(screen.getAllByText(/^common\.delete$/)[0]);
    await waitFor(() => expect(deleteReport).toHaveBeenCalledWith('r-1'));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
  });
});
