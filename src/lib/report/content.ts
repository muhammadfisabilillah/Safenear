// SAFE NEAR — penyusunan konten laporan (EN + ID) sebelum dirender ke PDF.
// Dipisah dari renderer agar bisa di-test tanpa React/PDF.

import type { IncidentReport } from '@/lib/poi/types';

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};

export interface ReportSection {
  key: string;
  titleId: string;
  titleEn: string;
  lines: string[];
}

export interface ReportContent {
  reportId: string;
  docTitleId: string;
  docTitleEn: string;
  hash?: string;
  createdAt: string;
  sections: ReportSection[];
  disclaimerId: string;
  disclaimerEn: string;
}

const fmtDateTime = (iso: string, lang: 'id' | 'en'): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
};

const fmtCoord = (lat: number, lon: number): string => `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

export function buildReportContent(report: IncidentReport, hash?: string): ReportContent {
  const sections: ReportSection[] = [];

  sections.push({
    key: 'chronology',
    titleId: 'Kronologi',
    titleEn: 'Chronology',
    lines: [
      `${fmtDateTime(report.occurredAt, 'id')} (ID) / ${fmtDateTime(report.occurredAt, 'en')} (EN)`,
      `Dibuat: ${fmtDateTime(report.createdAt, 'id')} (ID) / ${fmtDateTime(report.createdAt, 'en')} (EN)`,
    ],
  });

  sections.push({
    key: 'location',
    titleId: 'Lokasi',
    titleEn: 'Location',
    lines: [
      `Koordinat: ${fmtCoord(report.location.lat, report.location.lon)}`,
      ...(report.location.address ? [`Alamat: ${report.location.address}`] : []),
      ...(report.location.label ? [`Label: ${report.location.label}`] : []),
    ],
  });

  sections.push({
    key: 'description',
    titleId: 'Deskripsi Kejadian',
    titleEn: 'Incident Description',
    lines: [report.description],
  });

  if (report.witnesses && report.witnesses.length > 0) {
    sections.push({
      key: 'witnesses',
      titleId: 'Saksi',
      titleEn: 'Witnesses',
      lines: report.witnesses.map(
        (w, i) => `${i + 1}. ${w.name || '(tanpa nama)'}${w.contact ? ` — ${w.contact}` : ''}`,
      ),
    });
  }

  if (report.evidence.length > 0) {
    sections.push({
      key: 'evidence',
      titleId: 'Bukti',
      titleEn: 'Evidence',
      lines: report.evidence.map(
        (e) => `- ${e.name} (${e.kind}, ${formatBytes(e.size)}) [lokal, tidak dikirim]`,
      ),
    });
  } else {
    sections.push({
      key: 'evidence',
      titleId: 'Bukti',
      titleEn: 'Evidence',
      lines: ['(tidak ada bukti terlampir) / (no evidence attached)'],
    });
  }

  return {
    reportId: report.id,
    docTitleId: 'Laporan Insiden',
    docTitleEn: 'Incident Report',
    hash,
    createdAt: report.createdAt,
    sections,
    disclaimerId:
      'Laporan ini dibuat dengan SAFE NEAR dan belum dikirim ke mana pun. Bukan nasihat hukum. Bila dalam bahaya nyawa, hubungi nomor darurat lokal.',
    disclaimerEn:
      'This report was created with SAFE NEAR and has not been sent anywhere. Not legal advice. If in immediate danger, call local emergency services.',
  };
}

/** Versi teks polos (untuk preview / copy-paste). */
export function reportContentToPlainText(content: ReportContent): string {
  const parts: string[] = [
    `${content.docTitleId} / ${content.docTitleEn}`,
    `ID: ${content.reportId}`,
  ];
  if (content.hash) parts.push(`Hash (SHA-256): ${content.hash}`);
  for (const s of content.sections) {
    parts.push('');
    parts.push(`${s.titleId} / ${s.titleEn}`);
    parts.push(...s.lines);
  }
  parts.push('');
  parts.push(content.disclaimerId);
  parts.push(content.disclaimerEn);
  return parts.join('\n');
}

/** Ringkas identitas laporan untuk daftar/duplicates. */
export function summarizeReport(report: IncidentReport): string {
  const when = fmtDateTime(report.occurredAt, 'id');
  const cat = report.category;
  return `${when} · ${cat} · ${report.location.label || fmtCoord(report.location.lat, report.location.lon)}`;
}
