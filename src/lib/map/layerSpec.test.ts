import { describe, it, expect } from 'vitest';
import {
  POI_LAYER_ID,
  POI_SOURCE_ID,
  POI_LABEL_LAYER_ID,
  USER_LAYER_ID,
  USER_SOURCE_ID,
  poiCircleLayer,
  poiIdFromFeatureProps,
  poiLabelLayer,
  poiSourceSpec,
  popupText,
  userCircleLayer,
  userSourceSpec,
} from './layerSpec';
import { poisToFeatureCollection } from './poiGeoJson';
import type { Poi } from '@/lib/poi/types';

const poi: Poi = {
  id: 'osm:node/1',
  source: 'osm',
  category: 'police',
  name: 'Central Police',
  lat: 29.76,
  lon: -95.37,
  address: '1200 Travis St',
  phone: '+1-713-884-3131',
};

describe('poiSourceSpec', () => {
  it('type geojson + data feature collection', () => {
    const fc = poisToFeatureCollection([poi]);
    const spec = poiSourceSpec(fc);
    expect(spec.type).toBe('geojson');
    expect(spec.data).toEqual(fc);
  });
});

describe('poiCircleLayer', () => {
  it('id & source sesuai konstanta', () => {
    const l = poiCircleLayer(null);
    expect(l.id).toBe(POI_LAYER_ID);
    expect(l.source).toBe(POI_SOURCE_ID);
    expect(l.type).toBe('circle');
  });
  it('tanpa filter bila kategori null', () => {
    expect(poiCircleLayer(null).filter).toBeUndefined();
  });
  it('filter in-literal bila kategori aktif', () => {
    const filter = poiCircleLayer(['police', 'hospital']).filter as unknown[];
    expect(JSON.stringify(filter)).toContain('police');
    expect(JSON.stringify(filter)).toContain('hospital');
  });
  it('warna dari properti fitur', () => {
    expect(JSON.stringify(poiCircleLayer(null).paint)).toContain('color');
  });
});

describe('poiLabelLayer', () => {
  it('symbol + minzoom 14', () => {
    const l = poiLabelLayer(null);
    expect(l.id).toBe(POI_LABEL_LAYER_ID);
    expect(l.type).toBe('symbol');
    expect(l.minzoom).toBe(14);
  });
});

describe('user layers', () => {
  it('source & layer id', () => {
    const spec = userSourceSpec(29.76, -95.37);
    expect(spec.data).toMatchObject({
      features: [{ geometry: { coordinates: [-95.37, 29.76] } }],
    });
    expect(userCircleLayer().id).toBe(USER_LAYER_ID);
    expect(USER_SOURCE_ID).toBe('safe-near-user');
  });
});

describe('poiIdFromFeatureProps', () => {
  it('membaca id string', () => {
    expect(poiIdFromFeatureProps({ id: 'a' })).toBe('a');
  });
  it('null bila kosong/tidak ada', () => {
    expect(poiIdFromFeatureProps(undefined)).toBeNull();
    expect(poiIdFromFeatureProps({ id: '' })).toBeNull();
    expect(poiIdFromFeatureProps({ id: 1 })).toBeNull();
  });
});

describe('popupText', () => {
  it('nama + alamat + telepon', () => {
    expect(popupText(poi)).toBe('Central Police\n1200 Travis St\nTel: +1-713-884-3131');
  });
  it('hanya nama bila field kosong', () => {
    expect(popupText({ ...poi, address: undefined, phone: undefined })).toBe('Central Police');
  });
});
