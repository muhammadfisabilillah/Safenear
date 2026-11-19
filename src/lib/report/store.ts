// SAFE NEAR — penyimpanan laporan insiden (IndexedDB, lokal).
// Tidak ada pengiriman ke server; user yang memutuskan membagikan PDF.

import type { IncidentReport } from '@/lib/poi/types';
import { incidentReportSchema } from '@/lib/poi/schema';
import { reportsStore } from '@/lib/prefs/store';

export interface NewReportInput {
  category: IncidentReport['category'];
  occurredAt: string;
  location: IncidentReport['location'];
  description: string;
  witnesses?: IncidentReport['witnesses'];
  evidence?: IncidentReport['evidence'];
}

/** Buat laporan baru dengan id + timestamp server-independen (lokal). */
export function createReport(input: NewReportInput): IncidentReport {
  const now = new Date().toISOString();
  const report: IncidentReport = {
    id: crypto.randomUUID(),
    category: input.category,
    occurredAt: input.occurredAt || now,
    createdAt: now,
    location: input.location,
    description: input.description,
    ...(input.witnesses && input.witnesses.length ? { witnesses: input.witnesses } : {}),
    evidence: input.evidence ?? [],
  };
  return incidentReportSchema.parse(report) as IncidentReport;
}

export async function saveReport(report: IncidentReport): Promise<void> {
  const valid = incidentReportSchema.parse(report) as IncidentReport;
  await reportsStore.put(valid);
}

export async function getReport(id: string): Promise<IncidentReport | undefined> {
  const r = await reportsStore.get(id);
  if (!r) return undefined;
  try {
    return incidentReportSchema.parse(r) as IncidentReport;
  } catch {
    return undefined;
  }
}

export async function listReports(): Promise<IncidentReport[]> {
  const all = await reportsStore.getAll();
  return all
    .map((r) => {
      try {
        return incidentReportSchema.parse(r) as IncidentReport;
      } catch {
        return null;
      }
    })
    .filter((r): r is IncidentReport => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteReport(id: string): Promise<void> {
  await reportsStore.delete(id);
}

/** Update hash PDF setelah laporan dirender. */
export async function attachPdfHash(id: string, hash: string): Promise<void> {
  const r = await reportsStore.get(id);
  if (!r) throw new Error(`Laporan ${id} tidak ditemukan`);
  const updated: IncidentReport = { ...r, pdfHash: hash };
  await reportsStore.put(incidentReportSchema.parse(updated) as IncidentReport);
}
