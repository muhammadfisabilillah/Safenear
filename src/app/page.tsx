'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { prefsStore } from '@/lib/prefs/store';
import type { CountryProfile } from '@/lib/poi/types';
import { loadCountryProfiles } from '@/lib/prefs/profiles';
import { HOST_COUNTRIES, bundleIdFromCity, citiesForHost } from '@/lib/prefs/hostCountries';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OnboardingPageWrapper() {
  const { t } = useTranslation();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">{t('common.loading')}</div>
      }
    >
      <OnboardingPage />
    </Suspense>
  );
}

function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSettings = searchParams.get('from') === 'settings';

  const [profiles, setProfiles] = useState<CountryProfile[]>([]);
  const [step, setStep] = useState(1);
  const [nationality, setNationality] = useState('');
  const [hostCountry, setHostCountry] = useState('');
  const [city, setCity] = useState('');
  const [cityBundleId, setCityBundleId] = useState('');
  const [language, setLanguage] = useState('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const data = await loadCountryProfiles();
        setProfiles(data);
        const saved = await prefsStore.get();
        if (saved && !fromSettings) {
          router.replace('/map');
          return;
        }
        if (saved) {
          setNationality(saved.nationality);
          setHostCountry(saved.hostCountry);
          setCity(saved.city || '');
          setCityBundleId(
            saved.cityBundleId || bundleIdFromCity(saved.hostCountry, saved.city) || '',
          );
          setLanguage(saved.language);
        } else {
          setLanguage(i18n.language);
        }
      } catch {
        setError(t('errors.generic'));
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, fromSettings, i18n.language, t]);

  const citiesForSelectedHost = hostCountry ? citiesForHost(hostCountry) : [];

  const handleNext = async () => {
    if (step === 1 && !nationality) {
      setError(t('onboarding.selectNationality'));
      return;
    }
    if (step === 2 && !hostCountry) {
      setError(t('onboarding.selectHostCountry'));
      return;
    }
    if (step === 3 && !city && citiesForSelectedHost.length > 0) {
      setError(t('onboarding.selectCity'));
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleFinish = async () => {
    if (!nationality || !hostCountry) return;
    try {
      await prefsStore.set({
        id: 'user-prefs',
        nationality,
        hostCountry,
        city: city || undefined,
        cityBundleId: cityBundleId || undefined,
        language,
        onboarded: true,
        updatedAt: new Date().toISOString(),
      });
      router.replace('/map');
      router.refresh();
    } catch {
      setError(t('errors.generic'));
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-primary animate-pulse text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="safe-area-inset flex min-h-screen flex-col">
      <header className="border-border bg-card border-b p-4">
        <h1 className="text-center text-xl font-semibold">{t('common.appName')}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t('onboarding.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('onboarding.subtitle')}</p>
          </div>

          <div
            className="mb-6 flex gap-2"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={4}
          >
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {step === 1 && t('onboarding.stepNationality')}
                {step === 2 && t('onboarding.stepHostCountry')}
                {step === 3 && t('onboarding.stepCity')}
                {step === 4 && t('onboarding.stepLanguage')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <>
                  <Select
                    value={nationality}
                    onValueChange={setNationality}
                    placeholder={t('onboarding.selectNationality')}
                    options={profiles.map((p) => ({ value: p.iso, label: `${p.flag} ${p.name}` }))}
                  />
                  <p className="text-muted-foreground text-xs">{t('onboarding.nationalityHelp')}</p>
                </>
              )}

              {step === 2 && (
                <Select
                  value={hostCountry}
                  onValueChange={(v) => {
                    setHostCountry(v);
                    setCity('');
                    setCityBundleId('');
                  }}
                  placeholder={t('onboarding.selectHostCountry')}
                  options={HOST_COUNTRIES.map((c) => ({
                    value: c.iso,
                    label: `${c.flag} ${c.name}`,
                  }))}
                />
              )}

              {step === 3 && (
                <>
                  {citiesForSelectedHost.length > 0 ? (
                    <>
                      <Select
                        value={city}
                        onValueChange={(v) => {
                          setCity(v);
                          setCityBundleId(
                            citiesForSelectedHost.find((c) => c.label === v)?.bundleId ?? '',
                          );
                        }}
                        placeholder={t('onboarding.selectCity')}
                        options={citiesForSelectedHost.map((c) => ({
                          value: c.label,
                          label: c.hasBundle
                            ? c.label
                            : `${c.label} (${t('onboarding.noDataYet')})`,
                        }))}
                      />
                      {city && !citiesForSelectedHost.find((c) => c.label === city)?.hasBundle ? (
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          {t('onboarding.noDataYet')}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-muted-foreground py-4 text-center">
                      <p>{t('onboarding.cityHelp')}</p>
                      <Button variant="outline" className="mt-2" onClick={() => setCity('')}>
                        {t('onboarding.skipForNow')}
                      </Button>
                    </div>
                  )}
                  <p className="text-muted-foreground text-xs">{t('onboarding.cityHelp')}</p>
                </>
              )}

              {step === 4 && (
                <Select
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v);
                    changeLanguage(v);
                  }}
                  placeholder={t('onboarding.selectLanguage')}
                  options={[
                    { value: 'id', label: 'Bahasa Indonesia' },
                    { value: 'en', label: 'English' },
                  ]}
                />
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep(step - 1);
                  setError(null);
                }}
              >
                {t('common.back')}
              </Button>
            )}
            {step < 4 ? (
              <Button className="flex-1" onClick={handleNext}>
                {t('common.next')}
              </Button>
            ) : (
              <Button className="flex-1" onClick={handleFinish}>
                {t('onboarding.finish')}
              </Button>
            )}
          </div>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            {t('common.disclaimerEmergency')}
          </p>
        </div>
      </main>
    </div>
  );
}

function changeLanguage(lng: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('safe-near-lang', lng);
    window.location.reload();
  }
}
