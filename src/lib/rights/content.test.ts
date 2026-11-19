import { describe, it, expect } from 'vitest';
import {
  GENERIC_RIGHTS_CARDS,
  channelHref,
  channelsFor,
  nationalityName,
  rightsCardsFor,
} from './content';
import { getProfile } from '@/lib/prefs/profiles';

describe('GENERIC_RIGHTS_CARDS', () => {
  it('2 kartu: ditangkap & diganggu', () => {
    expect(GENERIC_RIGHTS_CARDS.map((c) => c.id)).toEqual(['arrested', 'harassed']);
  });
  it('kartu punya sumber', () => {
    for (const c of GENERIC_RIGHTS_CARDS) expect(c.source.length).toBeGreaterThan(0);
  });
  it('kartu ditangkap menyebut Pasal 36', () => {
    expect(GENERIC_RIGHTS_CARDS[0].bodyId).toContain('Pasal 36');
    expect(GENERIC_RIGHTS_CARDS[0].scriptEn).toContain('Article 36');
  });
});

describe('rightsCardsFor', () => {
  it('profil ada -> pakai rightsNotes profil', () => {
    const cards = rightsCardsFor(getProfile('ID'));
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].bodyId).toContain('Pasal 36');
  });
  it('profil tidak ada -> fallback generik', () => {
    expect(rightsCardsFor(undefined)).toEqual(GENERIC_RIGHTS_CARDS);
  });
});

describe('channelHref', () => {
  it('phone -> tel:', () => {
    expect(channelHref('phone', '+62-812-9007-0027')).toBe('tel:+6281290070027');
  });
  it('email -> mailto:', () => {
    expect(channelHref('email', 'a@b.org')).toBe('mailto:a@b.org');
  });
  it('web -> https', () => {
    expect(channelHref('web', 'peduliwni.kemlu.go.id')).toBe('https://peduliwni.kemlu.go.id');
    expect(channelHref('web', 'https://x.org')).toBe('https://x.org');
  });
  it('chat tanpa URL -> undefined', () => {
    expect(channelHref('chat', 'wa.me')).toBeUndefined();
  });
});

describe('channelsFor', () => {
  it('ID punya hotline Peduli WNI', () => {
    const ch = channelsFor('ID');
    expect(ch.length).toBeGreaterThan(0);
    expect(ch.some((c) => c.label.includes('Peduli WNI'))).toBe(true);
  });
  it('negara tak dikenal -> kosong', () => {
    expect(channelsFor('ZZ')).toEqual([]);
  });
});

describe('nationalityName', () => {
  it('ID -> Indonesia', () => {
    expect(nationalityName('ID')).toBe('Indonesia');
  });
  it('tak dikenal -> kode', () => {
    expect(nationalityName('ZZ')).toBe('ZZ');
  });
});
