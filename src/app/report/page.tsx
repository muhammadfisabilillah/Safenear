'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { IncidentReport } from '@/lib/poi/types';
import { listReports } from '@/lib/report/store';
import { summarizeReport } from '@/lib/report/content';
import { ReportDetail } from '@/components/report/ReportDetail';
import { Button } from '@/components/ui/button';

function ReportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [current, setCurrent] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const all = await listReports();
        if (!alive) return;
        setReports(all);
        if (id) {
          const { getReport } = await import('@/lib/report/store');
          const r = await getReport(decodeURIComponent(id));
          if (!alive) return;
          setCurrent(r ?? null);
        } else {
          setCurrent(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  if (current) {
    return (
      <div className="mx-auto max-w-2xl p-3 pb-8">
        <Link href="/report" className="text-primary mb-3 inline-block text-sm underline">
          ← {t('reportDetail.list')}
        </Link>
        <ReportDetail
          report={current}
          onDeleted={() => {
            router.replace('/report');
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 pb-8">
      <h1 className="mb-3 text-lg font-semibold">{t('reportDetail.list')}</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t('reportDetail.empty')}</p>
      ) : (
        <ul className="divide-border border-border divide-y border-y">
          {reports.map((r) => (
            <li key={r.id}>
              <Link
                href={`/report?id=${encodeURIComponent(r.id)}`}
                className="hover:bg-muted touch-target flex items-center justify-between gap-2 p-3 no-underline"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{summarizeReport(r)}</span>
                  <span className="text-muted-foreground block text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                    {r.pdfHash ? ' · PDF ✓' : ''}
                  </span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button className="mt-4 h-11 w-full" onClick={() => router.push('/report/new')}>
        + {t('reportDetail.newReport')}
      </Button>
    </div>
  );
}

export default function ReportPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
          Memuat…
        </div>
      }
    >
      <ReportPage />
    </Suspense>
  );
}
