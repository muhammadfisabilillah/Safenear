'use client';

import { useTranslation } from 'react-i18next';

/**
 * Banner peringatan permanen: SAFE NEAR bukan layanan darurat.
 * AC: selalu tampil di semua halaman (kecuali onboarding yang punya catatan sendiri).
 */
export function Banner() {
  const { t } = useTranslation();
  return (
    <div
      role="note"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
    >
      {t('common.disclaimerEmergency')}
    </div>
  );
}
