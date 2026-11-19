import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportForm } from './ReportForm';

const { saved, evidencePut } = vi.hoisted(() => {
  const saved: unknown[] = [];
  return { saved, evidencePut: vi.fn(async () => undefined) };
});

vi.mock('@/lib/prefs/store', () => ({
  evidenceStore: { put: evidencePut },
  prefsStore: {
    get: vi.fn(async () => ({
      id: 'user-prefs',
      nationality: 'ID',
      hostCountry: 'US',
      city: 'Houston, TX',
      cityBundleId: 'US-houston',
      language: 'id',
      onboarded: true,
      updatedAt: '2026-11-19T00:00:00.000Z',
    })),
  },
}));

vi.mock('@/lib/report/store', async () => {
  const actual = await vi.importActual('@/lib/report/store');
  return {
    ...actual,
    saveReport: vi.fn(async (r: unknown) => void saved.push(r)),
  };
});

function setInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('ReportForm', () => {
  beforeEach(() => {
    saved.length = 0;
    vi.clearAllMocks();
  });

  it('render semua bagian form', () => {
    render(<ReportForm onSaved={vi.fn()} />);
    expect(screen.getAllByText(/report\.category/).length).toBeGreaterThan(0);
    expect(screen.getByText(/report\.description/)).toBeTruthy();
    expect(screen.getByText(/report\.evidence/)).toBeTruthy();
  });

  it('deskripsi kosong -> error, onSaved tidak dipanggil', async () => {
    const onSaved = vi.fn();
    render(<ReportForm onSaved={onSaved} />);
    const lat = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;
    const lon = screen.getAllByRole('spinbutton')[1] as HTMLInputElement;
    setInput(lat, '29.7604');
    setInput(lon, '-95.3698');
    fireEvent.click(screen.getAllByText(/report\.submit/)[0]);
    await waitFor(() => expect(screen.getByText(/descriptionRequired/)).toBeTruthy());
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('submit valid -> onSaved dipanggil dengan id', async () => {
    const onSaved = vi.fn();
    render(<ReportForm onSaved={onSaved} />);
    const [lat, lon] = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    setInput(lat, '29.7604');
    setInput(lon, '-95.3698');
    setInput(screen.getByPlaceholderText(/descriptionPlaceholder/i), 'Dihina di halte');
    fireEvent.click(screen.getAllByText(/report\.submit/)[0]);
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(saved).toHaveLength(1);
  });
});
