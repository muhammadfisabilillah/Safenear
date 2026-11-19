'use client';

import { useTranslation } from 'react-i18next';
import { formatDistance } from '@/lib/geo/geo';

export interface DistanceBadgeProps {
  meters: number;
  walkMinutes: number;
  driveMinutes: number;
  compact?: boolean;
}

/** Lencana jarak + estimasi waktu (jalan kaki & kendaraan). */
export function DistanceBadge({
  meters,
  walkMinutes,
  driveMinutes,
  compact = false,
}: DistanceBadgeProps) {
  const { t } = useTranslation();
  return (
    <span className="text-muted-foreground inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
      <span className="text-foreground font-medium">{formatDistance(meters)}</span>
      {!compact && (
        <>
          <span aria-hidden="true">·</span>
          <span>
            🚶 {walkMinutes} {t('common.minutes')}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            🚗 {driveMinutes} {t('common.minutes')}
          </span>
        </>
      )}
    </span>
  );
}
