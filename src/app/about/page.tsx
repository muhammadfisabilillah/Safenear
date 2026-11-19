'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MAP_ATTRIBUTION } from '@/lib/map/config';
import { PILOT_CITIES } from '@/lib/prefs/hostCountries';

const OSM = 'https://www.openstreetmap.org/copyright';
const OFM = 'https://openfreemap.org/';
const OVERPASS = 'https://wiki.openstreetmap.org/wiki/Overpass_API';
const EMERGENCY = 'https://emergencynumberapi.com/';
const VCCR = 'https://legal.un.org/avl///ha/vccr/vccr.html';
const KEMLU = 'https://peduliwni.kemlu.go.id/';

export default function AboutPage() {
  const { t } = useTranslation();

  const cityCount = Object.values(PILOT_CITIES).flat().length;

  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3 pb-8">
      <h1 className="text-lg font-semibold">{t('about.title')}</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('about.version')}: 0.1.0</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="text-muted-foreground">{t('about.description')}</p>
          <p className="text-muted-foreground text-xs">
            {t('about.pilot')}: {cityCount}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('about.attributions')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Attribution href={OSM} label={t('about.osm')} />
          <Attribution href={OFM} label={t('about.openfreemap')} />
          <Attribution href={OVERPASS} label={t('about.overpass')} />
          <Attribution href={EMERGENCY} label={t('about.emergencyNumbers')} />
          <Attribution href={VCCR} label={t('about.rightsContent')} />
          <Attribution href={KEMLU} label="Kemenlu PWNI — Peduli WNI" />
          <p className="text-muted-foreground text-xs">{MAP_ATTRIBUTION}</p>
          <p className="text-muted-foreground text-xs">{t('about.codeLicense')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('about.disclaimer')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs">{t('common.disclaimerLegal')}</p>
        </CardContent>
      </Card>

      <Link href="/settings" className="text-primary block pt-2 text-center text-sm underline">
        ← {t('common.settings')}
      </Link>
    </div>
  );
}

function Attribution({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary block break-all text-xs underline"
    >
      {label}
    </a>
  );
}
