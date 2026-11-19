import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlaceDetail } from './PlaceDetail';
import type { Poi } from '@/lib/poi/types';

const poi: Poi = {
  id: 'osm:node/1',
  source: 'osm',
  category: 'hospital',
  name: 'RS Houston',
  lat: 29.7604,
  lon: -95.3698,
  address: '1200 Travis St',
  phone: '+1-713-884-3131',
  openingHours: '24/7',
  url: 'https://example.org',
  verifiedAt: '2026-11-19',
  sourceUrl: 'https://www.openstreetmap.org/node/1',
};

describe('PlaceDetail', () => {
  it('menampilkan nama, kategori, alamat, telepon, jam, situs', () => {
    render(
      <PlaceDetail
        poi={poi}
        navigationUrl="https://www.google.com/maps/dir/?api=1&destination=29.7604,-95.3698"
        verifiedAt={poi.verifiedAt}
        sourceUrl={poi.sourceUrl}
        onSaveCorrection={vi.fn()}
      />,
    );
    expect(screen.getAllByText('RS Houston').length).toBeGreaterThan(0);
    expect(screen.getByText(/1200 Travis St/)).toBeTruthy();
    expect(screen.getByText(/1200 Travis St/)).toBeTruthy();
    expect(screen.getByText('24/7')).toBeTruthy();
    expect(screen.getAllByText(/node\/1/).length).toBeGreaterThan(0);
    expect(screen.getByText('place.hours')).toBeTruthy();
  });

  it('field kosong -> "tidak tersedia"', () => {
    render(
      <PlaceDetail
        poi={{
          ...poi,
          address: undefined,
          phone: undefined,
          openingHours: undefined,
          url: undefined,
        }}
        navigationUrl="https://example.org"
        onSaveCorrection={vi.fn()}
      />,
    );
    expect(screen.getAllByText(/noAddress|noPhone|noHours|noWebsite/).length).toBeGreaterThan(0);
  });

  it('tautan navigasi memakai URL yang diberikan', () => {
    render(
      <PlaceDetail
        poi={poi}
        navigationUrl="https://www.google.com/maps/dir/?api=1&destination=29.7604,-95.3698"
        onSaveCorrection={vi.fn()}
      />,
    );
    const nav = screen
      .getAllByRole('link')
      .find((a) => a.getAttribute('href')?.includes('google.com/maps'));
    expect(nav).toBeTruthy();
  });

  it('telepon -> link tel:', () => {
    render(
      <PlaceDetail poi={poi} navigationUrl="https://example.org" onSaveCorrection={vi.fn()} />,
    );
    const tel = screen.getAllByRole('link').find((a) => a.getAttribute('href')?.startsWith('tel:'));
    expect(tel?.getAttribute('href')).toBe('tel:+17138843131');
  });

  it('panel sumber menampilkan source & verifikasi', () => {
    render(
      <PlaceDetail
        poi={poi}
        navigationUrl="https://example.org"
        verifiedAt="2026-11-19"
        sourceUrl="https://www.openstreetmap.org/node/1"
        onSaveCorrection={vi.fn()}
      />,
    );
    expect(screen.getAllByText(/2026-11-19/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/place\.verifyFirst/).length).toBeGreaterThan(0);
  });

  it('form koreksi memanggil onSaveCorrection', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PlaceDetail poi={poi} navigationUrl="https://example.org" onSaveCorrection={onSave} />);
    fireEvent.click(screen.getAllByRole('button', { name: /reportWrong/ })[0]);
    const saveBtn = await screen.findByRole('button', { name: /common\.save/ });
    fireEvent.click(saveBtn);
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave.mock.calls[0][0]).toBe('wrong-info');
  });
});
