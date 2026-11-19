// SAFE NEAR — skema zod untuk semua batas data (bundle, prefs, laporan).
// Dipakai di: loader bundle, form lapor, validasi storage.

import { z } from 'zod';
import type { Category, CountryProfile, IncidentReport, Poi, PoiBundle, UserPrefs } from './types';

export const categorySchema = z.union([
  z.literal('police'),
  z.literal('hospital'),
  z.literal('embassy'),
  z.literal('fire'),
  z.literal('courthouse'),
  z.literal('shelter'),
]);
export type CategoryInput = z.infer<typeof categorySchema>;

export const CATEGORIES: readonly Category[] = [
  'police',
  'hospital',
  'embassy',
  'fire',
  'courthouse',
  'shelter',
];

export const poiSchema = z.object({
  id: z.string().min(1),
  source: z.union([z.literal('osm'), z.literal('official'), z.literal('community')]),
  category: categorySchema,
  name: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  address: z.string().optional(),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
  url: z.string().optional(),
  tags: z.record(z.string()).optional(),
  verifiedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sourceUrl: z.string().optional(),
  nationality: z.string().length(2).optional(),
});
export type PoiInput = z.infer<typeof poiSchema>;

export const bboxSchema = z.tuple([
  z.number(), // minLon
  z.number(), // minLat
  z.number(), // maxLon
  z.number(), // maxLat
]);

export const bundleSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  country: z.string().length(2),
  city: z.string().min(1),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  bbox: bboxSchema,
  downloadedAt: z.string(),
  osmBaseTimestamp: z.string().optional(),
  sizeBytes: z.number().optional(),
  attribution: z.record(z.string()),
  notes: z.array(z.string()).optional(),
  pois: z.array(poiSchema),
});
export type BundleInput = z.infer<typeof bundleSchema>;

export const sovereignChannelSchema = z.object({
  label: z.string().min(1),
  kind: z.union([z.literal('phone'), z.literal('email'), z.literal('web'), z.literal('chat')]),
  value: z.string().min(1),
  url: z.string().optional(),
  hours: z.string().optional(),
  note: z.string().optional(),
});

export const countryProfileSchema = z.object({
  iso: z.string().length(2),
  name: z.string().min(1),
  flag: z.string(),
  languages: z.array(z.string()),
  sovereignChannels: z.array(sovereignChannelSchema),
  consulateStrategy: z.object({
    osmQuery: z.string().optional(),
    osmQueryAlt: z.string().optional(),
    officialDirectoryUrl: z.string().optional(),
    note: z.string().optional(),
  }),
  rightsNotes: z.array(z.object({ title: z.string(), body: z.string(), source: z.string() })),
  sources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  disclaimer: z.string().optional(),
});

export const userPrefsSchema = z.object({
  id: z.string(),
  nationality: z.string().length(2),
  hostCountry: z.string().length(2),
  city: z.string().optional(),
  cityBundleId: z.string().optional(),
  language: z.string().min(2),
  onboarded: z.boolean(),
  updatedAt: z.string(),
});

export const evidenceRefSchema = z.object({
  id: z.string(),
  kind: z.union([z.literal('photo'), z.literal('audio'), z.literal('note'), z.literal('file')]),
  name: z.string().min(1),
  size: z.number().nonnegative(),
  createdAt: z.string(),
  storageKey: z.string().min(1),
});

export const incidentReportSchema = z.object({
  id: z.string().min(1),
  category: categorySchema,
  occurredAt: z.string().min(1),
  createdAt: z.string().min(1),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    address: z.string().optional(),
    label: z.string().optional(),
  }),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  witnesses: z
    .array(z.object({ name: z.string().optional(), contact: z.string().optional() }))
    .optional(),
  evidence: z.array(evidenceRefSchema),
  pdfHash: z.string().optional(),
});
export type IncidentReportInput = z.infer<typeof incidentReportSchema>;

/** Validasi + strip unknown keys. Throw z.ZodError bila tidak valid. */
export function parseBundle(raw: unknown): PoiBundle {
  return bundleSchema.parse(raw) as PoiBundle;
}

export function parsePoi(raw: unknown): Poi {
  return poiSchema.parse(raw) as Poi;
}

export function parseUserPrefs(raw: unknown): UserPrefs {
  return userPrefsSchema.parse(raw) as UserPrefs;
}

export function parseIncidentReport(raw: unknown): IncidentReport {
  return incidentReportSchema.parse(raw) as IncidentReport;
}

export function parseCountryProfile(raw: unknown): CountryProfile {
  return countryProfileSchema.parse(raw) as CountryProfile;
}

export { CATEGORIES as CATEGORY_LIST };
