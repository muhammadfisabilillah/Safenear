// SAFE NEAR — tipe data inti.
// Sumber kebenaran: PROJECT_CONTEXT.md §10.

export type Category =
  | 'police'
  | 'hospital'
  | 'embassy'
  | 'fire'
  | 'courthouse'
  | 'shelter';

export type PoiSource = 'osm' | 'official' | 'community';

export interface Poi {
  id: string; // "osm:node:123" | "osm:way:456" | "bundle:uuid"
  source: PoiSource;
  category: Category;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;
  openingHours?: string; // OSM opening_hours
  url?: string;
  tags?: Record<string, string>;
  verifiedAt?: string; // ISO date (yyyy-mm-dd)
  sourceUrl?: string;
  nationality?: string; // ISO 3166-1 alpha-2, khusus embassy
}

export type ChannelKind = 'phone' | 'email' | 'web' | 'chat';

export interface SovereignChannel {
  label: string;
  kind: ChannelKind;
  value: string;
  url?: string;
  hours?: string;
  note?: string;
}

export interface RightsNote {
  title: string;
  body: string;
  source: string;
}

export interface CountryProfile {
  iso: string;
  name: string;
  flag: string;
  languages: string[];
  sovereignChannels: SovereignChannel[];
  consulateStrategy: {
    osmQuery: string;
    osmQueryAlt?: string;
    officialDirectoryUrl?: string;
    note?: string;
  };
  rightsNotes: RightsNote[];
  /** Sumber verifikasi untuk saluran & hak (opsional, tapi dianjurkan). */
  sources?: { label: string; url: string }[];
  disclaimer?: string;
}

export interface UserPrefs {
  nationality: string;
  hostCountry: string;
  city?: string;
  language: string; // 'id' | 'en' | ...
  onboarded: boolean;
  updatedAt: string; // ISO datetime
}

export interface EvidenceRef {
  id: string;
  kind: 'photo' | 'audio' | 'note' | 'file';
  name: string;
  size: number;
  createdAt: string;
  storageKey: string; // kunci di OPFS/IndexedDB
}

export interface IncidentReport {
  id: string;
  category: Category;
  occurredAt: string;
  createdAt: string;
  location: {
    lat: number;
    lon: number;
    address?: string;
    label?: string;
  };
  description: string;
  witnesses?: { name?: string; contact?: string }[];
  evidence: EvidenceRef[];
  pdfHash?: string; // SHA-256 isi PDF
}

export interface PoiBundle {
  schemaVersion: 1;
  id: string; // "US-houston"
  country: string; // ISO
  city: string;
  center?: { lat: number; lon: number };
  bbox: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  downloadedAt: string;
  osmBaseTimestamp?: string;
  attribution: Record<string, string>;
  notes?: string[];
  pois: Poi[];
}

// ---------- Overpass ----------

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  version?: number;
  generator?: string;
  osm3s?: { timestamp_osm_base?: string; copyright?: string };
  elements: OverpassElement[];
}
