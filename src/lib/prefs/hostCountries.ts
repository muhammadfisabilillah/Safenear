// SAFE NEAR — daftar negara tuan rumah & kota pilot.
// Dipisah dari halaman agar dipakai bersama di onboarding, settings, dan peta.

export interface HostCountry {
  iso: string;
  name: string;
  flag: string;
}

export const HOST_COUNTRIES: readonly HostCountry[] = [
  { iso: 'US', name: 'United States', flag: '🇺🇸' },
  { iso: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { iso: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { iso: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { iso: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { iso: 'FR', name: 'France', flag: '🇫🇷' },
  { iso: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { iso: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { iso: 'CA', name: 'Canada', flag: '🇨🇦' },
  { iso: 'AU', name: 'Australia', flag: '🇦🇺' },
  { iso: 'JP', name: 'Japan', flag: '🇯🇵' },
  { iso: 'KR', name: 'South Korea', flag: '🇰🇷' },
];

export interface PilotCity {
  label: string;
  /** ID bundle yang diharapkan, mis. "US-houston". */
  bundleId: string;
  lat: number;
  lon: number;
  /** true bila bundle POI sudah tersedia di repo. */
  hasBundle: boolean;
}

/**
 * Kota pilot per negara. Hanya kota dengan hasBundle=true yang punya data POI;
 * kota lain menampilkan pesan "area belum diunduh".
 */
export const PILOT_CITIES: Record<string, PilotCity[]> = {
  US: [
    {
      label: 'Houston, TX',
      bundleId: 'US-houston',
      lat: 29.7604,
      lon: -95.3698,
      hasBundle: true,
    },
  ],
  ID: [
    { label: 'Jakarta', bundleId: 'ID-jakarta', lat: -6.2088, lon: 106.8456, hasBundle: false },
    {
      label: 'Surabaya',
      bundleId: 'ID-surabaya',
      lat: -7.2575,
      lon: 112.7521,
      hasBundle: false,
    },
  ],
};

export function hostCountryLabel(iso: string): string {
  return HOST_COUNTRIES.find((c) => c.iso === iso)?.name ?? iso;
}

export function citiesForHost(hostCountry: string): PilotCity[] {
  return PILOT_CITIES[hostCountry] ?? [];
}

export function findCityLabel(hostCountry: string | undefined, city: string | undefined): string {
  if (!hostCountry || !city) return '';
  return citiesForHost(hostCountry).find((c) => c.label === city)?.label ?? city;
}

/** Cari bundleId dari pilihan prefs (label kota). */
export function bundleIdFromCity(
  hostCountry: string | undefined,
  city: string | undefined,
): string | null {
  if (!hostCountry) return null;
  if (!city) return null;
  const found = citiesForHost(hostCountry).find((c) => c.label === city);
  return found?.bundleId ?? null;
}
