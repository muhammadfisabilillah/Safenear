'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { Category } from '@/lib/poi/types';
import { CATEGORY_ORDER, categoryLabel } from '@/lib/map/config';
import { centerForCity, type MapCenter } from '@/lib/map/config';
import { prefsStore } from '@/lib/prefs/store';
import { createDefaultRepository } from '@/lib/poi/dataSource';
import { type NearbyPoi, type LatLon } from '@/lib/geo/geo';
import { getCurrentPosition } from '@/lib/map/geolocation';
import { PoiList } from '@/components/poi/PoiList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OfflineNote } from '@/components/layout/OfflineNote';

const DEFAULT_LIMIT = 5;

function NearbyPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  const rawCategory = searchParams.get('category') ?? 'police';
  const category: Category = (CATEGORY_ORDER as readonly string[]).includes(rawCategory)
    ? (rawCategory as Category)
    : 'police';

  const [pois, setPois] = useState<NearbyPoi[]>([]);
  const [originLabel, setOriginLabel] = useState<string>('');
  const [source, setSource] = useState<'bundle' | 'overpass' | 'none'>('none');
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
        const repo = createDefaultRepository({
          bundleId: prefs.cityBundleId,
          overpassRadius: 6000,
        });

        let origin: LatLon | null = null;
        let label = '';
        try {
          const pos = await getCurrentPosition({ timeoutMs: 8000 });
          origin = { lat: pos.lat, lon: pos.lon };
          label = t('nearby.fromGps');
        } catch {
          const center: MapCenter = centerForCity(prefs.city);
          origin = { lat: center.lat, lon: center.lon };
          label = prefs.city ?? t('nearby.fromCity');
        }
        if (!alive) return;
        setOriginLabel(label);

        const result = await repo.nearby({
          category,
          origin,
          limit: DEFAULT_LIMIT,
          nationality: prefs.nationality,
        });
        if (!alive) return;
        setPois(result.pois);
        setSource(result.source);

        if (result.source === 'none') {
          setError(t('nearby.downloadHint'));
        }
      } catch (e) {
        if (!alive) return;
        setError(t('errors.generic'));
        void e;
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [category, router, t]);

  const handleChangeCategory = useCallback(
    (next: Category) => {
      router.push(`/nearby?category=${next}`);
    },
    [router],
  );

  const chips = useMemo(
    () =>
      CATEGORY_ORDER.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => handleChangeCategory(c)}
          aria-pressed={c === category}
          className={`touch-target rounded-full border px-3 py-1.5 text-sm transition-colors ${
            c === category
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          {categoryLabel(c, lang)}
        </button>
      )),
    [category, handleChangeCategory, lang],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-border bg-background space-y-2 border-b p-3">
        <h1 className="text-lg font-semibold">
          {t('nearby.title', { category: categoryLabel(category, lang) })}
        </h1>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('map.categories')}>
          {chips}
        </div>
        <p className="text-muted-foreground text-xs">
          {originLabel} ·{' '}
          {source === 'bundle'
            ? t('nearby.sourceBundle')
            : source === 'overpass'
              ? t('nearby.sourceOverpass')
              : t('common.noData')}
        </p>
      </div>

      {error ? (
        <div className="p-3">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
            <Link
              href="/offline"
              className="bg-background border-border hover:bg-muted touch-target mt-2 inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm"
            >
              {t('offline.downloadArea')}
            </Link>
          </Alert>
        </div>
      ) : null}

      <OfflineNote />

      {loading ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t('common.loading')}</p>
      ) : (
        <PoiList pois={pois} />
      )}
    </div>
  );
}

export default function NearbyPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm">
          Memuat…
        </div>
      }
    >
      <NearbyPage />
    </Suspense>
  );
}
