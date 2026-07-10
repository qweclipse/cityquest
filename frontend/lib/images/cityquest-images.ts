import type { Category, CityRoute, Place } from "@/lib/api/types";

export type ImageQuality = "category_fallback" | "needs_review" | "real_photo";

export interface CityQuestImageSelection {
  alternates: string[];
  fallbackSrc: string;
  label: string;
  poolKey: string;
  quality: ImageQuality;
  seed: string;
  source: "category-fallback" | "missing" | "photo" | "route-fallback";
  src: string;
  title: string;
}

type PlaceImageInput = Pick<
  Place,
  "category" | "id" | "image_url" | "name" | "photos" | "slug"
>;

type RouteImageInput = Pick<
  CityRoute,
  "id" | "image_url" | "points" | "route_type" | "slug" | "title" | "vibe"
>;

interface StableImageOptions {
  index?: number;
  stableKey?: string;
}

const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp|svg)(\?.*)?$/i;
const FALLBACK_PATH_PATTERN = /^\/images\/(?:fallbacks|routes)\//i;
const REAL_LOCAL_IMAGE_PATTERN = /^\/images\/places\//i;

const PLACE_FALLBACKS = {
  architecture: numbered("/images/fallbacks/architecture/architecture", 4),
  cafes: numbered("/images/fallbacks/cafes/cafe", 4),
  culture: numbered("/images/fallbacks/culture/culture", 4),
  family: numbered("/images/fallbacks/family/family", 4),
  food: numbered("/images/fallbacks/food/food", 4),
  general: numbered("/images/fallbacks/general/general", 4),
  hidden: numbered("/images/fallbacks/general/general", 4),
  history: [
    ...numbered("/images/fallbacks/architecture/architecture", 2),
    ...numbered("/images/fallbacks/culture/culture", 2),
  ],
  museums: numbered("/images/fallbacks/museums/museum", 4),
  parks: numbered("/images/fallbacks/parks/park", 4),
  photo: [
    ...numbered("/images/fallbacks/architecture/architecture", 2),
    ...numbered("/images/fallbacks/general/general", 2),
  ],
  romance: [
    ...numbered("/images/routes/date-route", 2),
    "/images/fallbacks/cafes/cafe-1.jpg",
    "/images/fallbacks/parks/park-1.jpg",
  ],
} satisfies Record<string, string[]>;

const ROUTE_FALLBACKS = {
  budget: [
    ...numbered("/images/routes/budget-route", 2),
    "/images/fallbacks/parks/park-1.jpg",
    "/images/fallbacks/general/route-1.jpg",
  ],
  cafe: [
    ...numbered("/images/routes/cafe-route", 2),
    ...numbered("/images/fallbacks/cafes/cafe", 2),
  ],
  cafe_walk: [
    ...numbered("/images/routes/cafe-route", 2),
    ...numbered("/images/fallbacks/food/food", 2),
  ],
  culture: [
    ...numbered("/images/routes/culture-route", 2),
    ...numbered("/images/fallbacks/culture/culture", 2),
  ],
  date: [
    ...numbered("/images/routes/date-route", 2),
    "/images/fallbacks/cafes/cafe-1.jpg",
    "/images/fallbacks/parks/park-1.jpg",
  ],
  family: [
    ...numbered("/images/routes/family-route", 2),
    ...numbered("/images/fallbacks/family/family", 2),
  ],
  friends: [
    ...numbered("/images/routes/city-route", 2),
    ...numbered("/images/fallbacks/general/route", 2),
  ],
  photo: [
    ...numbered("/images/routes/photo-route", 2),
    ...numbered("/images/fallbacks/architecture/architecture", 2),
  ],
  walk: [
    ...numbered("/images/routes/walk-route", 2),
    ...numbered("/images/fallbacks/parks/park", 2),
  ],
} satisfies Record<string, string[]>;

const GENERAL_ROUTE_FALLBACKS = [
  ...numbered("/images/fallbacks/general/route", 4),
  ...numbered("/images/routes/city-route", 2),
];

const CATEGORY_FALLBACK_ALIASES: Record<string, keyof typeof PLACE_FALLBACKS> = {
  architecture: "architecture",
  cafes: "cafes",
  culture: "culture",
  family: "family",
  food: "food",
  "free-places": "parks",
  "hidden-places": "hidden",
  history: "history",
  museums: "museums",
  parks: "parks",
  "photo-spots": "photo",
  place: "general",
  romance: "romance",
};

const IMAGE_LABELS: Record<ImageQuality, { label: string; title: string }> = {
  category_fallback: {
    label: "Curated image",
    title: "Local curated fallback image. Replace with a real place photo when available.",
  },
  needs_review: {
    label: "Needs image",
    title: "No reliable image is available yet. This item needs image review.",
  },
  real_photo: {
    label: "Photo",
    title: "Real supplied photo URL.",
  },
};

export function getPlaceImage(place: PlaceImageInput, options: StableImageOptions = {}): string {
  return getPlaceImageMeta(place, options).src;
}

export function getPlaceImageMeta(
  place: PlaceImageInput,
  options: StableImageOptions = {},
): CityQuestImageSelection {
  const fallback = getCategoryFallback(place.category, placeSeed(place, options.stableKey), {
    index: options.index,
  });
  const primaryImage = normalizedPrimaryImage(place.image_url);
  const photoImage = normalizedPrimaryImage(place.photos?.[0]?.image_url ?? null);
  const realImage = primaryImage ?? photoImage;

  if (realImage) {
    return createImageSelection({
      fallback,
      poolKey: fallback.poolKey,
      quality: "real_photo",
      seed: fallback.seed,
      source: "photo",
      src: realImage,
    });
  }

  if (!place.image_url?.trim() && !place.photos?.[0]?.image_url?.trim()) {
    return createImageSelection({
      fallback,
      poolKey: fallback.poolKey,
      quality: "needs_review",
      seed: fallback.seed,
      source: "missing",
      src: fallback.src,
    });
  }

  return fallback;
}

export function getRouteImage(route: RouteImageInput, options: StableImageOptions = {}): string {
  return getRouteImageMeta(route, options).src;
}

export function getRouteImageMeta(
  route: RouteImageInput,
  options: StableImageOptions = {},
): CityQuestImageSelection {
  const fallback = getRouteFallback(route, routeSeed(route, options.stableKey), {
    index: options.index,
  });
  const primaryImage = normalizedPrimaryImage(route.image_url);

  if (primaryImage) {
    return createImageSelection({
      fallback,
      poolKey: fallback.poolKey,
      quality: "real_photo",
      seed: fallback.seed,
      source: "photo",
      src: primaryImage,
    });
  }

  if (!route.image_url?.trim()) {
    return createImageSelection({
      fallback,
      poolKey: fallback.poolKey,
      quality: "needs_review",
      seed: fallback.seed,
      source: "missing",
      src: fallback.src,
    });
  }

  return fallback;
}

export function getCategoryFallback(
  category: Pick<Category, "slug"> | null | undefined,
  stableKey: string,
  options: StableImageOptions = {},
): CityQuestImageSelection {
  const poolKey = getPlaceFallbackKey(category);
  const pool = PLACE_FALLBACKS[poolKey] ?? PLACE_FALLBACKS.general;
  const src = pickStableImage(pool, stableKey, options.index);

  return createImageSelection({
    alternates: pool,
    fallbackSrc: src,
    poolKey,
    quality: "category_fallback",
    seed: stableKey,
    source: "category-fallback",
    src,
  });
}

export function getRouteFallback(
  route: Pick<CityRoute, "points" | "route_type" | "vibe">,
  stableKey: string,
  options: StableImageOptions = {},
): CityQuestImageSelection {
  const routeType = route.route_type ?? "";
  const directRoutePool = ROUTE_FALLBACKS[routeType as keyof typeof ROUTE_FALLBACKS];

  if (directRoutePool) {
    return fallbackSelection(directRoutePool, routeType, stableKey, options.index);
  }

  const pointCategoryPoolKey = route.points
    ?.flatMap((point) => (point.place ? [point.place.category] : []))
    .map(getPlaceFallbackKey)
    .find((poolKey) => PLACE_FALLBACKS[poolKey]?.length > 0);

  if (pointCategoryPoolKey) {
    return fallbackSelection(
      PLACE_FALLBACKS[pointCategoryPoolKey],
      pointCategoryPoolKey,
      stableKey,
      options.index,
    );
  }

  const vibePoolKey = route.vibe === "romantic" ? "date" : "general-route";
  const pool = vibePoolKey === "date" ? ROUTE_FALLBACKS.date : GENERAL_ROUTE_FALLBACKS;

  return fallbackSelection(pool, vibePoolKey, stableKey, options.index);
}

export function isFallbackImage(imageUrl: string | null | undefined): boolean {
  return Boolean(imageUrl?.trim().match(FALLBACK_PATH_PATTERN));
}

export function isFallbackImagePath(imageUrl: string | null | undefined): boolean {
  return isFallbackImage(imageUrl);
}

export function getImageQuality(imageUrl: string | null | undefined): ImageQuality {
  const image = imageUrl?.trim();

  if (!image) {
    return "needs_review";
  }

  if (isFallbackImage(image)) {
    return "category_fallback";
  }

  if (isProbablyImageUrl(image)) {
    return "real_photo";
  }

  return "needs_review";
}

export function avoidAdjacentDuplicateImages<T>(
  items: readonly T[],
  getImage: (item: T, index: number) => CityQuestImageSelection,
): CityQuestImageSelection[] {
  let previousSrc: string | null = null;

  return items.map((item, index) => {
    const selection = getImage(item, index);
    const resolvedSelection =
      selection.src === previousSrc && selection.quality !== "real_photo"
        ? nextFallbackSelection(selection, previousSrc)
        : selection;

    previousSrc = resolvedSelection.src;

    return resolvedSelection;
  });
}

function fallbackSelection(
  pool: string[],
  poolKey: string,
  stableKey: string,
  index?: number,
): CityQuestImageSelection {
  const src = pickStableImage(pool, stableKey, index);

  return createImageSelection({
    alternates: pool,
    fallbackSrc: src,
    poolKey,
    quality: "category_fallback",
    seed: stableKey,
    source: "route-fallback",
    src,
  });
}

function nextFallbackSelection(
  selection: CityQuestImageSelection,
  previousSrc: string | null,
): CityQuestImageSelection {
  if (selection.alternates.length < 2) {
    return selection;
  }

  const currentIndex = selection.alternates.indexOf(selection.src);
  const startIndex = currentIndex >= 0 ? currentIndex + 1 : stableHash(selection.seed);
  const nextSrc =
    selection.alternates.find((candidate, index) => index >= startIndex && candidate !== previousSrc) ??
    selection.alternates.find((candidate) => candidate !== previousSrc) ??
    selection.src;

  return {
    ...selection,
    fallbackSrc: nextSrc,
    src: nextSrc,
  };
}

function createImageSelection({
  alternates,
  fallback,
  fallbackSrc,
  poolKey,
  quality,
  seed,
  source,
  src,
}: {
  alternates?: string[];
  fallback?: CityQuestImageSelection;
  fallbackSrc?: string;
  poolKey: string;
  quality: ImageQuality;
  seed: string;
  source: CityQuestImageSelection["source"];
  src: string;
}): CityQuestImageSelection {
  const labels = IMAGE_LABELS[quality];
  const resolvedFallbackSrc = fallbackSrc ?? fallback?.fallbackSrc ?? PLACE_FALLBACKS.general[0];

  return {
    alternates: alternates ?? fallback?.alternates ?? [resolvedFallbackSrc],
    fallbackSrc: resolvedFallbackSrc,
    label: labels.label,
    poolKey,
    quality,
    seed,
    source,
    src,
    title: labels.title,
  };
}

function normalizedPrimaryImage(imageUrl: string | null | undefined): string | null {
  const image = imageUrl?.trim();

  if (!image || getImageQuality(image) !== "real_photo") {
    return null;
  }

  return image;
}

function getPlaceFallbackKey(
  category: Pick<Category, "slug"> | null | undefined,
): keyof typeof PLACE_FALLBACKS {
  const categorySlug = category?.slug;

  if (!categorySlug) {
    return "general";
  }

  return CATEGORY_FALLBACK_ALIASES[categorySlug] ?? "general";
}

function pickStableImage(pool: readonly string[], seed: string, index?: number): string {
  const stableIndex = (stableHash(seed) + (index ?? 0)) % pool.length;

  return pool[stableIndex];
}

function placeSeed(place: Pick<Place, "id" | "name" | "slug">, stableKey?: string): string {
  return stableKey ?? `${place.id}:${place.slug}:${place.name}`;
}

function routeSeed(
  route: Pick<CityRoute, "id" | "route_type" | "slug" | "title" | "vibe">,
  stableKey?: string,
): string {
  return stableKey ?? `${route.id}:${route.slug}:${route.title}:${route.route_type ?? ""}:${route.vibe ?? ""}`;
}

function stableHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function numbered(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index + 1}.jpg`);
}

function isProbablyImageUrl(image: string): boolean {
  if (REAL_LOCAL_IMAGE_PATTERN.test(image)) {
    return IMAGE_EXTENSION_PATTERN.test(image);
  }

  if (/^https?:\/\//i.test(image)) {
    try {
      new URL(image);

      return true;
    } catch {
      return false;
    }
  }

  return false;
}
