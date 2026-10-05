import { useCallback, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hotspot } from "../../types/analytics";
import type { AreaBoundary } from "../../types/crime";
import { cn } from "../../utils/cn";
import { MAP_DEFAULT_ZOOM } from "../../utils/constants";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: string;
  radius?: number;
  label?: string;
}

type MapExperience = "3d-city" | "heat-intelligence";
type HeatLayerMode = "heatmap" | "clusters" | "incidents" | "hotspots";
type CityLayer = "buildings" | "hotspots" | "incidents";

interface MapViewProps {
  points: MapPoint[];
  ariaLabel: string;
  boundaries?: AreaBoundary[];
  hotspots?: Hotspot[];
  selectedId?: string | null;
  onSelect?: (id: string, kind: "incident" | "area") => void;
  className?: string;
  maxFitZoom?: number;
  showExperienceControls?: boolean;
}

const OPENFREEMAP_STYLE = {
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  positron: "https://tiles.openfreemap.org/styles/positron",
};
const NAGPUR_CENTER: [number, number] = [79.0849, 21.1458];
const SOURCE = {
  incidents: "crime-incidents",
  heat: "crime-heat",
  hotspots: "crime-hotspots",
  zones: "crime-hotspot-zones",
  columns: "crime-hotspot-columns",
  boundaries: "crime-boundaries",
};
const L = {
  buildings: "crime-buildings-3d",
  boundaryFill: "crime-boundary-fill",
  boundaryLine: "crime-boundary-line",
  heat: "crime-heat-layer",
  clusters: "crime-cluster-layer",
  clusterCount: "crime-cluster-count",
  incidents: "crime-point-layer",
  hotspots: "crime-hotspot-layer",
  zones: "crime-hotspot-zones-layer",
  columns: "crime-hotspot-columns-layer",
  labels: "crime-hotspot-labels-layer",
};
const RISK_COLORS: Record<string, string> = {
  "Very high": "#c8322b",
  High: "#e0662f",
  Elevated: "#e9a23b",
  Moderate: "#6b8f88",
};
const DENSITY_COLORS = [
  "rgba(253,238,181,0)",
  "rgba(249,196,107,0.55)",
  "rgba(240,138,67,0.7)",
  "rgba(217,84,47,0.82)",
  "rgba(168,35,79,0.9)",
  "rgba(90,20,80,0.96)",
];

maplibregl.setWorkerUrl(maplibreWorkerUrl);

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function liftBoundaryFeatures(boundaries: AreaBoundary[]): GeoJSON.Feature[] {
  return boundaries.flatMap((boundary) => {
    const geometry = boundary.geometry as GeoJSON.GeoJsonObject;
    if (geometry.type === "Feature") return [geometry as GeoJSON.Feature];
    if (geometry.type === "FeatureCollection") {
      return (geometry as GeoJSON.FeatureCollection).features as GeoJSON.Feature[];
    }
    return [{
      type: "Feature",
      geometry: geometry as GeoJSON.Geometry,
      properties: { area: boundary.area },
    }];
  });
}

function pointCollection(points: MapPoint[], selectedId: string | null): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
      .map((point) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [point.lng, point.lat] },
        properties: {
          id: point.id,
          label: point.label ?? "Incident",
          color: point.color,
          radius: point.radius ?? 4,
          selected: point.id === selectedId,
        },
      })),
  };
}

function destination(lng: number, lat: number, distanceMeters: number, bearing: number): [number, number] {
  const angularDistance = distanceMeters / 6371008.8;
  const bearingRadians = bearing * Math.PI / 180;
  const latitude = lat * Math.PI / 180;
  const longitude = lng * Math.PI / 180;
  const targetLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance) +
    Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearingRadians),
  );
  const targetLongitude = longitude + Math.atan2(
    Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitude),
    Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(targetLatitude),
  );
  return [targetLongitude * 180 / Math.PI, targetLatitude * 180 / Math.PI];
}

function polygonFeature(
  hotspot: Hotspot,
  radiusMeters: number,
  properties: GeoJSON.GeoJsonProperties,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring: GeoJSON.Position[] = [];
  for (let bearing = 0; bearing <= 360; bearing += 60) {
    ring.push(destination(hotspot.longitude as number, hotspot.latitude as number, radiusMeters, bearing));
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties,
  };
}

function hotspotFeatures(hotspots: Hotspot[]): {
  points: GeoJSON.FeatureCollection;
  zones: GeoJSON.FeatureCollection;
  columns: GeoJSON.FeatureCollection;
} {
  const located = hotspots.filter(
    (hotspot): hotspot is Hotspot & { latitude: number; longitude: number } =>
      typeof hotspot.latitude === "number" &&
      Number.isFinite(hotspot.latitude) &&
      typeof hotspot.longitude === "number" &&
      Number.isFinite(hotspot.longitude),
  );
  const maxCount = Math.max(1, ...located.map((hotspot) => hotspot.incidentCount));

  return {
    points: {
      type: "FeatureCollection",
      features: located.map((hotspot) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [hotspot.longitude, hotspot.latitude] },
        properties: {
          id: hotspot.area,
          area: hotspot.area,
          count: hotspot.incidentCount,
          rank: hotspot.rank,
          risk: hotspot.riskLevel ?? "Moderate",
          dominant: hotspot.dominantCrimeType ?? "—",
          radius: 6 + 26 * Math.sqrt(hotspot.incidentCount / maxCount),
        },
      })),
    },
    zones: {
      type: "FeatureCollection",
      features: located.map((hotspot) => polygonFeature(
        hotspot,
        260 + 520 * Math.sqrt(hotspot.incidentCount / maxCount),
        { area: hotspot.area, risk: hotspot.riskLevel ?? "Moderate" },
      )),
    },
    columns: {
      type: "FeatureCollection",
      features: located.map((hotspot) => polygonFeature(
        hotspot,
        70,
        {
          area: hotspot.area,
          rank: hotspot.rank,
          count: hotspot.incidentCount,
          risk: hotspot.riskLevel ?? "Moderate",
          height: 120 + 780 * hotspot.incidentCount / maxCount,
        },
      )),
    },
  };
}

function addSourceIfMissing(map: maplibregl.Map, id: string, data: GeoJSON.FeatureCollection, cluster = false) {
  if (map.getSource(id)) return;
  map.addSource(id, {
    type: "geojson",
    data,
    ...(cluster ? { cluster: true, clusterRadius: 54, clusterMaxZoom: 15 } : {}),
  });
}

function addLayerIfMissing(map: maplibregl.Map, layer: maplibregl.AddLayerObject) {
  if (!map.getLayer(layer.id)) map.addLayer(layer);
}

function setLayerVisible(map: maplibregl.Map, id: string, visible: boolean) {
  if (map.getLayer(id)) {
    map.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
  }
}

function riskColorExpression(): maplibregl.ExpressionSpecification {
  return [
    "match",
    ["get", "risk"],
    "Very high", RISK_COLORS["Very high"],
    "High", RISK_COLORS.High,
    "Elevated", RISK_COLORS.Elevated,
    RISK_COLORS.Moderate,
  ];
}

export function MapView({
  points,
  ariaLabel,
  boundaries = [],
  hotspots = [],
  selectedId = null,
  onSelect,
  className,
  maxFitZoom = 14,
  showExperienceControls = false,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const stateRef = useRef({ points, boundaries, hotspots, selectedId });
  const onSelectRef = useRef(onSelect);
  const maxFitZoomRef = useRef(maxFitZoom);
  const fittedRef = useRef(false);
  const buildingLayersRef = useRef<string[]>([]);
  const [experience, setExperience] = useState<MapExperience>(
    showExperienceControls ? "3d-city" : "heat-intelligence",
  );
  const [heatLayer, setHeatLayer] = useState<HeatLayerMode>(
    showExperienceControls ? "heatmap" : "incidents",
  );
  const [cityLayers, setCityLayers] = useState<Record<CityLayer, boolean>>({
    buildings: true,
    hotspots: true,
    incidents: false,
  });
  const experienceRef = useRef(experience);
  const styleExperienceRef = useRef<MapExperience>(
    showExperienceControls ? "3d-city" : "heat-intelligence",
  );

  stateRef.current = { points, boundaries, hotspots, selectedId };
  onSelectRef.current = onSelect;
  maxFitZoomRef.current = maxFitZoom;
  experienceRef.current = experience;

  const syncData = useCallback((map: maplibregl.Map) => {
    const { points: incidents, boundaries: areaBoundaries, hotspots: areaHotspots, selectedId: selected } = stateRef.current;
    const incidentData = pointCollection(incidents, selected);
    const hotspotData = hotspotFeatures(areaHotspots);
    const dataBySource: Array<[string, GeoJSON.FeatureCollection]> = [
      [SOURCE.incidents, incidentData],
      [SOURCE.heat, incidentData],
      [SOURCE.hotspots, hotspotData.points],
      [SOURCE.zones, hotspotData.zones],
      [SOURCE.columns, hotspotData.columns],
      [SOURCE.boundaries, { type: "FeatureCollection", features: liftBoundaryFeatures(areaBoundaries) }],
    ];

    dataBySource.forEach(([id, data]) => {
      const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
      if (source) source.setData(data);
    });

    if (!fittedRef.current && incidents.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      incidents.forEach((point) => {
        if (Number.isFinite(point.lat) && Number.isFinite(point.lng)) bounds.extend([point.lng, point.lat]);
      });
      if (!bounds.isEmpty()) {
        const is3d = experienceRef.current === "3d-city";
        map.fitBounds(bounds, {
          padding: 48,
          maxZoom: maxFitZoomRef.current,
          duration: 0,
          pitch: is3d ? 62 : 0,
          bearing: is3d ? -28 : 0,
        });
        fittedRef.current = true;
      }
    }

    const mode = experienceRef.current;
    const currentHeatLayer = mode === "heat-intelligence" ? heatLayerRef.current : null;
    setLayerVisible(map, L.heat, currentHeatLayer === "heatmap");
    setLayerVisible(map, L.clusters, currentHeatLayer === "clusters");
    setLayerVisible(map, L.clusterCount, currentHeatLayer === "clusters");
    setLayerVisible(map, L.incidents, mode === "heat-intelligence"
      ? currentHeatLayer === "incidents"
      : cityLayersRef.current.incidents);
    setLayerVisible(map, L.hotspots, mode === "heat-intelligence"
      ? currentHeatLayer === "hotspots"
      : cityLayersRef.current.hotspots);
    buildingLayersRef.current.forEach((id) =>
      setLayerVisible(map, id, mode === "3d-city" && cityLayersRef.current.buildings),
    );
    setLayerVisible(map, L.zones, mode === "3d-city" && cityLayersRef.current.hotspots);
    setLayerVisible(map, L.columns, mode === "3d-city" && cityLayersRef.current.hotspots);
    setLayerVisible(map, L.labels, mode === "3d-city" && cityLayersRef.current.hotspots);
    setLayerVisible(map, L.boundaryFill, areaBoundaries.length > 0);
    setLayerVisible(map, L.boundaryLine, areaBoundaries.length > 0);
  }, []);

  const heatLayerRef = useRef(heatLayer);
  const cityLayersRef = useRef(cityLayers);
  heatLayerRef.current = heatLayer;
  cityLayersRef.current = cityLayers;

  const setupLayers = useCallback(function addMapLayers(map: maplibregl.Map) {
    if (!map.isStyleLoaded()) {
      map.once("idle", () => addMapLayers(map));
      return;
    }
    buildingLayersRef.current = [];
    const empty = emptyCollection();
    addSourceIfMissing(map, SOURCE.incidents, empty, true);
    addSourceIfMissing(map, SOURCE.heat, empty);
    addSourceIfMissing(map, SOURCE.hotspots, empty);
    addSourceIfMissing(map, SOURCE.zones, empty);
    addSourceIfMissing(map, SOURCE.columns, empty);
    addSourceIfMissing(map, SOURCE.boundaries, empty);

    if (experienceRef.current === "3d-city" && map.getSource("openmaptiles")) {
      const existingBuildings = (map.getStyle().layers ?? [])
        .filter((layer) => layer.type === "fill-extrusion")
        .map((layer) => layer.id);
      if (existingBuildings.length) {
        buildingLayersRef.current = existingBuildings;
      } else {
        addLayerIfMissing(map, {
          id: L.buildings,
          type: "fill-extrusion",
          source: "openmaptiles",
          "source-layer": "building",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": [
              "interpolate", ["linear"], ["coalesce", ["get", "render_height"], 0],
              0, "#ecebe6", 30, "#dedcd5", 90, "#c9c6bd",
            ],
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 9],
            "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            "fill-extrusion-opacity": 0.9,
          },
        });
        buildingLayersRef.current = [L.buildings];
      }
    }

    addLayerIfMissing(map, {
      id: L.boundaryFill,
      type: "fill",
      source: SOURCE.boundaries,
      paint: { "fill-color": "#f0854a", "fill-opacity": 0.08 },
    });
    addLayerIfMissing(map, {
      id: L.boundaryLine,
      type: "line",
      source: SOURCE.boundaries,
      paint: { "line-color": "#f0854a", "line-width": 1.5, "line-opacity": 0.9 },
    });
    addLayerIfMissing(map, {
      id: L.heat,
      type: "heatmap",
      source: SOURCE.heat,
      maxzoom: 18,
      paint: {
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.9, 15, 2.4],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 16, 15, 40],
        "heatmap-opacity": 0.88,
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, DENSITY_COLORS[0],
          0.08, DENSITY_COLORS[1],
          0.25, DENSITY_COLORS[2],
          0.45, DENSITY_COLORS[3],
          0.65, DENSITY_COLORS[4],
          0.85, DENSITY_COLORS[5],
          1, DENSITY_COLORS[5],
        ],
      },
    });
    addLayerIfMissing(map, {
      id: L.clusters,
      type: "circle",
      source: SOURCE.incidents,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#f9c46b", 20, "#f08a43", 60, "#d9542f", 150, "#a8234f"],
        "circle-radius": ["step", ["get", "point_count"], 13, 20, 17, 60, 22, 150, 28],
        "circle-opacity": 0.9,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
      },
    });
    addLayerIfMissing(map, {
      id: L.clusterCount,
      type: "symbol",
      source: SOURCE.incidents,
      filter: ["has", "point_count"],
      layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11, "text-allow-overlap": true },
      paint: { "text-color": "#2a2420" },
    });
    addLayerIfMissing(map, {
      id: L.incidents,
      type: "circle",
      source: SOURCE.heat,
      paint: {
        "circle-radius": [
          "interpolate", ["linear"], ["zoom"],
          10, ["case", ["==", ["get", "selected"], true], 8, 1.6],
          16, ["case", ["==", ["get", "selected"], true], 8, 4.5],
        ],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.82,
        "circle-stroke-color": ["case", ["==", ["get", "selected"], true], "#ffffff", "rgba(255,255,255,0.65)"],
        "circle-stroke-width": ["case", ["==", ["get", "selected"], true], 2, 0.6],
      },
    });
    addLayerIfMissing(map, {
      id: L.hotspots,
      type: "circle",
      source: SOURCE.hotspots,
      paint: {
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 10, ["*", ["get", "radius"], 0.6], 14, ["*", ["get", "radius"], 2.6]],
        "circle-color": riskColorExpression(),
        "circle-opacity": 0.25,
        "circle-stroke-color": riskColorExpression(),
        "circle-stroke-width": 1.5,
      },
    });
    addLayerIfMissing(map, {
      id: L.zones,
      type: "fill-extrusion",
      source: SOURCE.zones,
      paint: { "fill-extrusion-color": riskColorExpression(), "fill-extrusion-height": 5, "fill-extrusion-opacity": 0.38 },
    });
    addLayerIfMissing(map, {
      id: L.columns,
      type: "fill-extrusion",
      source: SOURCE.columns,
      paint: {
        "fill-extrusion-color": riskColorExpression(),
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.88,
      },
    });
    addLayerIfMissing(map, {
      id: L.labels,
      type: "symbol",
      source: SOURCE.hotspots,
      filter: ["<=", ["get", "rank"], 12],
      layout: {
        "text-field": ["concat", ["get", "area"], "\n", ["to-string", ["get", "count"]]],
        "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 13],
        "text-anchor": "bottom",
        "text-offset": [0, -1.2],
        "text-max-width": 10,
      },
      paint: { "text-color": "#1c1d20", "text-halo-color": "rgba(255,255,255,0.92)", "text-halo-width": 1.8 },
    });
    syncData(map);
  }, [syncData]);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: NAGPUR_CENTER,
      zoom: 13.9,
      pitch: experienceRef.current === "3d-city" ? 62 : 0,
      bearing: experienceRef.current === "3d-city" ? -28 : 0,
      duration: 900,
      essential: true,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const map = new maplibregl.Map({
      container,
      style: showExperienceControls ? OPENFREEMAP_STYLE.liberty : OPENFREEMAP_STYLE.positron,
      center: NAGPUR_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      pitch: showExperienceControls ? 62 : 0,
      bearing: showExperienceControls ? -28 : 0,
      maxPitch: 75,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);
    const onStyleLoad = () => setupLayers(map);
    const onClick = (event: maplibregl.MapMouseEvent) => {
      const interactiveLayers = [
        L.clusters,
        L.incidents,
        L.hotspots,
        L.columns,
        L.labels,
        L.zones,
      ].filter((id) => map.getLayer(id));
      if (!interactiveLayers.length) return;
      const feature = map.queryRenderedFeatures(event.point, { layers: interactiveLayers })[0];
      if (!feature) return;

      if (feature.layer.id === L.clusters) {
        map.easeTo({ center: event.lngLat, zoom: Math.min(map.getZoom() + 2, 18), duration: 500 });
        return;
      }

      const id = String(feature.properties?.id ?? feature.properties?.area ?? "");
      if (id) onSelectRef.current?.(id, feature.properties?.area ? "area" : "incident");
    };

    map.on("style.load", onStyleLoad);
    map.on("load", onStyleLoad);
    map.on("click", onClick);
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    return () => {
      resizeObserver.disconnect();
      map.off("style.load", onStyleLoad);
      map.off("load", onStyleLoad);
      map.off("click", onClick);
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, [setupLayers, showExperienceControls]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (styleExperienceRef.current !== experience) {
      styleExperienceRef.current = experience;
      map.setStyle(experience === "3d-city" ? OPENFREEMAP_STYLE.liberty : OPENFREEMAP_STYLE.positron);
    }
    map.easeTo({
      pitch: experience === "3d-city" ? 62 : 0,
      bearing: experience === "3d-city" ? -28 : 0,
      duration: 700,
    });
  }, [experience]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) syncData(map);
  }, [points, boundaries, hotspots, selectedId, heatLayer, cityLayers, experience, syncData]);

  const toggleCityLayer = (layer: CityLayer) => {
    setCityLayers((current) => ({ ...current, [layer]: !current[layer] }));
  };

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-slate-900", className)}>
      <div ref={containerRef} role="region" aria-label={ariaLabel} className="h-full w-full" />

      {showExperienceControls && (
        <>
          <div className="absolute left-3 top-3 z-10 rounded-xl border border-white/10 bg-slate-950/85 p-1.5 text-white shadow-xl backdrop-blur-md">
            <div className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Map experience
            </div>
            <div className="flex gap-1">
              {([
                ["3d-city", "3D City"],
                ["heat-intelligence", "Heat Intelligence"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={experience === id}
                  onClick={() => setExperience(id)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                    experience === id ? "bg-white text-slate-900" : "text-slate-200 hover:bg-white/10",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-3 left-3 z-10 max-w-[min(420px,calc(100%-24px))] rounded-xl border border-white/10 bg-slate-950/85 p-2.5 text-white shadow-xl backdrop-blur-md">
            {experience === "heat-intelligence" ? (
              <>
                <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Intelligence layers
                </div>
                <div className="flex flex-wrap gap-1">
                  {([
                    ["heatmap", "Density heat"],
                    ["clusters", "Clusters"],
                    ["incidents", "Incidents"],
                    ["hotspots", "Area hotspots"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={heatLayer === id}
                      onClick={() => setHeatLayer(id)}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                        heatLayer === id ? "bg-rose-400 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {heatLayer === "heatmap" && (
                  <div className="mt-2 flex items-center gap-2 px-1 text-[10px] text-slate-300">
                    <span>Lower</span>
                    <span className="h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-200 via-orange-500 to-fuchsia-900" />
                    <span>Higher density</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  City layers
                </div>
                <div className="flex flex-wrap gap-1">
                  {([
                    ["buildings", "3D buildings"],
                    ["hotspots", "Hotspot columns"],
                    ["incidents", "Incidents"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={cityLayers[id]}
                      onClick={() => toggleCityLayer(id)}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                        cityLayers[id] ? "bg-orange-400 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 px-1 text-[10px] text-slate-300">
                  Column height shows incident count; color shows reported risk.
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={resetView}
            className="absolute right-3 top-3 z-10 rounded-lg border border-white/15 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md hover:bg-slate-800"
          >
            Reset view
          </button>
        </>
      )}
    </div>
  );
}
