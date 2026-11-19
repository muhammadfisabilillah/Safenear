// SAFE NEAR — spec source & layer MapLibre untuk POI dan posisi user.
// Dipisah dari komponen agar bisa di-test tanpa WebGL.

import type {
  CircleLayerSpecification,
  GeoJSONSourceSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import type { Category, Poi } from '@/lib/poi/types';
import type { PoiFeatureCollection } from './poiGeoJson';

export const POI_SOURCE_ID = 'safe-near-poi';
export const POI_LAYER_ID = 'safe-near-poi-circle';
export const POI_LABEL_LAYER_ID = 'safe-near-poi-label';
export const USER_SOURCE_ID = 'safe-near-user';
export const USER_LAYER_ID = 'safe-near-user-dot';

export function poiSourceSpec(data: PoiFeatureCollection): GeoJSONSourceSpecification {
  return { type: 'geojson', data };
}

export function poiCircleLayer(active: readonly Category[] | null): CircleLayerSpecification {
  const layer: CircleLayerSpecification = {
    id: POI_LAYER_ID,
    type: 'circle',
    source: POI_SOURCE_ID,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 5, 14, 8, 18, 12],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.95,
    },
  };
  if (active && active.length > 0) {
    layer.filter = ['in', ['get', 'category'], ['literal', [...active]]];
  }
  return layer;
}

/** Label nama di atas marker (hanya zoom tinggi agar tidak ramai). */
export function poiLabelLayer(active: readonly Category[] | null): SymbolLayerSpecification {
  const layer: SymbolLayerSpecification = {
    id: POI_LABEL_LAYER_ID,
    type: 'symbol',
    source: POI_SOURCE_ID,
    minzoom: 14,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 11,
      'text-offset': [0, 1.4],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#0f172a',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  };
  if (active && active.length > 0) {
    layer.filter = ['in', ['get', 'category'], ['literal', [...active]]];
  }
  return layer;
}

export function userSourceSpec(lat: number, lon: number): GeoJSONSourceSpecification {
  return {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lon, lat] },
          properties: { kind: 'user' },
        },
      ],
    },
  };
}

export function userCircleLayer(): CircleLayerSpecification {
  return {
    id: USER_LAYER_ID,
    type: 'circle',
    source: USER_SOURCE_ID,
    paint: {
      'circle-radius': 9,
      'circle-color': '#0ea5e9',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
    },
  };
}

/** Cari POI dari properti fitur (hasil event klik MapLibre). */
export function poiIdFromFeatureProps(props: Record<string, unknown> | undefined): string | null {
  const id = props?.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

/** Ringkasan POI untuk popup (ramah, tanpa HTML berbahaya). */
export function popupText(poi: Poi): string {
  const lines = [poi.name];
  if (poi.address) lines.push(poi.address);
  if (poi.phone) lines.push(`Tel: ${poi.phone}`);
  return lines.join('\n');
}
