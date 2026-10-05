import React, { useCallback, useEffect, useRef } from "react";
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from "../../api/config";
import { useTheme } from "../../contexts/theme";
import type { AreaBoundary } from "../../types/crime";
import { cn } from "../../utils/cn";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "../../utils/constants";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  radius?: number;
  label?: string;
}

interface MapViewProps {
  points: MapPoint[];
  ariaLabel: string;
  boundaries?: AreaBoundary[];
  cluster?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  maxFitZoom?: number;
}

const CLUSTER_CELL_PX = 64;
const CLUSTER_MIN_POINTS = 200;

/** Renders backend-supplied coordinates only. Clustering is purely visual. */
export function MapView({
  points,
  ariaLabel,
  boundaries = [],
  cluster = false,
  selectedId = null,
  onSelect,
  className,
  maxFitZoom = 14,
}: MapViewProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerLayerRef = useRef<Array<google.maps.Marker>>([]);
  const boundaryLayerRef = useRef<google.maps.Data | null>(null);
  const stateRef = useRef({ points, cluster, selectedId });
  const onSelectRef = useRef(onSelect);
  stateRef.current = { points, cluster, selectedId };
  onSelectRef.current = onSelect;

  const clearMapLayers = useCallback(() => {
    markerLayerRef.current.forEach((marker) => marker.setMap(null));
    markerLayerRef.current = [];

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.forEach((feature) => boundaryLayerRef.current?.remove(feature));
    }
  }, []);

  const draw = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.google) return;

    clearMapLayers();

    const { points: all, cluster: clustering, selectedId: selected } = stateRef.current;
    const bounds = new google.maps.LatLngBounds();
    const visible = all.filter((p) => {
      const latLng = new google.maps.LatLng(p.lat, p.lng);
      return !!map.getBounds()?.contains(latLng);
    });

    const addPoint = (p: MapPoint) => {
      const isSelected = p.id === selected;
      const marker = new google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: (p.radius ?? 6) + (isSelected ? 3 : 0),
          fillColor: p.color,
          fillOpacity: 0.9,
          strokeColor: isSelected ? '#0d1527' : '#ffffff',
          strokeWeight: isSelected ? 3 : 1.5,
        },
        title: p.label,
      });
      marker.addListener('click', () => onSelectRef.current?.(p.id));
      markerLayerRef.current.push(marker);
      bounds.extend({ lat: p.lat, lng: p.lng });
    };

    if (clustering && visible.length > CLUSTER_MIN_POINTS && map.getZoom() < 16) {
      const cells = new Map<string, MapPoint[]>();
      visible.forEach((p) => {
        const projection = map.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToPoint(new google.maps.LatLng(p.lat, p.lng));
        const key = `${Math.floor(point.x / CLUSTER_CELL_PX)}:${Math.floor(point.y / CLUSTER_CELL_PX)}`;
        const bucket = cells.get(key);
        if (bucket) bucket.push(p);
        else cells.set(key, [p]);
      });

      cells.forEach((group) => {
        if (group.length === 1) {
          addPoint(group[0]);
          return;
        }

        const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
        const lng = group.reduce((s, p) => s + p.lng, 0) / group.length;
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          label: {
            text: String(group.length),
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 18 + Math.min(18, group.length * 1.2),
            fillColor: '#2456d6',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        marker.addListener('click', () => {
          map.setZoom(Math.min(map.getZoom() + 2, 18));
          map.setCenter({ lat, lng });
        });
        markerLayerRef.current.push(marker);
      });
    } else {
      visible.forEach(addPoint);
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 32, right: 32, bottom: 32, left: 32, maxZoom: maxFitZoom });
    }
  }, [clearMapLayers, maxFitZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !GOOGLE_MAPS_API_KEY) return;

    let cancelled = false;

    const loadMap = async () => {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['marker'],
      });

      try {
        await loader.load();
        if (cancelled || !container) return;

        const map = new google.maps.Map(container, {
          center: MAP_DEFAULT_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: theme === 'dark' ? [
            { elementType: 'geometry', stylers: [{ color: '#111827' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#f3f4f6' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          ] : undefined,
        });

        mapRef.current = map;
        boundaryLayerRef.current = new google.maps.Data({ map });
        boundaryLayerRef.current.setStyle({
          strokeColor: '#2456d6',
          strokeWeight: 1.5,
          fillColor: '#2456d6',
          fillOpacity: 0.04,
        });

        const observer = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.setCenter(mapRef.current.getCenter() ?? { lat: MAP_DEFAULT_CENTER[0], lng: MAP_DEFAULT_CENTER[1] });
          }
        });
        observer.observe(container);

        const cleanup = () => {
          observer.disconnect();
          clearMapLayers();
          if (boundaryLayerRef.current) {
            boundaryLayerRef.current.forEach((feature) => boundaryLayerRef.current?.remove(feature));
            boundaryLayerRef.current = null;
          }
          mapRef.current = null;
        };

        // keep a stable cleanup reference for the following effect
        (map as google.maps.Map & { __cleanup?: () => void }).__cleanup = cleanup;
        draw();
      } catch {
        if (!cancelled) {
          console.warn('Google Maps failed to load. Add VITE_GOOGLE_MAPS_API_KEY to render the map.');
        }
      }
    };

    void loadMap();
    return () => {
      cancelled = true;
      const map = mapRef.current as (google.maps.Map & { __cleanup?: () => void }) | null;
      if (map && map.__cleanup) {
        map.__cleanup();
      }
      mapRef.current = null;
    };
  }, [clearMapLayers, draw, theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setOptions({
      styles: theme === 'dark' ? [
        { elementType: 'geometry', stylers: [{ color: '#111827' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#f3f4f6' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
      ] : undefined,
    });
  }, [theme]);

  useEffect(() => {
    draw();
  }, [points, selectedId, cluster, draw]);

  useEffect(() => {
    const layer = boundaryLayerRef.current;
    if (!layer) return;
    layer.forEach((feature) => layer.remove(feature));
    boundaries.forEach((boundary) => {
      const feature = boundary.geometry as GeoJSON.Feature;
      layer.addGeoJson(feature);
    });
  }, [boundaries]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={cn("z-0 w-full overflow-hidden rounded-lg", className)}
    />
  );
}
