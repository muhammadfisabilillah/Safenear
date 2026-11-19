'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { PlaceCorrection, Poi } from '@/lib/poi/types';
import { prefsStore } from '@/lib/prefs/store';
import { correctionsStore } from '@/lib/prefs/store';
import { loadLocalOrRemoteBundle } from '@/lib/poi/dataSource';
import { buildNavigationUrl } from '@/lib/routing/mapsUrl';
import { PlaceDetail } from '@/components/poi/PlaceDetail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OfflineNote } from '@/components/layout/OfflineNote';

function PlacePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';

  const [poi, setPoi] = useState<Poi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const prefs = await prefsStore.get();
        if (!prefs) {
          router.replace('/');
          return;
        }
        if (!id) {
          if (!alive) return;
          setError(t('place.notFound'));
          setLoading(false);
          return;
        }
        const bundleId = prefs.cityBundleId;
        if (!bundleId) {
          if (!alive) return;
          setError(t('nearby.downloadHint'));
          setLoading(false);
          return;
        }
        const bundle = await loadLocalOrRemoteBundle(bundleId);
        const decoded = decodeURIComponent(id);
        const found = bundle.pois.find((p) => p.id === decoded) ?? null;
        if (!alive) return;
        setPoi(found);
        if (!found) setError(t('place.notFound'));
      } catch {
        if (!alive) return;
        setError(t('errors.network'));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, router, t]);

  const handleSaveCorrection = useCallback(
    async (reason: PlaceCorrection['reason'], note: string) => {
      if (!poi) return;
      await correctionsStore.put({
        id: crypto.randomUUID(),
        poiId: poi.id,
        reason,
        ...(note ? { note } : {}),
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
    },
    [poi],
  );

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  if (!poi) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Alert variant="destructive">
          <AlertDescription>{error ?? t('place.notFound')}</AlertDescription>
        </Alert>
        <Link href="/nearby" className="text-primary mt-4 block text-sm underline">
          ← {t('common.back')}
        </Link>
      </div>
    );
  }

  let navigationUrl: string;
  try {
    navigationUrl = buildNavigationUrl({ lat: poi.lat, lon: poi.lon, name: poi.name });
  } catch {
    navigationUrl = `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lon}`;
  }

  return (
    <div className="mx-auto max-w-2xl p-3 pb-8">
      <PlaceDetail
        poi={poi}
        navigationUrl={navigationUrl}
        verifiedAt={poi.verifiedAt}
        sourceUrl={poi.sourceUrl}
        onSaveCorrection={handleSaveCorrection}
      />
      <OfflineNote />
    </div>
  );
}

export default function PlacePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm">
          Memuat…
        </div>
      }
    >
      <PlacePage />
    </Suspense>
  );
}
