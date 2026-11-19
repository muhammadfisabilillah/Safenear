// SAFE NEAR — hash integritas konten (SHA-256) untuk laporan.
// Dipakai untuk membuktikan isi laporan tidak berubah sejak dibuat.

/** Kanonikasi objek: key terurut rekursif supaya hash stabil di berbagai runtime. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) {
    return `[${value.map((v) => canonicalize(v)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`);
  return `{${parts.join(',')}}`;
}

/** SHA-256 hex dari teks UTF-8. */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Hash kanonik dari objek laporan (dipakai di PDF & detail laporan). */
export async function hashReport(report: unknown): Promise<string> {
  return sha256Hex(canonicalize(report));
}

/** Bandingkan hash (aman terhadap uppercase/lowercase & whitespace). */
export function hashMatches(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
