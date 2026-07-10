import type { Category, Coordinates, Place, SourceType, VerificationStatus } from "@/lib/api/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function categoryDisplayName(
  category: Category | null | undefined,
  dictionary: Dictionary,
): string {
  switch (category?.slug) {
    case "architecture":
      return dictionary.places.categories.architecture;
    case "cafes":
      return dictionary.places.categories.cafes;
    case "culture":
      return dictionary.places.categories.culture;
    case "family":
      return dictionary.places.categories.family;
    case "food":
      return dictionary.places.categories.food;
    case "free-places":
      return dictionary.places.categories.freePlaces;
    case "hidden-places":
      return dictionary.places.categories.hiddenPlaces;
    case "history":
      return dictionary.places.categories.history;
    case "museums":
      return dictionary.places.categories.museums;
    case "parks":
      return dictionary.places.categories.parks;
    case "photo-spots":
      return dictionary.places.categories.photoSpots;
    case "romance":
      return dictionary.places.categories.romance;
    default:
      return category?.name ?? dictionary.places.categories.place;
  }
}

export function formatPlacePrice(place: Place, dictionary: Dictionary): string {
  const min = place.average_price.min;
  const max = place.average_price.max;
  const currency = place.average_price.currency_code ?? "";

  if (min === null && max === null) {
    return dictionary.places.cards.noPrice;
  }

  if ((min ?? 0) === 0 && (max ?? 0) === 0) {
    return dictionary.places.cards.free;
  }

  if (min === null && max !== null) {
    return `${dictionary.places.cards.upTo} ${Math.round(max)} ${currency}`.trim();
  }

  if (min !== null && max === null) {
    return `${dictionary.places.cards.from} ${Math.round(min)} ${currency}`.trim();
  }

  if (min === max) {
    return `${Math.round(min ?? 0)} ${currency}`.trim();
  }

  return `${Math.round(min ?? 0)}-${Math.round(max ?? 0)} ${currency}`.trim();
}

export function formatPlaceDuration(place: Place, dictionary: Dictionary): string {
  if (!place.visit_duration_minutes) {
    return dictionary.places.cards.durationUnknown;
  }

  return `${place.visit_duration_minutes} ${dictionary.routes.results.minutes}`;
}

export function placeVerificationLabel(
  status: VerificationStatus,
  dictionary: Dictionary,
): string {
  switch (status) {
    case "community_confirmed":
      return dictionary.places.verification.communityConfirmed;
    case "user_added":
      return dictionary.places.verification.userAdded;
    case "needs_review":
      return dictionary.places.verification.needsReview;
    case "needs_location_review":
      return dictionary.places.verification.needsLocationReview;
    case "needs_image_review":
      return dictionary.places.verification.needsImageReview;
    case "needs_source_review":
      return dictionary.places.verification.needsSourceReview;
    case "verified":
      return dictionary.places.verification.verified;
    case "rejected":
      return dictionary.places.verification.rejected;
    case "closed":
      return dictionary.places.verification.closed;
  }
}

export function placeSourceTypeLabel(sourceType: SourceType, dictionary: Dictionary): string {
  switch (sourceType) {
    case "aggregated":
      return dictionary.places.sources.aggregated;
    case "community":
      return dictionary.places.sources.community;
    case "imported":
    case "manual":
      return dictionary.places.sources.aggregated;
    case "official":
      return dictionary.places.sources.official;
  }
}

export function placeSourceTypeShortLabel(
  sourceType: SourceType,
  dictionary: Dictionary,
): string {
  switch (sourceType) {
    case "aggregated":
      return dictionary.places.sources.aggregatedShort;
    case "community":
      return dictionary.places.sources.communityShort;
    case "imported":
    case "manual":
      return dictionary.places.sources.aggregatedShort;
    case "official":
      return dictionary.places.sources.officialShort;
  }
}

export function placeMapUrl(place: Place | undefined): string | null {
  if (!place) {
    return null;
  }

  if (place.links.google_maps) {
    return place.links.google_maps;
  }

  if (isValidCoordinates(place.coordinates)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      formatCoordinates(place.coordinates),
    )}`;
  }

  return null;
}

export function formatPlaceCoordinates(place: Place): string {
  return formatCoordinates(place.coordinates);
}

function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}`;
}

function isValidCoordinates(
  coordinates: Coordinates | null | undefined,
): coordinates is Coordinates {
  return (
    typeof coordinates?.lat === "number" &&
    Number.isFinite(coordinates.lat) &&
    typeof coordinates.lng === "number" &&
    Number.isFinite(coordinates.lng)
  );
}
