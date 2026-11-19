'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { NearbyPoi } from '@/lib/geo/geo';
import { categoryLabel, categoryColor } from '@/lib/map/config';
import { DistanceBadge } from './DistanceBadge';

export interface PoiCardProps {
  poi: NearbyPoi;
  rank?: number;
}

/** Kartu satu tempat: nama, kategori, jarak, alamat, telepon, tautan detail. */
export function PoiCard({ poi, rank }: PoiCardProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  return (
    <li className="border-border bg-card">
      <Link
        href={`/place?id=${encodeURIComponent(poi.id)}`}
        className="border-border touch-target flex items-start gap-3 border-b p-3 no-underline"
      >
        <span
          aria-hidden="true"
          className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border border-white/70"
          style={{ backgroundColor: categoryColor(poi.category) }}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            {typeof rank === 'number' && (
              <span className="text-muted-foreground text-xs font-semibold">{rank}.</span>
            )}
            <span className="text-foreground truncate font-medium">{poi.name}</span>
          </span>
          <span className="text-muted-foreground mt-0.5 block text-xs">
            {categoryLabel(poi.category, lang)}
            {poi.address ? ` · ${poi.address}` : ''}
          </span>
          <span className="mt-1 block">
            <DistanceBadge
              meters={poi.distanceMeters}
              walkMinutes={poi.walkMinutes}
              driveMinutes={poi.driveMinutes}
            />
          </span>
          {poi.phone && <span className="text-primary mt-1 block text-xs">☎ {poi.phone}</span>}
        </span>
        <span aria-hidden="true" className="text-muted-foreground">
          ›
        </span>
      </Link>
    </li>
  );
}
