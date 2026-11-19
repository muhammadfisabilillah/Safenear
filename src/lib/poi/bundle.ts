// SAFE NEAR — akses bundle POI (sumber utama untuk offline).
// Bundle = JSON statis di /bundles/<id>.json (disalin dari data/bundles saat build)
// yang bisa disimpan ke IndexedDB oleh user lewat halaman /offline.

import type { PoiBundle } from './types';
import { bundleSchema } from './schema';

export function bundleFileName(id: string): string {
  return `${id}.json`;
}

export function bundleUrl(id: string): string {
  return `/bundles/${bundleFileName(id)}`;
}

/** Nama bundle dari pilihan prefs: "<COUNTRY>-<kota, lowercase, spasi -> '-'>" */
export function bundleIdFor(country: string, city?: string): string | null {
  const c = country.trim().toUpperCase();
  if (!c) return null;
  const slug = (city ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${c}-${slug}` : c;
}

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface FetchBundleOptions {
  fetchImpl?: FetchLike;
  base?: string;
}

/**
 * Ambil bundle dari CDN/statis lalu validasi zod.
 * Throw dengan pesan ramah bila gagal (UI menangani).
 */
export async function fetchBundle(id: string, opts: FetchBundleOptions = {}): Promise<PoiBundle> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const url = opts.base ? `${opts.base.replace(/\/$/, '')}/${bundleFileName(id)}` : bundleUrl(id);
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch (e) {
    throw new Error(`Gagal menghubungi server bundle: ${String(e)}`);
  }
  if (!res.ok) {
    throw new Error(`Bundle "${id}" tidak tersedia (HTTP ${res.status})`);
  }
  const raw: unknown = await res.json();
  try {
    return bundleSchema.parse(raw) as PoiBundle;
  } catch (e) {
    throw new Error(`Bundle "${id}" tidak valid: ${String(e)}`);
  }
}

/** Ukuran bundle dalam byte (dari JSON string) — dipakai di halaman offline. */
export function bundleSizeBytes(bundle: PoiBundle): number {
  if (bundle.sizeBytes && bundle.sizeBytes > 0) return bundle.sizeBytes;
  return new TextEncoder().encode(JSON.stringify(bundle)).length;
}

/** Ringkasan attribution untuk ditampilkan UI. */
export function bundleAttributionLines(bundle: PoiBundle): string[] {
  return Object.values(bundle.attribution).filter((v) => typeof v === 'string' && v.length > 0);
}
