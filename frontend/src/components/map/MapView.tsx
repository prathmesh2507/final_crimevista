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

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/dark";
const NAGPUR_CENTER: [number, number] = [79.0882, 21.1458];
const CLUSTER_CELL_DEG = 0.0125;

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

function buildIncidentFeatures(points: MapPoint[], selectedId: string | null) {
  return {
    type: "FeatureCollection",
    features: points
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
        properties: {
          id: point.id,
          color: point.color,
          label: point.label ?? "Incident",
          selected: point.id === selectedId,
          radius: point.radius ?? 8,
        },
      })),
  } as GeoJSON.FeatureCollection;
}

function buildHeatFeatures(points: MapPoint[]) {
  return {
    type: "FeatureCollection",
    features: points
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [point.lng, point.lat],
        },
        properties: {
          weight: Math.max(1, (point.radius ?? 8) / 6),
          id: point.id,
          color: point.color,
        },
      })),
  } as GeoJSON.FeatureCollection;
}

function buildClusterFeatures(points: MapPoint[]) {
  const cells = new Map<string, { count: number; lat: number; lng: number; ids: string[] }>();

  points.forEach((point) => {
    const key = `${Math.round(point.lat / CLUSTER_CELL_DEG)}:${Math.round(point.lng / CLUSTER_CELL_DEG)}`;
    const bucket = cells.get(key);

    if (bucket) {
      bucket.count += 1;
      bucket.lat += point.lat;
      bucket.lng += point.lng;
      bucket.ids.push(point.id);
      return;
    }

    cells.set(key, { count: 1, lat: point.lat, lng: point.lng, ids: [point.id] });
  });

  return {
    type: "FeatureCollection",
    features: Array.from(cells.values())
      .filter((bucket) => bucket.count > 1)
      .map((bucket) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [bucket.lng / bucket.count, bucket.lat / bucket.count],
        },
        properties: {
          count: bucket.count,
          id: bucket.ids.join("-"),
          label: `${bucket.count} incidents nearby`,
          color: "#7dd3fc",
        },
      })),
  } as GeoJSON.FeatureCollection;
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
  const stateRef = useRef({ points, cluster, selectedId });
  const onSelectRef = useRef(onSelect);
  const [mapMode, setMapMode] = useState<"2d" | "3d">("3d");
  const [liveStamp, setLiveStamp] = useState(() => new Date());

  stateRef.current = { points, cluster, selectedId };
  onSelectRef.current = onSelect;

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

    map.addSource("crime-boundaries", { type: "geojson", data: boundaryData });
    map.addLayer({
      id: "crime-boundary-fill",
      type: "fill",
      source: "crime-boundaries",
      paint: {
        "fill-color": "#7dd3fc",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.08, 13, 0.18],
      },
    });
    map.addLayer({
      id: "crime-boundary-line",
      type: "line",
      source: "crime-boundaries",
      paint: {
        "line-color": "#7dd3fc",
        "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1, 13, 2.2],
        "line-opacity": 0.9,
      },
    });
  }, [boundaries]);

  const updateMapLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const { points: all, cluster: clustering, selectedId: selected } = stateRef.current;
    const heatData = buildHeatFeatures(all);
    const pointData = buildIncidentFeatures(all, selected);
    const clusterData = clustering ? buildClusterFeatures(all) : pointData;

    [
      { id: "crime-heat", data: heatData },
      { id: "crime-point", data: pointData },
      { id: "crime-cluster", data: clusterData },
    ].forEach(({ id, data }) => {
      const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
      if (source) {
        source.setData(data);
      } else {
        map.addSource(id, { type: "geojson", data });
      }
    });

    if (!map.getLayer("crime-heat-layer")) {
      map.addLayer({
        id: "crime-heat-layer",
        type: "heatmap",
        source: "crime-heat",
        maxzoom: 18,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1, 3, 1.5],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 7, 0.8, 12, 1.4, 18, 2.2],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(12, 18, 31, 0)",
            0.2, "rgba(59, 130, 246, 0.35)",
            0.5, "rgba(234, 179, 8, 0.5)",
            0.8, "rgba(239, 68, 68, 0.7)",
            1, "rgba(255, 255, 255, 0.9)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 18, 12, 26, 18, 38],
          "heatmap-opacity": 0.95,
        },
      });
    }

    if (!map.getLayer("crime-cluster-layer")) {
      map.addLayer({
        id: "crime-cluster-layer",
        type: "circle",
        source: "crime-cluster",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 2, 11, 8, 16, 20, 21],
          "circle-color": ["step", ["get", "count"], "#7dd3fc", 2, "#38bdf8", 6, "#60a5fa", 12, "#818cf8", 24, "#f59e0b"],
          "circle-opacity": 0.8,
          "circle-stroke-color": "rgba(255,255,255,0.8)",
          "circle-stroke-width": 1.75,
        },
      });
      map.on("click", "crime-cluster-layer", (event) => {
        const features = event.features ?? [];
        const feature = features[0];
        if (!feature) return;
        const [lng, lat] = feature.geometry.type === "Point" ? feature.geometry.coordinates : [NAGPUR_CENTER[0], NAGPUR_CENTER[1]];
        map.flyTo({ center: [lng, lat], zoom: Math.min(map.getZoom() + 2.5, 18), essential: true });
      });
    }

    if (!map.getLayer("crime-point-layer")) {
      map.addLayer({
        id: "crime-point-layer",
        type: "circle",
        source: "crime-point",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "selected"], true],
            10,
            ["get", "radius"],
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": ["case", ["==", ["get", "selected"], true], 1, 0.9],
          "circle-stroke-color": ["case", ["==", ["get", "selected"], true], "#f8fafc", "rgba(255,255,255,0.8)"],
          "circle-stroke-width": ["case", ["==", ["get", "selected"], true], 3, 1.5],
        },
      });
      map.on("click", "crime-point-layer", (event) => {
        const features = event.features ?? [];
        const feature = features[0];
        if (!feature) return;
        const id = String(feature.properties?.id ?? "");
        if (id) {
          onSelectRef.current?.(id);
        }
      });
    }

    const fitBoundsIfNeeded = () => {
      const pointsWithLocation = all.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
      if (!pointsWithLocation.length) {
        resetView();
        return;
      }

      const bounds = new maplibregl.LngLatBounds();
      pointsWithLocation.forEach((point) => bounds.extend([point.lng, point.lat]));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 40,
          maxZoom: maxFitZoom,
          duration: 700,
          animate: true,
        });
      }
    };

    if (map.getZoom() >= 9 || clustering) {
      fitBoundsIfNeeded();
    }
  }, [cluster, maxFitZoom, points, resetView]);

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
      preserveDrawingBuffer: true,
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
      updateMapLayers();
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [updateBoundaries, updateMapLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapMode === "2d") {
      map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
      return;
    }

    map.easeTo({ pitch: 58, bearing: 18, duration: 700 });
  }, [mapMode]);

  useEffect(() => {
    const interval = window.setInterval(() => setLiveStamp(new Date()), 15000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    updateMapLayers();
  }, [points, selectedId, cluster, updateMapLayers]);

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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-950/75 via-slate-950/30 to-transparent px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-100/80">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
          Live
        </span>
        <span className="text-[10px] text-slate-200/80">Updated {liveStamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>

      <div className="absolute right-3 top-12 z-10 flex gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-1 shadow-lg backdrop-blur-sm">
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
