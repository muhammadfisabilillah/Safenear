'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { Category, Poi } from '@/lib/poi/types';
import { prefsStore } from '@/lib/prefs/store';
import { bundleIdFor } from '@/lib/poi/bundle';
import { loadLocalOrRemoteBundle } from '@/lib/poi/dataSource';
import { centerForCity, type MapCenter } from '@/lib/map/config';
import { getCurrentPosition, type UserPosition } from '@/lib/map/geolocation';
import { filterByCategories } from '@/lib/map/poiGeoJson';
import { CategoryChips } from '@/components/map/CategoryChips';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MapView = dynamic(() => import('@/components/map/MapView').then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Memuat peta…
    </div>
  ),
});

export default function MapPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [center, setCenter] = useState<MapCenter | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [active, setActive] = useState<Category[] | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundleId, setBundleId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const prefs = await prefsStore.get();
        if (!prefs) {
          router.replace('/');
          return;
        }
        const id = prefs.cityBundleId || bundleIdFor(prefs.hostCountry, prefs.city);
        if (!alive) return;
        setBundleId(id);
        setCenter(centerForCity(prefs.city));

        if (id) {
          try {
            const bundle = await loadLocalOrRemoteBundle(id);
            if (!alive) return;
            setPois(bundle.pois);
          } catch (e) {
            if (!alive) return;
            setError(
              e instanceof Error && e.message.includes('tidak tersedia')
                ? t('nearby.downloadHint')
                : t('errors.network'),
            );
          }
        } else {
          setError(t('nearby.downloadHint'));
        }

        try {
          const pos = await getCurrentPosition({ timeoutMs: 8000 });
          if (!alive) return;
          setUserPosition(pos);
          setCenter((c) => c ?? { lat: pos.lat, lon: pos.lon, zoom: 14 });
        } catch {
          // Lokasi opsional; jangan blokir peta.
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [router, t]);

  const visiblePois = useMemo(() => filterByCategories(pois, active), [pois, active]);

  const handleSelect = useCallback(
    (poi: Poi) => {
      router.push(`/place/${encodeURIComponent(poi.id)}`);
    },
    [router],
  );

  if (!center) {
    return (
      <div className="text-muted-foreground flex h-[60vh] items-center justify-center text-sm">
        {loading ? t('common.loading') : t('common.noData')}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] flex-col">
      <div className="border-border bg-background space-y-2 border-b p-3">
        <CategoryChips active={active} onChange={setActive} />
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {visiblePois.length} {t('map.nearby')} · {t('common.dataSource')}: OSM
          </span>
          {bundleId ? <span className="truncate">{bundleId}</span> : null}
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="relative flex-1">
        <MapView
          center={center}
          pois={visiblePois}
          activeCategories={active}
          userPosition={userPosition}
          onSelectPoi={handleSelect}
          className="absolute inset-0"
        />
        {loading ? (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
            <span className="bg-card/90 text-muted-foreground rounded-full px-3 py-1 text-xs shadow">
              {t('common.loading')}
            </span>
          </div>
        ) : null}
      </div>

      <div className="border-border bg-background text-muted-foreground border-t px-3 py-2 text-center text-xs">
        <Link href="/nearby" className="text-primary font-medium underline">
          {t('nearby.openDetails')}
        </Link>
      </div>
    </div>
  );
}
