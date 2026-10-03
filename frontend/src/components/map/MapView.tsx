import React, { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import { CARTO_API_KEY } from "../../api/config";
import { useTheme } from "../../contexts/theme";
import type { AreaBoundary } from "../../types/crime";
import { cn } from "../../utils/cn";
import {
  MAP_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_DARK_TILE_URL,
  MAP_TILE_URL,
} from "../../utils/constants";

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
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const stateRef = useRef({ points, cluster, selectedId });
  const onSelectRef = useRef(onSelect);
  stateRef.current = { points, cluster, selectedId };
  onSelectRef.current = onSelect;

  const draw = useCallback(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const {
      points: all,
      cluster: clustering,
      selectedId: selected,
    } = stateRef.current;
    const bounds = map.getBounds().pad(0.25);
    const visible = all.filter((p) => bounds.contains([p.lat, p.lng]));
    const zoom = map.getZoom();

    const addPoint = (p: MapPoint) => {
      const isSelected = p.id === selected;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: (p.radius ?? 6) + (isSelected ? 3 : 0),
        color: isSelected ? "#0d1527" : "#ffffff",
        weight: isSelected ? 3 : 1.5,
        fillColor: p.color,
        fillOpacity: 0.9,
      });
      if (p.label)
        marker.bindTooltip(p.label, { direction: "top", offset: [0, -6] });
      marker.on("click", () => onSelectRef.current?.(p.id));
      marker.addTo(layer);
    };

    if (clustering && visible.length > CLUSTER_MIN_POINTS && zoom < 16) {
      const cells = new Map<string, MapPoint[]>();
      visible.forEach((p) => {
        const px = map.project([p.lat, p.lng], zoom);
        const key = `${Math.floor(px.x / CLUSTER_CELL_PX)}:${Math.floor(px.y / CLUSTER_CELL_PX)}`;
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
        const size = Math.round(Math.min(58, 28 + Math.log2(group.length) * 5));
        const icon = L.divIcon({
          className: "cv-cluster",
          html: `<span style="width:${size}px;height:${size}px">${group.length}</span>`,
          iconSize: [size, size],
        });
        L.marker([lat, lng], {
          icon,
          title: `${group.length} incidents — click to zoom in`,
        })
          .on("click", () => map.setView([lat, lng], Math.min(zoom + 2, 18)))
          .addTo(layer);
      });
    } else {
      visible.forEach(addPoint);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const map = L.map(container, { preferCanvas: true }).setView(
      MAP_DEFAULT_CENTER,
      MAP_DEFAULT_ZOOM,
    );
    const tileLayer = L.tileLayer(MAP_TILE_URL, {
      attribution: MAP_ATTRIBUTION,
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    tileLayerRef.current = tileLayer;
    boundaryLayerRef.current = L.geoJSON(undefined, {
      style: {
        color: "#2456d6",
        weight: 1.5,
        fillColor: "#2456d6",
        fillOpacity: 0.04,
      },
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.on("zoomend moveend", draw);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      map.off();
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, [draw]);

  useEffect(() => {
    const tileLayer = tileLayerRef.current;
    if (!tileLayer) return;
    const baseUrl = theme === "dark" ? MAP_DARK_TILE_URL : MAP_TILE_URL;
    const tileUrl = CARTO_API_KEY
      ? `${baseUrl}?key=${encodeURIComponent(CARTO_API_KEY)}`
      : baseUrl;
    tileLayer.setUrl(tileUrl);
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (points.length) {
      const bounds = L.latLngBounds(
        points.map((p) => [p.lat, p.lng] as L.LatLngTuple),
      );
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: maxFitZoom });
    }
    draw();
  }, [points, draw, maxFitZoom]);

  useEffect(() => {
    draw();
  }, [selectedId, cluster, draw]);

  useEffect(() => {
    const layer = boundaryLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    boundaries.forEach((b) => {
      const shape = L.geoJSON(b.geometry, {
        style: { color: "#2456d6", weight: 1.5, fillOpacity: 0.04 },
      });
      shape.bindTooltip(b.area, { sticky: true });
      shape.eachLayer((l) => layer.addLayer(l));
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
