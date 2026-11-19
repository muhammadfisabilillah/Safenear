'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { PoiBundle } from '@/lib/poi/types';
import { prefsStore, clearAllData } from '@/lib/prefs/store';
import { createOfflineManager, type DownloadProgress } from '@/lib/offline/manager';
import { formatBytes } from '@/lib/report/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OfflinePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [areas, setAreas] = useState<PoiBundle[]>([]);
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [storage, setStorage] = useState({ usage: 0, quota: 0, percent: 0, supported: false });
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const manager = createOfflineManager();

  const refresh = useCallback(async () => {
    const [list, status] = await Promise.all([manager.listAreas(), manager.storageStatus()]);
    setAreas(list);
    setStorage(status);
  }, [manager]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const prefs = await prefsStore.get();
      if (!prefs) {
        router.replace('/');
        return;
      }
      if (!alive) return;
      setBundleId(prefs.cityBundleId ?? null);
      await refresh();
    })();
    return () => {
      alive = false;
    };
  }, [router, refresh]);

  const download = async () => {
    if (!bundleId) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await manager.downloadArea(bundleId, setProgress);
      setMessage(t('offline.downloadDone'));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const removeArea = async (id: string) => {
    setDeleting(id);
    try {
      await manager.deleteArea(id);
      await refresh();
    } finally {
      setDeleting(null);
    }
  };

  const wipe = async () => {
    setBusy(true);
    try {
      await clearAllData();
      setConfirmClear(false);
      await refresh();
      setMessage(t('offline.clearAllDone'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-8">
      <h1 className="text-lg font-semibold">{t('offline.title')}</h1>

      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('offline.downloadArea')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-xs">{t('offline.tileNote')}</p>
          {bundleId ? (
            <Button className="h-11 w-full" disabled={busy} onClick={download}>
              {t('offline.downloadArea')} · {bundleId}
            </Button>
          ) : (
            <p className="text-muted-foreground text-sm">{t('nearby.downloadHint')}</p>
          )}
          {progress ? (
            <div className="space-y-1">
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-primary h-full" style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="text-muted-foreground text-xs">{progress.message}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('offline.downloaded')}</CardTitle>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('offline.noAreas')}</p>
          ) : (
            <ul className="space-y-2">
              {areas.map((a) => (
                <li
                  key={a.id}
                  className="border-border flex items-start justify-between gap-3 border-b pb-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{a.city}</span>
                    <span className="text-muted-foreground block text-xs">
                      {a.pois.length} {t('map.nearby')} · {formatBytes(a.sizeBytes ?? 0)} ·{' '}
                      {new Date(a.downloadedAt).toLocaleDateString()}
                    </span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting === a.id}
                    onClick={() => removeArea(a.id)}
                  >
                    {t('offline.deleteArea')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('offline.storageUsed')}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {storage.supported ? (
            <>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-primary h-full" style={{ width: `${storage.percent}%` }} />
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatBytes(storage.usage)} / {formatBytes(storage.quota)} ({storage.percent}%)
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-xs">{t('common.noData')}</p>
          )}
        </CardContent>
      </Card>

      {!confirmClear ? (
        <Button
          variant="ghost"
          className="text-destructive w-full"
          onClick={() => setConfirmClear(true)}
        >
          🗑 {t('offline.clearAll')}
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-3 text-sm">{t('offline.clearAllConfirm')}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmClear(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" className="flex-1" disabled={busy} onClick={wipe}>
                {t('common.delete')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
