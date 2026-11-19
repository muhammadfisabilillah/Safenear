'use client';

import { useTranslation } from 'react-i18next';
import type { NearbyPoi } from '@/lib/geo/geo';
import { PoiCard } from './PoiCard';

export interface PoiListProps {
  pois: NearbyPoi[];
}

/** Daftar tempat terdekat (urut dari terdekat). */
export function PoiList({ pois }: PoiListProps) {
  const { t } = useTranslation();
  if (pois.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">{t('nearby.emptyGeneric')}</p>
    );
  }
  return (
    <ul className="divide-border border-border divide-y border-y">
      {pois.map((poi, i) => (
        <PoiCard key={poi.id} poi={poi} rank={i + 1} />
      ))}
    </ul>
  );
}
