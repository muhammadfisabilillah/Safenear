'use client';

import { useTranslation } from 'react-i18next';
import type { Category } from '@/lib/poi/types';
import { CATEGORY_STYLES } from '@/lib/map/config';

export interface CategoryChipsProps {
  active: Category[] | null;
  onChange: (next: Category[] | null) => void;
}

/**
 * Chip kategori untuk filter marker.
 * null / [] = semua kategori aktif.
 */
export function CategoryChips({ active, onChange }: CategoryChipsProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('id') ? 'id' : 'en';

  const toggle = (category: Category) => {
    const current = active ?? [];
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange(next.length === 0 ? null : next);
  };

  const allActive = !active || active.length === 0;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t('map.categories')}>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={allActive}
        className={`touch-target rounded-full border px-3 py-1.5 text-sm transition-colors ${
          allActive
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-background text-foreground hover:bg-muted'
        }`}
      >
        {t('map.all')}
      </button>

      {CATEGORY_STYLES.map((s) => {
        const isActive = !allActive && active!.includes(s.category);
        return (
          <button
            key={s.category}
            type="button"
            onClick={() => toggle(s.category)}
            aria-pressed={Boolean(isActive)}
            className={`touch-target flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? 'border-transparent text-white'
                : 'border-border bg-background text-foreground hover:bg-muted'
            }`}
            style={isActive ? { backgroundColor: s.color, borderColor: s.color } : undefined}
          >
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full border border-white/70"
              style={{ backgroundColor: s.color }}
            />
            {lang === 'id' ? s.labelId : s.labelEn}
          </button>
        );
      })}
    </div>
  );
}
