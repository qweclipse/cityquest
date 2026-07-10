"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, {
  type Map as MaplibreMap,
  type Marker,
} from "maplibre-gl";
import { MapPin } from "lucide-react";

import type { LanguageCode, Place } from "@/lib/api/types";
import { getLocalizedPlaceName } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { OSM_RASTER_STYLE } from "@/lib/map/osm-style";
import { cn } from "@/lib/utils";

interface CityMapProps {
  activePlaceId: number | null;
  className?: string;
  emptyText: string;
  emptyTitle: string;
  markerLabel: string;
  onPlaceSelect: (placeId: number) => void;
  places: Place[];
}

interface MappedPlace {
  coordinates: [number, number];
  place: Place;
}

interface MarkerRecord {
  element: HTMLButtonElement;
  marker: Marker;
  placeId: number;
}

const CHISINAU_CENTER: [number, number] = [28.8323, 47.0105];

export function CityMap({
  activePlaceId,
  className,
  emptyText,
  emptyTitle,
  markerLabel,
  onPlaceSelect,
  places,
}: CityMapProps) {
  const { language } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<MarkerRecord[]>([]);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const activePlaceIdRef = useRef(activePlaceId);
  const mappedPlaces = useMemo(() => placesToMappedPlaces(places), [places]);
  const hasPlaces = mappedPlaces.length > 0;

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    activePlaceIdRef.current = activePlaceId;
    markersRef.current.forEach((record) => {
      record.element.dataset.active = String(record.placeId === activePlaceId);
    });

    if (!activePlaceId || !mapRef.current) {
      return;
    }

    const activePlace = mappedPlaces.find((item) => item.place.id === activePlaceId);

    if (!activePlace) {
      return;
    }

    mapRef.current.flyTo({
      center: activePlace.coordinates,
      duration: 500,
      essential: true,
      offset: isMobileViewport() ? [0, -80] : [-120, 0],
      zoom: Math.max(mapRef.current.getZoom(), 14.8),
    });
  }, [activePlaceId, mappedPlaces]);

  useEffect(() => {
    if (!containerRef.current || !hasPlaces) {
      return;
    }

    const mapContainer = containerRef.current;
    const map = new maplibregl.Map({
      attributionControl: false,
      center: mappedPlaces[0]?.coordinates ?? CHISINAU_CENTER,
      container: mapContainer,
      maxZoom: 18,
      minZoom: 10,
      pitchWithRotate: false,
      style: OSM_RASTER_STYLE,
      zoom: 13,
    });
    const resizeObserver = new ResizeObserver(() => map.resize());

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    resizeObserver.observe(mapContainer);
    window.requestAnimationFrame(() => map.resize());

    map.once("load", () => {
      window.requestAnimationFrame(() => {
        map.resize();
        markersRef.current = addPlaceMarkers(map, mappedPlaces, {
          activePlaceId: activePlaceIdRef.current,
          language,
          markerLabel,
          onSelect: (placeId) => onPlaceSelectRef.current(placeId),
        });
        fitPlacesBounds(map, mappedPlaces.map((item) => item.coordinates));
      });
    });

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((record) => record.marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [hasPlaces, language, mappedPlaces, markerLabel]);

  if (!hasPlaces) {
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
          <h2 className="mt-4 text-xl font-bold">{emptyTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("h-full min-h-[28rem] w-full bg-muted", className)}
      ref={containerRef}
    />
  );
}

function addPlaceMarkers(
  map: MaplibreMap,
  places: MappedPlace[],
  options: {
    activePlaceId: number | null;
    language: LanguageCode;
    markerLabel: string;
    onSelect: (placeId: number) => void;
  },
): MarkerRecord[] {
  return places.map(({ coordinates, place }) => {
    const element = document.createElement("button");

    element.type = "button";
    element.className = "cityquest-map-marker";
    element.dataset.active = String(place.id === options.activePlaceId);
    element.setAttribute(
      "aria-label",
      `${options.markerLabel}: ${getLocalizedPlaceName(place, options.language)}`,
    );
    element.addEventListener("click", () => options.onSelect(place.id));

    const marker = new maplibregl.Marker({ element, offset: [0, -18] })
      .setLngLat(coordinates)
      .addTo(map);

    return {
      element,
      marker,
      placeId: place.id,
    };
  });
}

function fitPlacesBounds(map: MaplibreMap, coordinates: [number, number][]): void {
  if (coordinates.length === 1) {
    map.flyTo({
      center: coordinates[0],
      duration: 0,
      zoom: 14.8,
    });
    return;
  }

  const bounds = coordinates.reduce(
    (currentBounds, coordinatesPair) => currentBounds.extend(coordinatesPair),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
  );

  map.fitBounds(bounds, {
    duration: 0,
    maxZoom: 14.8,
    padding: isMobileViewport()
      ? { bottom: 80, left: 40, right: 40, top: 80 }
      : { bottom: 72, left: 72, right: 420, top: 72 },
  });
}

function placesToMappedPlaces(places: Place[]): MappedPlace[] {
  return places.flatMap((place) => {
    if (!isValidCoordinates(place)) {
      return [];
    }

    return [
      {
        coordinates: [place.coordinates.lng, place.coordinates.lat],
        place,
      },
    ];
  });
}

function isValidCoordinates(place: Place): boolean {
  return (
    typeof place.coordinates?.lat === "number" &&
    Number.isFinite(place.coordinates.lat) &&
    typeof place.coordinates.lng === "number" &&
    Number.isFinite(place.coordinates.lng)
  );
}

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 1024;
}
