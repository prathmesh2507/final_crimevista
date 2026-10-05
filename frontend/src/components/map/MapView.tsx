import React, { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const NAGPUR_CENTER: [number, number] = [79.0882, 21.1458];
const CLUSTER_MIN_POINTS = 200;
const CLUSTER_CELL_DEG = 0.005;

function createMarkerElement(point: MapPoint, isSelected: boolean, clusterMarker = false) {
  const element = document.createElement("button");
  element.type = "button";
  element.setAttribute("aria-label", point.label ?? "Map location");
  element.style.border = "0";
  element.style.cursor = "pointer";
  element.style.position = "relative";
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.justifyContent = "center";
  element.style.borderRadius = "9999px";
  element.style.background = point.color;
  element.style.boxShadow = isSelected
    ? "0 0 0 3px rgba(255,255,255,0.9), 0 10px 24px rgba(15, 23, 42, 0.32)"
    : "0 8px 18px rgba(15, 23, 42, 0.2)";
  element.style.width = clusterMarker ? "34px" : `${Math.max(14, (point.radius ?? 8) + (isSelected ? 6 : 0)) * 2}px`;
  element.style.height = clusterMarker ? "34px" : `${Math.max(14, (point.radius ?? 8) + (isSelected ? 6 : 0)) * 2}px`;
  element.style.color = "#ffffff";
  element.style.fontSize = clusterMarker ? "12px" : "10px";
  element.style.fontWeight = "700";
  element.style.lineHeight = "1";

  if (clusterMarker) {
    element.style.background = "#2456d6";
    element.textContent = "99+";
  } else {
    element.style.border = isSelected ? "2px solid #0d1527" : "1.5px solid rgba(255,255,255,0.8)";
    element.style.opacity = "0.96";
  }

  return element;
}

function liftBoundaryFeatures(boundaries: AreaBoundary[]): GeoJSON.Feature[] {
  return boundaries.flatMap((boundary) => {
    const geometry = boundary.geometry as GeoJSON.GeoJsonObject;

    if (geometry.type === "Feature") {
      return [geometry as GeoJSON.Feature];
    }

    if (geometry.type === "FeatureCollection") {
      return geometry.features as GeoJSON.Feature[];
    }

    return [{
      type: "Feature",
      geometry: geometry as GeoJSON.Geometry,
      properties: { area: boundary.area },
    }];
  });
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerLayerRef = useRef<Array<maplibregl.Marker>>([]);
  const [mapMode, setMapMode] = useState<"2d" | "3d">("3d");
  const stateRef = useRef({ points, cluster, selectedId });
  const onSelectRef = useRef(onSelect);

  stateRef.current = { points, cluster, selectedId };
  onSelectRef.current = onSelect;

  const clearMapLayers = useCallback(() => {
    markerLayerRef.current.forEach((marker) => marker.remove());
    markerLayerRef.current = [];
  }, []);

  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: NAGPUR_CENTER,
      zoom: 11.5,
      pitch: 58,
      bearing: 18,
      essential: true,
    });
  }, []);

  const updateBoundaries = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const boundaryData = {
      type: "FeatureCollection",
      features: liftBoundaryFeatures(boundaries),
    } as GeoJSON.FeatureCollection;

    const existing = map.getSource("crime-boundaries") as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(boundaryData);
      return;
    }

    if (!boundaryData.features.length) return;

    map.addSource("crime-boundaries", {
      type: "geojson",
      data: boundaryData,
    });

    map.addLayer({
      id: "crime-boundary-fill",
      type: "fill",
      source: "crime-boundaries",
      paint: {
        "fill-color": "#2456d6",
        "fill-opacity": 0.05,
      },
    });

    map.addLayer({
      id: "crime-boundary-line",
      type: "line",
      source: "crime-boundaries",
      paint: {
        "line-color": "#2456d6",
        "line-width": 1.5,
        "line-opacity": 0.9,
      },
    });
  }, [boundaries]);

  const draw = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    clearMapLayers();
    const { points: all, cluster: clustering, selectedId: selected } = stateRef.current;
    const bounds = new maplibregl.LngLatBounds();

    const fitBoundsIfNeeded = () => {
      const pointsWithLocation = all.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
      if (!pointsWithLocation.length) {
        resetView();
        return;
      }

      pointsWithLocation.forEach((point) => bounds.extend([point.lng, point.lat]));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 32,
          maxZoom: maxFitZoom,
          duration: 0,
          animate: false,
        });
      }
    };

    const visible = all.filter((point) => {
      const latLng = new maplibregl.LngLat(point.lng, point.lat);
      return map.getBounds().contains(latLng);
    });

    const addPoint = (point: MapPoint) => {
      const isSelected = point.id === selected;
      const markerElement = createMarkerElement(point, isSelected, false);
      const marker = new maplibregl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat([point.lng, point.lat])
        .addTo(map);

      markerElement.addEventListener("click", () => onSelectRef.current?.(point.id));
      markerLayerRef.current.push(marker);
      bounds.extend([point.lng, point.lat]);
    };

    if (clustering && visible.length > CLUSTER_MIN_POINTS && map.getZoom() < 16) {
      const cells = new Map<string, MapPoint[]>();
      visible.forEach((point) => {
        const key = `${Math.floor(point.lat / CLUSTER_CELL_DEG)}:${Math.floor(point.lng / CLUSTER_CELL_DEG)}`;
        const bucket = cells.get(key);
        if (bucket) bucket.push(point);
        else cells.set(key, [point]);
      });

      cells.forEach((group) => {
        if (group.length === 1) {
          addPoint(group[0]);
          return;
        }

        const lat = group.reduce((sum, point) => sum + point.lat, 0) / group.length;
        const lng = group.reduce((sum, point) => sum + point.lng, 0) / group.length;
        const markerElement = createMarkerElement({
          id: `${group[0].id}-${group.length}`,
          lat,
          lng,
          color: "#2456d6",
          radius: 16,
          label: `${group.length} incidents`,
        }, false, true);

        const marker = new maplibregl.Marker({ element: markerElement, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);

        markerElement.textContent = String(group.length);
        markerElement.addEventListener("click", () => {
          map.flyTo({ center: [lng, lat], zoom: Math.min(map.getZoom() + 2, 18), essential: true });
        });
        markerLayerRef.current.push(marker);
      });
    } else {
      visible.forEach(addPoint);
    }

    fitBoundsIfNeeded();
  }, [clearMapLayers, maxFitZoom, resetView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: OPENFREEMAP_STYLE,
      center: NAGPUR_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      pitch: 58,
      bearing: 18,
      antialias: true,
      attributionControl: true,
    });

    mapRef.current = map;

    const handleResize = () => map.resize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    map.on("load", () => {
      try {
        map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");
        map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
      } catch {
        // Optional controls are non-critical and should not block the map experience.
      }

      try {
        map.addSource("terrain-rgb", {
          type: "raster-dem",
          tiles: ["https://demotiles.maplibre.com/tiles/terrain-rgb/{z}/{x}/{y}.png"],
          tileSize: 256,
          maxzoom: 12,
        });
        map.setTerrain({ source: "terrain-rgb", exaggeration: 1.1 });
      } catch {
        // Terrain is optional; the 3D map remains usable without it.
      }

      try {
        map.addLayer({
          id: "crime-building-extrusion",
          type: "fill-extrusion",
          source: "openmaptiles",
          "source-layer": "building",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": ["interpolate", ["linear"], ["zoom"], 15, "#dfe7ef", 18, "#d1d5db"],
            "fill-extrusion-height": ["coalesce", ["get", "height"], ["get", "render_height"], 10],
            "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
            "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0.1, 18, 0.7],
          },
        });
      } catch {
        // Building extrusions are only available when the current style exposes compatible geometry.
      }

      updateBoundaries();
      draw();
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [draw, updateBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapMode === "2d") {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 700,
      });
      return;
    }

    map.easeTo({
      pitch: 58,
      bearing: 18,
      duration: 700,
    });
  }, [mapMode]);

  useEffect(() => {
    draw();
  }, [points, selectedId, cluster, draw]);

  useEffect(() => {
    updateBoundaries();
  }, [boundaries, updateBoundaries]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        className="h-full w-full"
      />

      <div className="absolute right-3 top-3 z-10 flex gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setMapMode("2d")}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
            mapMode === "2d" ? "bg-white text-slate-900" : "text-slate-200 hover:bg-white/10",
          )}
        >
          2D
        </button>
        <button
          type="button"
          onClick={() => setMapMode("3d")}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
            mapMode === "3d" ? "bg-white text-slate-900" : "text-slate-200 hover:bg-white/10",
          )}
        >
          3D
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-lg bg-analytics px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-analytics/90"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
