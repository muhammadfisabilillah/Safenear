'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IncidentReport } from '@/lib/poi/types';
import { categoryLabel } from '@/lib/map/config';
import { reportContentToPlainText, summarizeReport } from '@/lib/report/content';
import { buildReportContent } from '@/lib/report/content';
import { renderReportPdfBrowser } from '@/lib/report/pdf';
import { attachPdfHash } from '@/lib/report/store';
import { formatBytes } from '@/lib/report/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ReportDetailProps {
  report: IncidentReport;
  onDeleted: () => void;
}

export function ReportDetail({ report, onDeleted }: ReportDetailProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const exportPdf = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { blob, hash } = await renderReportPdfBrowser(report);
      await attachPdfHash(report.id, hash);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safe-near-report-${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage(t('reportDetail.pdfReady'));
    } catch {
      setMessage(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const content = buildReportContent(report, report.pdfHash);
    const text = reportContentToPlainText(content);
    try {
      if (navigator.share) {
        await navigator.share({ title: content.docTitleId, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setMessage(t('reportDetail.copied'));
    } catch {
      setMessage(null);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { deleteReport } = await import('@/lib/report/store');
      await deleteReport(report.id);
      onDeleted();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{summarizeReport(report)}</CardTitle>
          <p className="text-muted-foreground text-xs">{categoryLabel(report.category, lang)}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row
            label={t('reportDetail.occurredAt')}
            value={new Date(report.occurredAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB')}
          />
          <Row
            label={t('report.location')}
            value={`${report.location.lat.toFixed(6)}, ${report.location.lon.toFixed(6)}${
              report.location.label ? ` · ${report.location.label}` : ''
            }`}
          />
          <Row label={t('report.description')} value={report.description} />
          {report.witnesses && report.witnesses.length > 0 ? (
            <Row
              label={t('reportDetail.witnesses')}
              value={report.witnesses
                .map((w) => `${w.name ?? '—'}${w.contact ? ` (${w.contact})` : ''}`)
                .join(', ')}
            />
          ) : (
            <Row label={t('reportDetail.witnesses')} value={t('reportDetail.noWitnesses')} />
          )}
          {report.evidence.length > 0 ? (
            <div className="text-muted-foreground text-xs">
              {t('reportDetail.evidenceList')}:{' '}
              {report.evidence.map((e) => `${e.name} (${formatBytes(e.size)})`).join(', ')}
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">{t('reportDetail.noEvidence')}</div>
          )}
          <Row
            label={t('reportDetail.createdAt')}
            value={new Date(report.createdAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-GB')}
          />
          {report.pdfHash ? (
            <div className="text-muted-foreground break-all text-xs">
              {t('reportDetail.hash')}: {report.pdfHash}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button className="h-11" disabled={busy} onClick={exportPdf}>
          📄 {t('reportDetail.exportPdf')}
        </Button>
        <Button variant="outline" className="h-11" onClick={share}>
          🔗 {t('reportDetail.share')}
        </Button>
      </div>

      {!confirming ? (
        <Button
          variant="ghost"
          className="text-destructive w-full"
          onClick={() => setConfirming(true)}
        >
          🗑 {t('reportDetail.delete')}
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-3 text-sm">{t('common.confirmDelete')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" className="flex-1" disabled={busy} onClick={remove}>
                {t('common.delete')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-28 shrink-0 text-xs">{label}</span>
      <span className="break-words">{value}</span>
    </div>
  );
}
