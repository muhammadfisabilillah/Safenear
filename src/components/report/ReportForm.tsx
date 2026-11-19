'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, EvidenceRef } from '@/lib/poi/types';
import { CATEGORY_ORDER, categoryLabel } from '@/lib/map/config';
import { getCurrentPosition } from '@/lib/map/geolocation';
import { createReport, saveReport, type NewReportInput } from '@/lib/report/store';
import { evidenceStore } from '@/lib/prefs/store';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ReportFormProps {
  onSaved: (id: string) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface WitnessRow {
  name: string;
  contact: string;
}

export function ReportForm({ onSaved }: ReportFormProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  const [category, setCategory] = useState<Category>('police');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [description, setDescription] = useState('');
  const [witnesses, setWitnesses] = useState<WitnessRow[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRef[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const locate = useCallback(async () => {
    try {
      const pos = await getCurrentPosition({ timeoutMs: 8000 });
      setLat(pos.lat.toFixed(6));
      setLon(pos.lon.toFixed(6));
      setLocationLabel(t('nearby.fromGps'));
    } catch {
      setError(t('map.gpsError'));
    }
  }, [t]);

  useEffect(() => {
    void locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addWitness = () => setWitnesses((rows) => [...rows, { name: '', contact: '' }]);
  const updateWitness = (index: number, patch: Partial<WitnessRow>) =>
    setWitnesses((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const removeWitness = (index: number) =>
    setWitnesses((rows) => rows.filter((_, i) => i !== index));

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: EvidenceRef[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`${t('report.maxSize')} — ${file.name}`);
        continue;
      }
      const data = await file.arrayBuffer();
      const key = `ev/${crypto.randomUUID()}`;
      await evidenceStore.put(key, data, file.type || 'application/octet-stream');
      added.push({
        id: crypto.randomUUID(),
        kind: file.type.startsWith('image/') ? 'photo' : 'file',
        name: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        storageKey: key,
      });
    }
    setEvidence((prev) => [...prev, ...added]);
  };

  const removeEvidence = (id: string) => setEvidence((prev) => prev.filter((e) => e.id !== id));

  const submit = async () => {
    setError(null);
    if (!description.trim()) {
      setError(t('report.validation.descriptionRequired'));
      return;
    }
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      setError(t('report.validation.locationRequired'));
      return;
    }

    const input: NewReportInput = {
      category,
      occurredAt: new Date(occurredAt).toISOString(),
      location: {
        lat: latNum,
        lon: lonNum,
        ...(locationLabel ? { label: locationLabel } : {}),
      },
      description: description.trim(),
      witnesses: witnesses
        .map((w) => ({
          ...(w.name.trim() ? { name: w.name.trim() } : {}),
          ...(w.contact.trim() ? { contact: w.contact.trim() } : {}),
        }))
        .filter((w) => w.name || w.contact),
      evidence,
    };

    setBusy(true);
    try {
      const report = createReport(input);
      await saveReport(report);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      onSaved(report.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    'border-border bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-2 focus:ring-offset-1';

  return (
    <div className="space-y-3">
      {savedMsg ? (
        <Alert>
          <AlertDescription>{t('report.saved')}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.category')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('report.category')}>
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={c === category}
                className={`touch-target rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  c === category
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {categoryLabel(c, lang)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.time')}</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className={inputCls}
            aria-label={t('report.time')}
          />
          <button
            type="button"
            className="text-primary mt-2 text-xs underline"
            onClick={() => setOccurredAt(new Date().toISOString().slice(0, 16))}
          >
            {t('report.now')}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.location')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs">
              <span className="mb-1 block">Latitude</span>
              <input
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block">Longitude</span>
              <input
                type="number"
                step="0.000001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
          <label className="block text-xs">
            <span className="mb-1 block">{t('report.locationLabel')}</span>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              className={inputCls}
              placeholder="Jl. Contoh, Houston"
            />
          </label>
          <Button variant="outline" size="sm" onClick={locate}>
            📍 {t('report.useCurrent')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.description')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
            placeholder={t('report.descriptionPlaceholder')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.witnesses')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {witnesses.map((w, i) => (
            <div key={i} className="flex items-end gap-2">
              <label className="flex-1 text-xs">
                <span className="mb-1 block">{t('report.witnessName')}</span>
                <input
                  type="text"
                  value={w.name}
                  onChange={(e) => updateWitness(i, { name: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="flex-1 text-xs">
                <span className="mb-1 block">{t('report.witnessContact')}</span>
                <input
                  type="text"
                  value={w.contact}
                  onChange={(e) => updateWitness(i, { contact: e.target.value })}
                  className={inputCls}
                />
              </label>
              <button
                type="button"
                onClick={() => removeWitness(i)}
                className="text-destructive touch-target text-xs underline"
                aria-label={t('common.delete')}
              >
                {t('common.delete')}
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addWitness}>
            + {t('report.addWitness')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('report.evidence')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void onPickFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            📷 {t('report.addPhoto')}
          </Button>
          <p className="text-muted-foreground text-xs">{t('report.maxSize')} · lokal saja</p>
          {evidence.length > 0 ? (
            <ul className="space-y-1">
              {evidence.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate">
                    {e.name} ({(e.size / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEvidence(e.id)}
                    className="text-destructive touch-target underline"
                    aria-label={t('common.delete')}
                  >
                    {t('common.delete')}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Button className="h-12 w-full text-base" disabled={busy} onClick={submit}>
        {busy ? t('report.saving') : t('report.submit')}
      </Button>
    </div>
  );
}
