'use client';

import { useTranslation } from 'react-i18next';
import type { ChannelView, RightsCard } from '@/lib/rights/content';

export interface RightsViewProps {
  nationality: string;
  nationalityLabel: string;
  cards: RightsCard[];
  channels: ChannelView[];
}

/** Kartu hak offline + tombol saluran kedaulatan. */
export function RightsView({ nationalityLabel, cards, channels }: RightsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {cards.map((card) => (
          <section
            key={card.id}
            className="border-border bg-card rounded-lg border p-4 shadow-sm"
            aria-labelledby={`rights-${card.id}`}
          >
            <h2 id={`rights-${card.id}`} className="text-base font-semibold">
              {card.titleId}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">{card.bodyId}</p>
            {card.scriptEn ? (
              <blockquote className="border-primary bg-muted mt-3 border-l-4 p-3 text-sm italic">
                “{card.scriptEn}”
              </blockquote>
            ) : null}
            <p className="text-muted-foreground mt-3 text-xs">
              {t('rights.source')}: {card.source}
            </p>
          </section>
        ))}
      </div>

      {channels.length > 0 ? (
        <section className="border-border bg-card rounded-lg border p-4 shadow-sm">
          <h2 className="text-base font-semibold">
            {t('rights.sovereignChannels')} — {nationalityLabel}
          </h2>
          <ul className="mt-2 space-y-2">
            {channels.map((c) => (
              <li key={`${c.kind}-${c.value}`} className="text-sm">
                <span className="block font-medium">{c.label}</span>
                {c.href ? (
                  <a href={c.href} className="text-primary touch-target break-all underline">
                    {c.value}
                  </a>
                ) : (
                  <span className="break-all">{c.value}</span>
                )}
                {c.note ? (
                  <span className="text-muted-foreground block text-xs">{c.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-muted-foreground px-1 pt-2 text-center text-xs">
        {t('rights.disclaimer')}
      </p>
    </div>
  );
}
