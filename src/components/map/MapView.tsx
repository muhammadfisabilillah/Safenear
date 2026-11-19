'use client';

import { useEffect, useRef } from 'react';
import { Map, NavigationControl, GeolocateControl, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Category, Poi } from '@/lib/poi/types';
import type { MapCenter } from '@/lib/map/config';
import { MAP_STYLE_URL } from '@/lib/map/config';
import { poisToFeatureCollection } from '@/lib/map/poiGeoJson';
import {
  POI_LAYER_ID,
  POI_SOURCE_ID,
  USER_LAYER_ID,
  USER_SOURCE_ID,
  poiCircleLayer,
  poiLabelLayer,
  poiSourceSpec,
  userCircleLayer,
  userSourceSpec,
} from '@/lib/map/layerSpec';
import type { UserPosition } from '@/lib/map/geolocation';

export interface MapViewProps {
  center: MapCenter;
  pois: Poi[];
  activeCategories?: Category[] | null;
  userPosition?: UserPosition | null;
  onSelectPoi?: (poi: Poi) => void;
  className?: string;
}

/** Bangun node DOM popup (aman dari XSS: pakai textContent, bukan innerHTML). */
function buildPopupNode(poi: Poi): HTMLElement {
  const box = document.createElement('div');
  box.className = 'safe-near-popup';

  const title = document.createElement('div');
  title.className = 'font-semibold text-sm';
  title.textContent = poi.name;
  box.appendChild(title);

  if (poi.address) {
    const addr = document.createElement('div');
    addr.className = 'text-xs text-muted-foreground';
    addr.textContent = poi.address;
    box.appendChild(addr);
  }

  const link = document.createElement('a');
  link.href = `/place/${encodeURIComponent(poi.id)}`;
  link.className = 'mt-1 inline-block text-xs font-medium text-primary underline';
  link.textContent = 'Detail →';
  box.appendChild(link);

  return box;
}

/**
 * Peta MapLibre (client-only). Dirender via next/dynamic ssr:false di halaman.
 * POI digambar sebagai circle layer (tanpa aset ikon -> hemat & offline-friendly).
 */
export function MapView({
  center,
  pois,
  activeCategories = null,
  userPosition = null,
  onSelectPoi,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const poisRef = useRef<Poi[]>(pois);
  poisRef.current = pois;

  // Inisialisasi peta sekali.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new Map({
      container,
      style: MAP_STYLE_URL,
      center: [center.lon, center.lat],
      zoom: center.zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');

    const geolocate = new GeolocateControl({
      positionOptions: { enableHighAccuracy: false, timeout: 10_000 },
      trackUserLocation: false,
      fitBoundsOptions: { maxZoom: 15 },
    });
    map.addControl(geolocate, 'top-right');

    map.on('load', () => {
      map.addSource(POI_SOURCE_ID, poiSourceSpec(poisToFeatureCollection(poisRef.current)));
      map.addLayer(poiCircleLayer(activeCategories));
      map.addLayer(poiLabelLayer(activeCategories));

      if (userPosition) {
        map.addSource(USER_SOURCE_ID, userSourceSpec(userPosition.lat, userPosition.lon));
        map.addLayer(userCircleLayer());
      }

      map.on('click', POI_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        const poi = poisRef.current.find((p) => p.id === id);
        if (!poi) return;
        onSelectPoi?.(poi);
        popupRef.current?.remove();
        popupRef.current = new Popup({ closeButton: true, closeOnClick: false, maxWidth: '260px' })
          .setLngLat([poi.lon, poi.lat])
          .setDOMContent(buildPopupNode(poi))
          .addTo(map);
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update data POI.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource(POI_SOURCE_ID);
    if (source && 'setData' in source) {
      (source as { setData: (d: unknown) => void }).setData(poisToFeatureCollection(pois));
    }
  }, [pois]);

  // Update filter kategori.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const filter =
      activeCategories && activeCategories.length > 0
        ? ['in', ['get', 'category'], ['literal', [...activeCategories]]]
        : null;
    map.setFilter(POI_LAYER_ID, filter);
    map.setFilter('safe-near-poi-label', filter);
  }, [activeCategories]);

  // Update marker user.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource(USER_SOURCE_ID);
    if (!source) {
      if (userPosition) {
        map.addSource(USER_SOURCE_ID, userSourceSpec(userPosition.lat, userPosition.lon));
        map.addLayer(userCircleLayer());
      }
      return;
    }
    if (userPosition) {
      (source as { setData: (d: unknown) => void }).setData(
        userSourceSpec(userPosition.lat, userPosition.lon).data,
      );
      map.setPaintProperty(USER_LAYER_ID, 'circle-radius', 9);
    }
  }, [userPosition]);

  return <div ref={containerRef} className={className} aria-label="Peta" role="application" />;
}
