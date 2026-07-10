import type { CollectionsParams } from "@/lib/api/types";

export type CollectionTab = NonNullable<CollectionsParams["tab"]>;

export type CollectionRouteTypeFilter =
  | "all"
  | "budget"
  | "cafe_walk"
  | "culture"
  | "date"
  | "family"
  | "photo"
  | "walk";

export const collectionTabs: CollectionTab[] = [
  "popular",
  "new",
  "nearby",
  "following",
];

export const collectionRouteTypeFilters: CollectionRouteTypeFilter[] = [
  "all",
  "walk",
  "date",
  "family",
  "culture",
  "cafe_walk",
  "photo",
  "budget",
];

export function parseCollectionTab(value: string | undefined): CollectionTab {
  return isCollectionTab(value) ? value : "popular";
}

export function parseCollectionRouteType(
  value: string | undefined,
): CollectionRouteTypeFilter {
  return isCollectionRouteTypeFilter(value) ? value : "all";
}

function isCollectionTab(value: string | undefined): value is CollectionTab {
  return collectionTabs.includes(value as CollectionTab);
}

function isCollectionRouteTypeFilter(
  value: string | undefined,
): value is CollectionRouteTypeFilter {
  return collectionRouteTypeFilters.includes(value as CollectionRouteTypeFilter);
}
