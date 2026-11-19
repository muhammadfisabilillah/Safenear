'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import type { Poi } from '@/lib/poi/types';
import type { PlaceCorrection } from '@/lib/poi/types';
import { categoryColor, categoryLabel } from '@/lib/map/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface PlaceDetailProps {
  poi: Poi;
  /** URL navigasi Google Maps (sudah dibangun & divalidasi di page). */
  navigationUrl: string;
  verifiedAt?: string;
  sourceUrl?: string;
  onSaveCorrection: (reason: PlaceCorrection['reason'], note: string) => Promise<void> | void;
}

const REASONS: readonly { value: PlaceCorrection['reason']; key: string }[] = [
  { value: 'wrong-location', key: 'wrongLocation' },
  { value: 'closed', key: 'closed' },
  { value: 'wrong-info', key: 'wrongInfo' },
  { value: 'other', key: 'other' },
];

export function PlaceDetail({
  poi,
  navigationUrl,
  verifiedAt,
  sourceUrl,
  onSaveCorrection,
}: PlaceDetailProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState<PlaceCorrection['reason']>('wrong-info');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    const text = `${poi.name}\n${poi.address ?? ''}\n${poi.lat}, ${poi.lon}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: poi.name, text, url });
        return;
      } catch {
        // dibatalkan user; jangan tampilkan error
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  };

  const submitCorrection = async () => {
    setBusy(true);
    try {
      await onSaveCorrection(reason, note.trim());
      setSaved(true);
      setShowForm(false);
      setNote('');
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-white/70"
              style={{ backgroundColor: categoryColor(poi.category) }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl">{poi.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{categoryLabel(poi.category, lang)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <InfoRow label={t('place.address')} value={poi.address} empty={t('place.noAddress')} />
          <InfoRow
            label={t('place.phone')}
            value={poi.phone}
            empty={t('place.noPhone')}
            href={poi.phone ? `tel:${poi.phone.replace(/[^\d+]/g, '')}` : undefined}
          />
          <InfoRow label={t('place.hours')} value={poi.openingHours} empty={t('place.noHours')} />
          <InfoRow
            label={t('place.website')}
            value={poi.url}
            empty={t('place.noWebsite')}
            href={poi.url}
          />
          <div className="text-muted-foreground pt-1 text-xs">
            {poi.lat.toFixed(6)}, {poi.lon.toFixed(6)}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={navigationUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-primary text-primary-foreground hover:bg-primary/90 touch-target inline-flex h-11 items-center justify-center rounded-md px-4 text-base font-medium"
        >
          🧭 {t('place.navigate')}
        </a>
        {poi.phone ? (
          <a
            href={`tel:${poi.phone.replace(/[^\d+]/g, '')}`}
            className="border-border bg-background hover:bg-muted touch-target inline-flex h-11 items-center justify-center rounded-md border px-4 text-base font-medium"
          >
            ☎ {t('place.call')}
          </a>
        ) : (
          <Button variant="outline" className="h-11" onClick={share}>
            🔗 {t('place.share')}
          </Button>
        )}
      </div>
      {poi.phone ? (
        <Button variant="outline" className="h-11 w-full" onClick={share}>
          🔗 {t('place.share')}
        </Button>
      ) : null}

      {saved ? (
        <Alert>
          <AlertDescription>{t('place.correctionSaved')}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('place.source')}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-1 text-xs">
          <div>
            {t('common.dataSource')}: OSM ({poi.id})
          </div>
          {verifiedAt && (
            <div>
              {t('place.verifiedAt')}: {verifiedAt}
            </div>
          )}
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline">
              {sourceUrl}
            </a>
          )}
          <p className="pt-2 text-amber-700 dark:text-amber-400">{t('place.verifyFirst')}</p>
        </CardContent>
      </Card>

      {!showForm ? (
        <Button variant="ghost" className="w-full text-sm" onClick={() => setShowForm(true)}>
          ⚠ {t('place.reportWrong')}
        </Button>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('place.reportWrong')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs">
              <span className="mb-1 block">{t('place.reason')}</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as PlaceCorrection['reason'])}
                className="border-border bg-background h-10 w-full rounded-md border px-3 text-sm"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(`place.${r.key}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block">{t('place.note')}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
                placeholder={t('place.notePlaceholder')}
              />
            </label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1" disabled={busy} onClick={submitCorrection}>
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/nearby" className="text-primary block pt-2 text-center text-sm underline">
        ← {t('common.back')}
      </Link>
    </div>
  );
}

function InfoRow({
  label,
  value,
  empty,
  href,
}: {
  label: string;
  value?: string;
  empty: string;
  href?: string;
}) {
  const shown = value ? value : empty;
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      {href ? (
        <a href={href} className="text-primary break-words underline">
          {shown}
        </a>
      ) : (
        <span className="break-words">{shown}</span>
      )}
    </div>
  );
}
