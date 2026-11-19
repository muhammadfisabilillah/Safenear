'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ReportForm } from '@/components/report/ReportForm';

export default function NewReportPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl p-3 pb-8">
      <h1 className="mb-3 text-lg font-semibold">{t('report.title')}</h1>
      <ReportForm
        onSaved={(id) => {
          router.replace(`/report?id=${encodeURIComponent(id)}`);
        }}
      />
    </div>
  );
}
