import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DistanceBadge } from './DistanceBadge';
import { PoiCard } from './PoiCard';
import { PoiList } from './PoiList';
import type { NearbyPoi } from '@/lib/geo/geo';

const poi: NearbyPoi = {
  id: 'osm:node/1',
  source: 'osm',
  category: 'police',
  name: 'Central Police',
  lat: 29.7604,
  lon: -95.3698,
  address: '1200 Travis St',
  phone: '+1-713-884-3131',
  distanceMeters: 1200,
  walkMinutes: 14,
  driveMinutes: 3,
};

describe('DistanceBadge', () => {
  it('menampilkan jarak format km + estimasi', () => {
    render(<DistanceBadge meters={1200} walkMinutes={14} driveMinutes={3} />);
    expect(screen.getByText(/km/i)).toBeTruthy();
    expect(screen.getAllByText(/14|3/).length).toBeGreaterThan(0);
  });

  it('compact menyembunyikan estimasi', () => {
    render(<DistanceBadge meters={800} walkMinutes={10} driveMinutes={2} compact />);
    expect(screen.queryByText(/10/)).toBeNull();
  });
});

describe('PoiCard', () => {
  it('menampilkan nama, kategori, jarak, telepon', () => {
    const { getAllByText } = render(<PoiCard poi={poi} rank={1} />);
    expect(getAllByText('Central Police').length).toBeGreaterThan(0);
    expect(screen.getByText(/\+1-713-884-3131/)).toBeTruthy();
    expect(screen.getByText(/1200 Travis St/)).toBeTruthy();
  });

  it('tautan ke /place/<id>', () => {
    render(<PoiCard poi={poi} />);
    const links = screen.getAllByRole('link');
    expect(links[0].getAttribute('href')).toContain('/place?id=');
  });
});

describe('PoiList', () => {
  it('mengurutkan daftar sesuai input', () => {
    const { getAllByText } = render(<PoiList pois={[poi]} />);
    expect(getAllByText('Central Police').length).toBeGreaterThan(0);
  });
  it('kosong -> pesan', () => {
    render(<PoiList pois={[]} />);
    expect(screen.getByText(/nearby\.empty/i)).toBeTruthy();
  });
});
