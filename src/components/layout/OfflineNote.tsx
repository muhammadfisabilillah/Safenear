'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Catatan fallback offline: muncul saat navigator.onLine === false.
 * Menjelaskan bahwa navigasi turn-by-turn butuh internet, sementara
 * data tempat (POI), telepon, kartu hak, dan laporan tetap bisa dipakai.
 */
export function OfflineNote() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <p className="text-muted-foreground px-1 text-center text-xs" role="status">
      {t('place.offlineNote')}
    </p>
  );
}
