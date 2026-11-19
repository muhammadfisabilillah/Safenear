// SAFE NEAR — render PDF laporan (EN + ID) via @react-pdf/renderer (client-side).
// Tidak ada data yang dikirim ke server: render terjadi di perangkat user.

import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { IncidentReport } from '@/lib/poi/types';
import { buildReportContent, type ReportContent } from './content';
import { hashReport } from './hash';
import { renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.5,
  },
  header: { borderBottom: '2 solid #0ea5e9', paddingBottom: 8, marginBottom: 12 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0c4a6e' },
  subtitle: { fontSize: 11, color: '#475569', marginTop: 2 },
  meta: { fontSize: 9, color: '#475569', marginTop: 4 },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  line: { marginBottom: 2 },
  disclaimer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f1f5f9',
    fontSize: 8,
    color: '#334155',
  },
  hash: { fontSize: 8, color: '#64748b', marginTop: 6 },
});

export interface ReportPdfProps {
  content: ReportContent;
}

export function ReportPdfDocument({ content }: ReportPdfProps) {
  return (
    <Document
      title={`${content.docTitleId} ${content.reportId}`}
      author="SAFE NEAR"
      subject={content.docTitleId}
      creator="SAFE NEAR"
      producer="SAFE NEAR"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{content.docTitleId}</Text>
          <Text style={styles.subtitle}>{content.docTitleEn}</Text>
          <Text style={styles.meta}>{`ID: ${content.reportId}`}</Text>
          <Text style={styles.meta}>{`${content.createdAt}`}</Text>
        </View>

        {content.sections.map((section) => (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{`${section.titleId} / ${section.titleEn}`}</Text>
            {section.lines.map((line, i) => (
              <Text key={i} style={styles.line}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.disclaimer}>
          <Text>{content.disclaimerId}</Text>
          <Text style={{ marginTop: 4 }}>{content.disclaimerEn}</Text>
        </View>

        {content.hash ? <Text style={styles.hash}>{`SHA-256: ${content.hash}`}</Text> : null}
      </Page>
    </Document>
  );
}

export interface RenderedPdf {
  buffer: Uint8Array;
  hash: string;
}

export interface RenderedPdfBlob {
  blob: Blob;
  hash: string;
}

/** Render laporan menjadi buffer PDF + hash konten (Node/SSR). */
export async function renderReportPdf(report: IncidentReport): Promise<RenderedPdf> {
  const hash = await hashReport(report);
  const content = buildReportContent(report, hash);
  const buffer = await renderToBuffer(<ReportPdfDocument content={content} />);
  return { buffer, hash };
}

/**
 * Render laporan menjadi Blob PDF + hash konten (BROWSER).
 * `renderToBuffer` tidak tersedia di bundle browser @react-pdf/renderer v4,
 * sehingga di sini dipakai API `pdf(...).toBlob()`.
 */
export async function renderReportPdfBrowser(report: IncidentReport): Promise<RenderedPdfBlob> {
  const hash = await hashReport(report);
  const content = buildReportContent(report, hash);
  const blob = await pdf(<ReportPdfDocument content={content} />).toBlob();
  return { blob, hash };
}
