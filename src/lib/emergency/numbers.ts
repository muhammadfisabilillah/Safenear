// SAFE NEAR — nomor darurat per negara (EmergencyNumberAPI, ODbL, gratis).
// Rujukan: https://emergencynumberapi.com/ · https://github.com/EmergencyNumbersAPI/data

export interface EmergencyNumbers {
  country: string;
  police?: string;
  fire?: string;
  ambulance?: string;
  dispatch?: string;
  /** Sumber respon mentah (untuk atribusi/audit). */
  source: string;
}

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const API = 'https://emergencynumberapi.com/api/country';

/** Normalisasi nomor: buang spasi/anda, pertahankan + dan digit. */
function cleanNumber(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^\d+]/g, '');
  return cleaned.length >= 3 ? cleaned : undefined;
}

export function parseEmergencyResponse(iso: string, raw: unknown): EmergencyNumbers {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const data = (obj.data ?? obj) as Record<string, unknown>;
  const pick = (key: string) => cleanNumber(data[key] as string | undefined);
  return {
    country: iso.toUpperCase(),
    police: pick('police'),
    fire: pick('fire'),
    ambulance: pick('ambulance'),
    dispatch: pick('dispatch'),
    source: `${API}/${iso.toUpperCase()}`,
  };
}

/** Ambil nomor darurat; throw bila gagal (UI menampilkan "cek sumber resmi"). */
export async function fetchEmergencyNumbers(
  iso: string,
  opts: { fetchImpl?: FetchLike } = {},
): Promise<EmergencyNumbers> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const code = iso.toUpperCase();
  const res = await fetchImpl(`${API}/${code}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Nomor darurat ${code}: HTTP ${res.status}`);
  return parseEmergencyResponse(code, await res.json());
}
