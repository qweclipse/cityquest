import type { CityRoute, Coordinates, LanguageCode, RoutePoint } from "@/lib/api/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLocalizedRouteContent } from "@/lib/i18n/content-localization";

export { placeMapUrl } from "@/lib/places/place-format";

export function routeDisplayTitle(
  route: CityRoute,
  dictionary: Dictionary,
  language?: LanguageCode,
): string {
  if (route.created_source !== "generated" || !route.route_type || !route.vibe) {
    return language ? getLocalizedRouteContent(route, language).title : route.title;
  }

  const routeType = route.route_type as keyof typeof dictionary.routes.create.routeType;
  const vibe = route.vibe as keyof typeof dictionary.routes.create.vibe;
  const routeTypeLabel = dictionary.routes.create.routeType[routeType];
  const vibeLabel = dictionary.routes.create.vibe[vibe];

  if (!routeTypeLabel || !vibeLabel) {
    return language ? getLocalizedRouteContent(route, language).title : route.title;
  }

  return `${routeTypeLabel} \u00b7 ${vibeLabel}`;
}

export function routeTypeDisplayLabel(
  routeType: string | null,
  dictionary: Dictionary,
): string {
  switch (routeType) {
    case "budget":
      return dictionary.routes.labels.routeTypes.budget;
    case "cafe":
      return dictionary.routes.labels.routeTypes.cafe;
    case "cafe_walk":
      return dictionary.routes.labels.routeTypes.cafeWalk;
    case "culture":
      return dictionary.routes.labels.routeTypes.culture;
    case "date":
      return dictionary.routes.labels.routeTypes.date;
    case "family":
      return dictionary.routes.labels.routeTypes.family;
    case "friends":
      return dictionary.routes.labels.routeTypes.friends;
    case "photo":
      return dictionary.routes.labels.routeTypes.photo;
    case "walk":
      return dictionary.routes.labels.routeTypes.walk;
    default:
      return dictionary.routes.labels.routeTypes.other;
  }
}

export function routeVibeDisplayLabel(vibe: string | null, dictionary: Dictionary): string {
  switch (vibe) {
    case "balanced":
      return dictionary.routes.labels.vibes.balanced;
    case "calm":
      return dictionary.routes.labels.vibes.calm;
    case "classic":
      return dictionary.routes.labels.vibes.classic;
    case "creative":
      return dictionary.routes.labels.vibes.creative;
    case "easy":
      return dictionary.routes.labels.vibes.easy;
    case "history":
      return dictionary.routes.labels.vibes.history;
    case "inspiring":
      return dictionary.routes.labels.vibes.inspiring;
    case "local":
      return dictionary.routes.labels.vibes.local;
    case "romantic":
      return dictionary.routes.labels.vibes.romantic;
    default:
      return dictionary.routes.labels.vibes.other;
  }
}

export function formatRouteBudget(route: CityRoute, label: string): string {
  return `${label}: ${formatRouteBudgetRange(route)}`.trim();
}

export function formatRouteBudgetRange(route: CityRoute): string {
  const min = route.budget.min ?? 0;
  const max = route.budget.max ?? 0;
  const currency = route.budget.currency_code ?? "";

  if (min === 0 && max === 0) {
    return `0 ${currency}`.trim();
  }

  if (min === max) {
    return `${Math.round(min)} ${currency}`.trim();
  }

  return `${Math.round(min)}-${Math.round(max)} ${currency}`.trim();
}

export function orderedRoutePoints(route: CityRoute): RoutePoint[] {
  return [...(route.points ?? [])].sort(
    (leftPoint, rightPoint) => leftPoint.order_number - rightPoint.order_number,
  );
}

export function routePointCoordinates(point: RoutePoint): Coordinates | null {
  return isValidCoordinates(point.place?.coordinates) ? point.place.coordinates : null;
}

export function routeLineCoordinates(route: CityRoute): Coordinates[] {
  const line = (route.line ?? []).filter(isValidCoordinates);

  if (line.length >= 2) {
    return line;
  }

  return orderedRoutePoints(route).flatMap((point) => {
    const coordinates = routePointCoordinates(point);

    return coordinates ? [coordinates] : [];
  });
}

export function routeDirectionsUrl(route: CityRoute): string | null {
  const coordinates = orderedRoutePoints(route).flatMap((point) => {
    const pointCoordinates = routePointCoordinates(point);

    return pointCoordinates ? [pointCoordinates] : [];
  });

  if (coordinates.length < 2) {
    return null;
  }

  const origin = coordinates[0];
  const destination = coordinates[coordinates.length - 1];
  const waypoints = coordinates.slice(1, -1);
  const url = new URL("https://www.google.com/maps/dir/");

  url.searchParams.set("api", "1");
  url.searchParams.set("origin", formatCoordinates(origin));
  url.searchParams.set("destination", formatCoordinates(destination));
  url.searchParams.set("travelmode", "walking");

  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints.map(formatCoordinates).join("|"));
  }

  return url.toString();
}

function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.lat},${coordinates.lng}`;
}

function isValidCoordinates(coordinates: Coordinates | null | undefined): coordinates is Coordinates {
  return (
    typeof coordinates?.lat === "number" &&
    Number.isFinite(coordinates.lat) &&
    typeof coordinates.lng === "number" &&
    Number.isFinite(coordinates.lng)
  );
}
