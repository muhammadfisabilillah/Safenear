// SAFE NEAR — konten kartu hak (offline) + saluran kedaulatan.
// Sumber: PROJECT_CONTEXT.md §11.8 & §23; profil di data/profiles.

import type { CountryProfile } from '@/lib/poi/types';
import { getProfile } from '@/lib/prefs/profiles';

export interface RightsCard {
  id: string;
  titleId: string;
  titleEn: string;
  bodyId: string;
  scriptEn?: string;
  source: string;
}

/** Kartu hak generik (dipakai bila profil negara belum punya rightsNotes). */
export const GENERIC_RIGHTS_CARDS: readonly RightsCard[] = [
  {
    id: 'arrested',
    titleId: 'Ditangkap / Ditahan',
    titleEn: 'Arrested / Detained',
    bodyId:
      "Pasal 36 Konvensi Wina 1963: otoritas wajib memberitahu Anda 'tanpa penundaan' hak untuk menghubungi konsulat negara Anda. Anda berhak dihubungi dan dikunjungi konsuler.",
    scriptEn:
      'I am an Indonesian citizen. I invoke my right to contact my consulate under Article 36 of the Vienna Convention on Consular Relations.',
    source:
      'Vienna Convention on Consular Relations (1963), UN — https://legal.un.org/avl///ha/vccr/vccr.html',
  },
  {
    id: 'harassed',
    titleId: 'Diganggu di Ruang Publik',
    titleEn: 'Harassed in Public',
    bodyId:
      'Anda berhak merasa aman di ruang publik. Catat kejadian (waktu, tempat, deskripsi) dan simpan bukti. Hubungi polisi bila ada tindak kejahatan; hubungi kedutaan untuk bantuan konsuler.',
    scriptEn: 'I am being harassed. I would like to report this incident and ask for assistance.',
    source: 'Panduan keselamatan warga asing (SAFE NEAR) — bukan nasihat hukum.',
  },
];

/** Gabungkan rightsNotes profil menjadi kartu (fallback ke kartu generik). */
export function rightsCardsFor(profile: CountryProfile | undefined): RightsCard[] {
  if (profile && profile.rightsNotes.length > 0) {
    return profile.rightsNotes.map((n, i) => ({
      id: `profile-${i}`,
      titleId: n.title,
      titleEn: n.title,
      bodyId: n.body,
      source: n.source,
    }));
  }
  return [...GENERIC_RIGHTS_CARDS];
}

export interface ChannelView {
  label: string;
  kind: 'phone' | 'email' | 'web' | 'chat';
  value: string;
  href?: string;
  note?: string;
}

/** Ubah sovereign channel menjadi href yang bisa dipakai tombol. */
export function channelHref(kind: ChannelView['kind'], value: string): string | undefined {
  switch (kind) {
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
    case 'email':
      return `mailto:${value}`;
    case 'web':
      return /^https?:\/\//.test(value) ? value : `https://${value}`;
    case 'chat':
      return /^https?:\/\//.test(value) ? value : undefined;
    default:
      return undefined;
  }
}

export function channelsFor(nationality: string): ChannelView[] {
  const profile = getProfile(nationality.toUpperCase());
  return (profile?.sovereignChannels ?? []).map((c) => ({
    label: c.label,
    kind: c.kind,
    value: c.value,
    href: channelHref(c.kind, c.value),
    note: c.note ?? c.hours,
  }));
}

export function nationalityName(nationality: string): string {
  return getProfile(nationality.toUpperCase())?.name ?? nationality.toUpperCase();
}
