"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  type LngLatLike,
  type Map as MaplibreMap,
  type Marker,
} from "maplibre-gl";
import { Loader2, MapPin } from "lucide-react";

import type { CityRoute, LanguageCode, RoutePoint } from "@/lib/api/types";
import { getLocalizedPlaceName } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { OSM_RASTER_STYLE } from "@/lib/map/osm-style";
import {
  orderedRoutePoints,
  routeLineCoordinates,
  routePointCoordinates,
} from "@/lib/routes/route-format";
import { cn } from "@/lib/utils";

const ROUTE_SOURCE_ID = "cityquest-route-line";
const ROUTE_LINE_SHADOW_ID = "cityquest-route-line-shadow";
const ROUTE_LINE_ID = "cityquest-route-line-main";

interface RouteMapProps {
  activePointId: number | null;
  className?: string;
  focusedPointId: number | null;
  onPointSelect: (pointId: number) => void;
  route: CityRoute;
}

interface MappedPoint {
  coordinates: [number, number];
  point: RoutePoint;
}

interface MarkerRecord {
  coordinates: [number, number];
  element: HTMLButtonElement;
  marker: Marker;
  pointId: number;
}

export function RouteMap({
  activePointId,
  className,
  focusedPointId,
  onPointSelect,
  route,
}: RouteMapProps) {
  const { dictionary, language } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<MarkerRecord[]>([]);
  const onPointSelectRef = useRef(onPointSelect);
  const activePointIdRef = useRef(activePointId);
  const [readyMapKey, setReadyMapKey] = useState<string | null>(null);
  const lineCoordinates = useMemo(
    () => routeLineCoordinates(route).map(toLngLat),
    [route],
  );
  const mappedPoints = useMemo(() => routeToMappedPoints(route), [route]);
  const hasMapData = lineCoordinates.length >= 2 && mappedPoints.length > 0;
  const routeMapKey = useMemo(
    () =>
      hasMapData
        ? [
            route.id,
            lineCoordinates.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join("|"),
            mappedPoints.map(({ point }) => point.id).join(","),
          ].join(":")
        : null,
    [hasMapData, lineCoordinates, mappedPoints, route.id],
  );
  const isMapReady = routeMapKey !== null && readyMapKey === routeMapKey;

  useEffect(() => {
    onPointSelectRef.current = onPointSelect;
  }, [onPointSelect]);

  useEffect(() => {
    activePointIdRef.current = activePointId;
    markersRef.current.forEach((record) => {
      record.element.dataset.active = String(record.pointId === activePointId);
    });
  }, [activePointId]);

  useEffect(() => {
    if (!focusedPointId) {
      return;
    }

    const markerRecord = markersRef.current.find(
      (record) => record.pointId === focusedPointId,
    );

    if (!markerRecord || !mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: markerRecord.coordinates,
      duration: 650,
      essential: true,
      offset: isMobileViewport() ? [0, -90] : [-120, 0],
      zoom: Math.max(mapRef.current.getZoom(), 15.4),
    });
  }, [focusedPointId]);

  useEffect(() => {
    if (!containerRef.current || !hasMapData) {
      return;
    }

    const mapContainer = containerRef.current;
    const map = new maplibregl.Map({
      attributionControl: false,
      center: lineCoordinates[0] as LngLatLike,
      container: mapContainer,
      maxZoom: 18,
      minZoom: 10,
      pitchWithRotate: false,
      style: OSM_RASTER_STYLE,
      zoom: 14,
    });
    const resizeObserver = new ResizeObserver(() => map.resize());
    let disposed = false;
    let frameId: number | null = null;

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    resizeObserver.observe(mapContainer);
    window.requestAnimationFrame(() => map.resize());

    map.once("load", () => {
      frameId = window.requestAnimationFrame(() => {
        if (disposed) {
          return;
        }

        map.resize();
        addRouteLine(map, lineCoordinates);
        markersRef.current = addRouteMarkers(map, mappedPoints, {
          activePointId: activePointIdRef.current,
          language,
          markerLabel: dictionary.routes.detail.markerLabel,
          onSelect: (pointId) => onPointSelectRef.current(pointId),
        });
        fitRouteBounds(map, lineCoordinates);
        setReadyMapKey(routeMapKey);
      });
    });

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      markersRef.current.forEach((record) => record.marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [
    dictionary.routes.detail.markerLabel,
    hasMapData,
    language,
    lineCoordinates,
    mappedPoints,
    routeMapKey,
  ]);

  if (!hasMapData) {
    return (
      <div
        className={cn(
          "grid min-h-[26rem] place-items-center bg-muted px-5 text-center",
          className,
        )}
      >
        <div className="max-w-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-lg bg-card text-primary shadow-sm">
            <MapPin className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold">
            {dictionary.routes.detail.mapUnavailableTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dictionary.routes.detail.mapUnavailableText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full min-h-[26rem] w-full overflow-hidden bg-muted",
        className,
      )}
    >
      <div className="h-full w-full" ref={containerRef} />
      {!isMapReady ? (
        <RouteMapLoadingOverlay
          label={dictionary.common.loading}
          title={dictionary.routes.detail.routeOverview}
        />
      ) : null}
    </div>
  );
}

function RouteMapLoadingOverlay({
  label,
  title,
}: {
  label: string;
  title: string;
}) {
  return (
    <div
      aria-live="polite"
      className="absolute inset-0 z-10 grid place-items-center bg-muted/75 px-4 backdrop-blur-[2px]"
      role="status"
    >
      <div className="w-full max-w-xs rounded-lg border border-border bg-card/95 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{label}</div>
            <div className="mt-1 text-xs font-medium text-muted-foreground">{title}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2" aria-hidden="true">
          <span className="h-1.5 rounded-full bg-primary/80" />
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="h-1.5 rounded-full bg-primary/45" />
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="h-1.5 rounded-full bg-primary/25" />
        </div>
      </div>
    </div>
  );
}

function addRouteLine(map: MaplibreMap, coordinates: [number, number][]): void {
  map.addSource(ROUTE_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    },
  });

  map.addLayer({
    id: ROUTE_LINE_SHADOW_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-blur": 1.5,
      "line-color": "#3f3328",
      "line-opacity": 0.28,
      "line-width": 9,
    },
  });

  map.addLayer({
    id: ROUTE_LINE_ID,
    type: "line",
    source: ROUTE_SOURCE_ID,
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#8f5f38",
      "line-opacity": 0.95,
      "line-width": 5,
    },
  });
}

function addRouteMarkers(
  map: MaplibreMap,
  points: MappedPoint[],
  options: {
    activePointId: number | null;
    language: LanguageCode;
    markerLabel: string;
    onSelect: (pointId: number) => void;
  },
): MarkerRecord[] {
  return points.map(({ coordinates, point }) => {
    const element = document.createElement("button");

    element.type = "button";
    element.className = "cityquest-route-marker";
    element.dataset.active = String(point.id === options.activePointId);
    element.setAttribute(
      "aria-label",
      `${options.markerLabel} ${point.order_number}: ${
        point.place ? getLocalizedPlaceName(point.place, options.language) : ""
      }`,
    );
    element.textContent = String(point.order_number);
    element.addEventListener("click", () => options.onSelect(point.id));

    const marker = new maplibregl.Marker({ element, offset: [0, -18] })
      .setLngLat(coordinates)
      .addTo(map);

    return {
      coordinates,
      element,
      marker,
      pointId: point.id,
    };
  });
}

function fitRouteBounds(map: MaplibreMap, coordinates: [number, number][]): void {
  const bounds = coordinates.reduce(
    (currentBounds, coordinatesPair) => currentBounds.extend(coordinatesPair),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
  );

  map.fitBounds(bounds, {
    duration: 0,
    maxZoom: 15.8,
    padding: isMobileViewport()
      ? { bottom: 300, left: 40, right: 40, top: 96 }
      : { bottom: 72, left: 72, right: 460, top: 88 },
  });
}

function routeToMappedPoints(route: CityRoute): MappedPoint[] {
  return orderedRoutePoints(route).flatMap((point) => {
    const coordinates = routePointCoordinates(point);

    return coordinates
      ? [
          {
            coordinates: toLngLat(coordinates),
            point,
          },
        ]
      : [];
  });
}

function toLngLat(coordinates: { lat: number; lng: number }): [number, number] {
  return [coordinates.lng, coordinates.lat];
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
