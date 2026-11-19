'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { CountryProfile } from '@/lib/poi/types';
import { loadCountryProfiles } from '@/lib/prefs/profiles';
import { prefsStore, clearAllData } from '@/lib/prefs/store';
import { HOST_COUNTRIES, citiesForHost, type PilotCity } from '@/lib/prefs/hostCountries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [profiles, setProfiles] = useState<CountryProfile[]>([]);
  const [nationality, setNationality] = useState('');
  const [hostCountry, setHostCountry] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('id');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await loadCountryProfiles();
      const saved = await prefsStore.get();
      if (!alive) return;
      setProfiles(data);
      if (saved) {
        setNationality(saved.nationality);
        setHostCountry(saved.hostCountry);
        setCity(saved.city ?? '');
        setLanguage(saved.language);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cities: PilotCity[] = hostCountry ? citiesForHost(hostCountry) : [];
  const selectedCity = cities.find((c) => c.label === city);

  const save = async () => {
    if (!nationality || !hostCountry) return;
    setBusy(true);
    try {
      await prefsStore.set({
        id: 'user-prefs',
        nationality,
        hostCountry,
        city: city || undefined,
        cityBundleId: selectedCity?.bundleId,
        language,
        onboarded: true,
        updatedAt: new Date().toISOString(),
      });
      setMessage(t('settings.saved'));
      i18n.changeLanguage(language);
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setBusy(false);
    }
  };

  const wipe = async () => {
    setBusy(true);
    try {
      await clearAllData();
      setConfirmClear(false);
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-8">
      <h1 className="text-lg font-semibold">{t('settings.title')}</h1>

      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('settings.nationality')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={nationality}
            onValueChange={setNationality}
            placeholder={t('onboarding.selectNationality')}
            options={profiles.map((p) => ({ value: p.iso, label: `${p.flag} ${p.name}` }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('settings.hostCountry')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={hostCountry}
            onValueChange={(v) => {
              setHostCountry(v);
              setCity('');
            }}
            placeholder={t('onboarding.selectHostCountry')}
            options={HOST_COUNTRIES.map((c) => ({ value: c.iso, label: `${c.flag} ${c.name}` }))}
          />
          {cities.length > 0 ? (
            <Select
              value={city}
              onValueChange={setCity}
              placeholder={t('onboarding.selectCity')}
              options={cities.map((c) => ({
                value: c.label,
                label: c.hasBundle ? c.label : `${c.label} (${t('onboarding.noDataYet')})`,
              }))}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={language}
            onValueChange={setLanguage}
            placeholder={t('onboarding.selectLanguage')}
            options={[
              { value: 'id', label: 'Bahasa Indonesia' },
              { value: 'en', label: 'English' },
            ]}
          />
        </CardContent>
      </Card>

      <Button className="h-11 w-full" disabled={busy} onClick={save}>
        {t('common.save')}
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('settings.privacy')}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-1 text-xs">
          <p>{t('settings.privacyNote')}</p>
          <p>{t('common.disclaimerLegal')}</p>
        </CardContent>
      </Card>

      {!confirmClear ? (
        <Button
          variant="ghost"
          className="text-destructive w-full"
          onClick={() => setConfirmClear(true)}
        >
          🗑 {t('settings.deleteAllData')}
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-3 text-sm">{t('settings.deleteAllConfirm')}</p>
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

      <Link href="/about" className="text-primary block pt-2 text-center text-sm underline">
        {t('common.about')}
      </Link>
    </div>
  );
}
