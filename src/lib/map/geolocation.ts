// SAFE NEAR — wrapper Geolocation API dengan timeout & pesan error ramah.
// Semua posisi bersifat sesi; tidak disimpan permanen.

export type GeoStatus = 'idle' | 'loading' | 'ok' | 'denied' | 'unavailable' | 'error';

export interface UserPosition {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface GeoState {
  status: GeoStatus;
  position: UserPosition | null;
  message?: string;
}

export const IDLE_GEO_STATE: GeoState = { status: 'idle', position: null };

export interface GeoOptions {
  timeoutMs?: number;
  maximumAgeMs?: number;
  /** Override untuk test. */
  geolocation?: Geolocation;
}

/** Pesan error geolocation -> teks ramah (ID). */
export function geoErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Izin lokasi ditolak. Aktifkan lokasi di pengaturan browser.';
    case 2:
      return 'Lokasi tidak tersedia saat ini.';
    case 3:
      return 'Waktu mencari lokasi habis. Coba lagi.';
    default:
      return 'Gagal mendapatkan lokasi.';
  }
}

export function getCurrentPosition(opts: GeoOptions = {}): Promise<UserPosition> {
  const geo =
    opts.geolocation ?? (typeof navigator !== 'undefined' ? navigator.geolocation : undefined);
  return new Promise((resolve, reject) => {
    if (!geo) {
      reject(new Error('Geolocation tidak didukung perangkat ini.'));
      return;
    }
    geo.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          reject(new Error('Koordinat lokasi tidak valid.'));
          return;
        }
        resolve({
          lat: latitude,
          lon: longitude,
          ...(typeof accuracy === 'number' ? { accuracy } : {}),
        });
      },
      (err) => reject(new Error(geoErrorMessage(err?.code ?? 0))),
      {
        enableHighAccuracy: false,
        timeout: opts.timeoutMs ?? 10_000,
        maximumAge: opts.maximumAgeMs ?? 5 * 60_000,
      },
    );
  });
}
