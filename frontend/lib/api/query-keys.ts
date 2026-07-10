import type {
  CollectionsParams,
  MapPlacesParams,
  PlacesParams,
  PublicRoutesParams,
} from "@/lib/api/types";

export const cityquestKeys = {
  all: ["cityquest"] as const,
  admin: () => [...cityquestKeys.all, "admin"] as const,
  adminPlacesDataQuality: () => [...cityquestKeys.admin(), "places", "data-quality"] as const,
  adminPlacesPending: () => [...cityquestKeys.admin(), "places", "pending"] as const,
  auth: () => [...cityquestKeys.all, "auth"] as const,
  categories: () => [...cityquestKeys.all, "categories"] as const,
  cities: () => [...cityquestKeys.all, "cities"] as const,
  collections: (params: CollectionsParams = {}) =>
    [...cityquestKeys.all, "collections", params] as const,
  favoritePlaces: () => [...cityquestKeys.profile(), "favorite-places"] as const,
  mapPlaces: (params: MapPlacesParams = {}) =>
    [...cityquestKeys.placesRoot(), "map", params] as const,
  notifications: () => [...cityquestKeys.profile(), "notifications"] as const,
  place: (placeId: number) => [...cityquestKeys.placesRoot(), "detail", placeId] as const,
  places: (params: PlacesParams = {}) => [...cityquestKeys.placesRoot(), "list", params] as const,
  placesRoot: () => [...cityquestKeys.all, "places"] as const,
  profile: () => [...cityquestKeys.auth(), "profile"] as const,
  publicRoutes: (params: PublicRoutesParams = {}) =>
    [...cityquestKeys.routesRoot(), "public", params] as const,
  route: (routeId: number) => [...cityquestKeys.routesRoot(), "detail", routeId] as const,
  routesRoot: () => [...cityquestKeys.all, "routes"] as const,
  savedRoutes: () => [...cityquestKeys.profile(), "saved-routes"] as const,
};
