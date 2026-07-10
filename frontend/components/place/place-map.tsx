"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type LngLatLike, type Map as MaplibreMap } from "maplibre-gl";
import { MapPin } from "lucide-react";

import type { Place } from "@/lib/api/types";
import { getLocalizedPlaceName } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { OSM_RASTER_STYLE } from "@/lib/map/osm-style";
import { cn } from "@/lib/utils";

interface PlaceMapProps {
  className?: string;
  place: Place;
}

export function PlaceMap({ className, place }: PlaceMapProps) {
  const { dictionary, language } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const hasCoordinates =
    Number.isFinite(place.coordinates.lat) && Number.isFinite(place.coordinates.lng);
  const localizedPlaceName = getLocalizedPlaceName(place, language);

  useEffect(() => {
    if (!containerRef.current || !hasCoordinates) {
      return;
    }

    const center: [number, number] = [place.coordinates.lng, place.coordinates.lat];
    const map = new maplibregl.Map({
      attributionControl: false,
      center: center as LngLatLike,
      container: containerRef.current,
      maxZoom: 18,
      minZoom: 10,
      pitchWithRotate: false,
      style: OSM_RASTER_STYLE,
      zoom: 15.3,
    });

    const markerElement = document.createElement("div");

    markerElement.className = "cityquest-place-marker";
    markerElement.setAttribute(
      "aria-label",
      `${dictionary.places.detail.mapMarker}: ${localizedPlaceName}`,
    );

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    window.requestAnimationFrame(() => map.resize());

    const marker = new maplibregl.Marker({ element: markerElement, offset: [0, -20] })
      .setLngLat(center)
      .addTo(map);

    map.once("load", () => {
      map.resize();
      map.flyTo({
        center,
        duration: 0,
        zoom: 15.3,
      });
    });

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [
    dictionary.places.detail.mapMarker,
    hasCoordinates,
    localizedPlaceName,
    place.coordinates.lat,
    place.coordinates.lng,
  ]);

  if (!hasCoordinates) {
    return (
      <div
        className={cn(
          "grid min-h-[20rem] place-items-center bg-muted px-5 text-center",
          className,
        )}
      >
        <div className="max-w-sm">
          <div className="mx-auto grid size-12 place-items-center rounded-lg bg-card text-primary shadow-sm">
            <MapPin className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold">
            {dictionary.places.detail.mapUnavailableTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dictionary.places.detail.mapUnavailableText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("h-full min-h-[20rem] w-full bg-muted", className)}
      ref={containerRef}
    />
  );
}
