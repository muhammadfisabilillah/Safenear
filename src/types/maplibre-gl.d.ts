// Deklarasi tipe minimal untuk `maplibre-gl` v4.
//
// Alasan: maplibre-gl@4.7.1 menunjuk `types` ke `dist/maplibre-gl.d.ts` yang
// TIDAK disertakan di paket (bug upstream), sehingga TS strict gagal.
// Kami mendeklarasikan only API yang dipakai proyek (boundary terjustifikasi).
// Bila nanti paket maplibre menyertakan tipe resmi, file ini bisa dihapus.

declare module '*.css';

declare module 'maplibre-gl' {
  import type { Feature, FeatureCollection, Geometry } from 'geojson';
  export type LngLatLike = { lng: number; lat: number } | [number, number];

  export interface MapOptions {
    container?: string | HTMLElement;
    style?: unknown;
    center?: LngLatLike;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    attributionControl?: boolean | { compact?: boolean };
    collectTimingStats?: boolean;
    [key: string]: unknown;
  }

  export type MapEventType =
    | 'load'
    | 'error'
    | 'click'
    | 'idle'
    | 'moveend'
    | 'zoomend'
    | 'style.load'
    | 'data'
    | 'sourcedata';

  export interface MapMouseEvent {
    lngLat: { lng: number; lat: number };
    point: { x: number; y: number };
    originalEvent: MouseEvent;
    target: Map;
    features?: MapFeature[];
  }

  export interface MapFeature {
    id?: string | number;
    type: 'Feature';
    geometry: Geometry;
    properties: Record<string, unknown> | null;
    layer?: Record<string, unknown>;
    source?: string;
    sourceLayer?: string;
    toGeoJSON(): Feature;
  }

  export interface MapEvent {
    type: string;
    target: Map;
    originalEvent?: Event;
  }

  export interface GeoJSONSource {
    setData(data: FeatureCollection | Feature | string): this;
    type: 'geojson';
  }

  export interface SourceSpecification {
    type: string;
    [key: string]: unknown;
  }

  export interface GeoJSONSourceSpecification extends SourceSpecification {
    type: 'geojson';
    data?: FeatureCollection | Feature | string;
    cluster?: boolean;
    clusterRadius?: number;
  }

  export interface LayoutSpecification {
    [key: string]: unknown;
  }

  export interface PaintSpecification {
    [key: string]: unknown;
  }

  export interface CircleLayerSpecification {
    id: string;
    type: 'circle';
    source: string;
    filter?: unknown;
    layout?: LayoutSpecification;
    paint?: PaintSpecification;
    minzoom?: number;
    maxzoom?: number;
  }

  export interface SymbolLayerSpecification {
    id: string;
    type: 'symbol';
    source: string;
    filter?: unknown;
    layout?: LayoutSpecification;
    paint?: PaintSpecification;
    minzoom?: number;
    maxzoom?: number;
  }

  export type LayerSpecification = CircleLayerSpecification | SymbolLayerSpecification;

  export interface FitBoundsOptions {
    padding?: number | { top: number; bottom: number; left: number; right: number };
    duration?: number;
    maxZoom?: number;
  }

  export class Map {
    constructor(options: MapOptions);
    on(type: MapEventType | string, listener: (e: MapEvent | MapMouseEvent) => void): this;
    on(type: MapEventType | string, layerId: string, listener: (e: MapMouseEvent) => void): this;
    once(type: MapEventType | string, listener: (e: MapEvent | MapMouseEvent) => void): this;
    off(type: MapEventType | string, listener: (e: MapEvent | MapMouseEvent) => void): this;
    remove(): void;
    addControl(control: unknown, position?: string): this;
    removeControl(control: unknown): this;
    addSource(id: string, source: SourceSpecification): this;
    removeSource(id: string): this;
    getSource(id: string): GeoJSONSource | undefined;
    addLayer(layer: LayerSpecification, beforeId?: string): this;
    removeLayer(id: string): this;
    getLayer(id: string): LayerSpecification | undefined;
    setFilter(layerId: string, filter?: unknown): this;
    setLayoutProperty(layerId: string, name: string, value: unknown): this;
    setPaintProperty(layerId: string, name: string, value: unknown): this;
    setCenter(center: LngLatLike): this;
    setZoom(zoom: number): this;
    jumpTo(options: { center?: LngLatLike; zoom?: number }): this;
    fitBounds(bounds: [number, number, number, number], options?: FitBoundsOptions): this;
    project(lngLat: LngLatLike): { x: number; y: number };
    unproject(point: { x: number; y: number }): { lng: number; lat: number };
    queryRenderedFeatures(
      pointOrBox?: { x: number; y: number } | [{ x: number; y: number }, { x: number; y: number }],
      options?: { layers?: string[] },
    ): MapFeature[];
    getCanvas(): HTMLCanvasElement;
    loaded(): boolean;
    isStyleLoaded(): boolean;
    getStyle(): unknown;
    setStyle(style: unknown, options?: unknown): this;
  }

  export class NavigationControl {
    constructor(options?: { showCompass?: boolean; showZoom?: boolean; visualizePitch?: boolean });
  }

  export class GeolocateControl {
    constructor(options?: {
      positionOptions?: PositionOptions;
      trackUserLocation?: boolean;
      fitBoundsOptions?: FitBoundsOptions;
    });
    trigger(): void;
    on(type: string, listener: (e: unknown) => void): this;
    off(type: string, listener: (e: unknown) => void): this;
  }

  export interface PopupOptions {
    closeButton?: boolean;
    closeOnClick?: boolean;
    offset?: number | { [key: string]: [number, number] };
    className?: string;
    maxWidth?: string;
    anchor?: string;
  }

  export class Popup {
    constructor(options?: PopupOptions);
    setLngLat(lngLat: LngLatLike): this;
    setText(text: string): this;
    setHTML(html: string): this;
    setDOMContent(node: Node): this;
    addTo(map: Map): this;
    remove(): this;
    isOpen(): boolean;
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    anchor?: string;
    offset?: [number, number];
    color?: string;
    scale?: number;
    draggable?: boolean;
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lngLat: LngLatLike): this;
    addTo(map: Map): this;
    remove(): this;
    getElement(): HTMLElement;
    togglePopup(): this;
    setPopup(popup: Popup | null): this;
  }

  export function setWorkerUrl(url: string): void;
  export function getVersion(): string;
  export function setRTLTextPlugin(url: string, callback: (err?: Error) => void): void;
}
