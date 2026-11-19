import type { CountryProfile } from '@/lib/poi/types';
import ID_RAW from '../../../data/profiles/ID.json';
import PH_RAW from '../../../data/profiles/PH.json';
import BD_RAW from '../../../data/profiles/BD.json';
import NP_RAW from '../../../data/profiles/NP.json';

const PROFILES: CountryProfile[] = [
  ID_RAW as CountryProfile,
  PH_RAW as CountryProfile,
  BD_RAW as CountryProfile,
  NP_RAW as CountryProfile,
];

export async function loadCountryProfiles(): Promise<CountryProfile[]> {
  return PROFILES;
}

export function getProfile(iso: string): CountryProfile | undefined {
  return PROFILES.find((p) => p.iso === iso);
}

export function getSovereignChannels(iso: string): CountryProfile['sovereignChannels'] {
  return getProfile(iso)?.sovereignChannels || [];
}

export function getRightsNotes(iso: string): CountryProfile['rightsNotes'] {
  return getProfile(iso)?.rightsNotes || [];
}

export function getConsulateQuery(iso: string): string {
  const strategy = getProfile(iso)?.consulateStrategy;
  if (strategy && strategy.osmQuery) {
    return strategy.osmQuery;
  }
  return 'nwr["amenity"="embassy"]["country"="XX"]';
}
