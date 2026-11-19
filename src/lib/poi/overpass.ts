// SAFE NEAR — klien Overpass (fallback online, bukan sumber utama).
// Dipakai hanya bila bundle lokal belum ada; selalu cache & hormati rate limit.

import type { Category, OverpassResponse, Poi } from './types';
import { CATEGORY_TAGS, normalizeElements } from './normalize';

export const OVERPASS_ENDPOINTS: readonly string[] = [
  'https://ovp.dresel.systems/api-na/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

export const DEFAULT_USER_AGENT = 'safe-near/0.1 (offline-first PWA; contact: github)';

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface OverpassClientOptions {
  endpoints?: readonly string[];
  fetchImpl?: FetchLike;
  userAgent?: string;
  timeoutMs?: number;
  /** Jeda antar query (rate limit). Default 1100 ms. */
  sleepMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class OverpassClient {
  private endpoints: readonly string[];
  private fetchImpl: FetchLike;
  private userAgent: string;
  private timeoutMs: number;
  private sleepMs: number;

  constructor(opts: OverpassClientOptions = {}) {
    this.endpoints = opts.endpoints ?? OVERPASS_ENDPOINTS;
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.userAgent = opts.userAgent ?? DEFAULT_USER_AGENT;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
    this.sleepMs = opts.sleepMs ?? 1100;
  }

  /** Query satu kategori di sekitar titik. Mencoba beberapa endpoint. */
  async queryCategory(
    category: Category,
    lat: number,
    lon: number,
    radius: number,
    signal?: AbortSignal,
  ): Promise<Poi[]> {
    const { tag, value } = CATEGORY_TAGS.find((c) => c.category === category)!;
    const query = `[out:json][timeout:25];nwr["${tag}"="${value}"](around:${Math.round(radius)},${lat},${lon});out center tags;`;
    const res = await this.fetch(query, signal);
    return normalizeElements(res.elements, category);
  }

  /** Query banyak kategori berurutan dengan jeda (aman untuk rate limit). */
  async queryCategories(
    categories: readonly Category[],
    lat: number,
    lon: number,
    radius: number,
    signal?: AbortSignal,
  ): Promise<Poi[]> {
    const out: Poi[] = [];
    for (const [i, category] of categories.entries()) {
      if (i > 0 && this.sleepMs > 0) await sleep(this.sleepMs);
      if (signal?.aborted) break;
      out.push(...(await this.queryCategory(category, lat, lon, radius, signal)));
    }
    return out;
  }

  private async fetch(query: string, signal?: AbortSignal): Promise<OverpassResponse> {
    let lastErr: unknown;
    for (const endpoint of this.endpoints) {
      try {
        const res = await this.fetchImpl(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent,
          },
          body: new URLSearchParams({ data: query }).toString(),
          signal: signal ?? AbortSignal.timeout(this.timeoutMs),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} dari ${endpoint}`);
        return (await res.json()) as OverpassResponse;
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error(`Semua endpoint Overpass gagal: ${String(lastErr)}`);
  }
}

export function createOverpassClient(opts?: OverpassClientOptions): OverpassClient {
  return new OverpassClient(opts);
}
