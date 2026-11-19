'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { prefsStore } from '@/lib/prefs/store';
import { channelsFor, nationalityName, rightsCardsFor } from '@/lib/rights/content';
import { getProfile } from '@/lib/prefs/profiles';
import { RightsView } from '@/components/rights/RightsView';

export default function RightsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [nationality, setNationality] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const prefs = await prefsStore.get();
      if (!prefs) {
        router.replace('/');
        return;
      }
      if (!alive) return;
      setNationality(prefs.nationality);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  if (!nationality) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-3 pb-8">
      <h1 className="mb-3 text-lg font-semibold">{t('rights.title')}</h1>
      <RightsView
        nationality={nationality}
        nationalityLabel={nationalityName(nationality)}
        cards={rightsCardsFor(getProfile(nationality))}
        channels={channelsFor(nationality)}
      />
    </div>
  );
}
