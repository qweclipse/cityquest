"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as cityquestApi from "@/lib/api/cityquest-api";
import { cityquestKeys } from "@/lib/api/query-keys";
import type {
  AdminPlaceReviewPayload,
  AdminPlaceStatusPayload,
  CityRoute,
  CollectionsParams,
  GenerateRoutePayload,
  LoginPayload,
  MapPlacesParams,
  PersistRoutePreviewPayload,
  PlaceCorrectionPayload,
  PlacesParams,
  PublicRoutesParams,
  RegisterPayload,
  StorePlacePayload,
  UpdateProfilePayload,
  User,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";

const STATIC_STALE_TIME = 5 * 60 * 1000;

export function useCities() {
  return useQuery({
    queryFn: cityquestApi.getCities,
    queryKey: cityquestKeys.cities(),
    staleTime: STATIC_STALE_TIME,
  });
}

export function useCategories() {
  return useQuery({
    queryFn: cityquestApi.getCategories,
    queryKey: cityquestKeys.categories(),
    staleTime: STATIC_STALE_TIME,
  });
}

export function usePlaces(params: PlacesParams = {}) {
  return useQuery({
    queryFn: () => cityquestApi.getPlaces(params),
    queryKey: cityquestKeys.places(params),
  });
}

export function useMapPlaces(params: MapPlacesParams = {}) {
  return useQuery({
    enabled: typeof params.city_id === "number",
    queryFn: () => cityquestApi.getMapPlaces(params),
    queryKey: cityquestKeys.mapPlaces(params),
  });
}

export function usePlace(placeId: number | null) {
  return useQuery({
    enabled: placeId !== null,
    queryFn: () => cityquestApi.getPlace(placeId as number),
    queryKey: cityquestKeys.place(placeId ?? 0),
  });
}

export function usePublicRoutes(params: PublicRoutesParams = {}) {
  return useQuery({
    queryFn: () => cityquestApi.getPublicRoutes(params),
    queryKey: cityquestKeys.publicRoutes(params),
  });
}

export function useRoute(routeId: number | null) {
  return useQuery({
    enabled: routeId !== null,
    queryFn: () => cityquestApi.getRoute(routeId as number),
    queryKey: cityquestKeys.route(routeId ?? 0),
  });
}

export function useCollections(params: CollectionsParams = {}) {
  return useQuery({
    queryFn: () => cityquestApi.getCollections(params),
    queryKey: cityquestKeys.collections(params),
  });
}

export function useGenerateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateRoutePayload) => cityquestApi.generateRoute(payload),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
    },
  });
}

export function usePreviewRoute() {
  return useMutation({
    mutationFn: (payload: GenerateRoutePayload) => cityquestApi.previewRoute(payload),
  });
}

export function useCreateRouteFromPreview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersistRoutePreviewPayload) =>
      cityquestApi.createRouteFromPreview(payload),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.routesRoot() });
    },
  });
}

export function useLogin() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => cityquestApi.login(payload),
    onSuccess: (session) => {
      auth.setSession(session.token, session.user);
      queryClient.setQueryData(cityquestKeys.profile(), session.user);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useRegister() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => cityquestApi.register(payload),
    onSuccess: (session) => {
      auth.setSession(session.token, session.user);
      queryClient.setQueryData(cityquestKeys.profile(), session.user);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useLogout() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cityquestApi.logout,
    onSettled: () => {
      auth.clearSession();
      queryClient.removeQueries({ queryKey: cityquestKeys.auth() });
    },
  });
}

export function useProfile() {
  const auth = useAuth();

  return useQuery({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getProfile,
    queryKey: cityquestKeys.profile(),
  });
}

export function useSavedRoutes() {
  const auth = useAuth();

  return useQuery<User, Error, CityRoute[]>({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getProfile,
    queryKey: cityquestKeys.profile(),
    select: (profile) => profile.saved_routes ?? [],
  });
}

export function useFavoritePlaces() {
  const auth = useAuth();

  return useQuery({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getProfile,
    queryKey: cityquestKeys.profile(),
    select: (profile) => profile.favorite_places ?? [],
  });
}

export function useNotifications() {
  const auth = useAuth();

  return useQuery({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getNotifications,
    queryKey: cityquestKeys.notifications(),
  });
}

export function useUpdateProfile() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => cityquestApi.updateProfile(payload),
    onSuccess: (profile) => {
      auth.setUser(profile);
      queryClient.setQueryData(cityquestKeys.profile(), profile);
    },
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StorePlacePayload) => cityquestApi.createPlace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityquestKeys.admin() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.placesRoot() });
    },
  });
}

export function useSuggestPlaceCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      placeId,
    }: {
      payload: PlaceCorrectionPayload;
      placeId: number;
    }) => cityquestApi.suggestPlaceCorrection(placeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityquestKeys.adminPlacesDataQuality() });
    },
  });
}

export function useAdminPendingPlaces() {
  const auth = useAuth();

  return useQuery({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getAdminPendingPlaces,
    queryKey: cityquestKeys.adminPlacesPending(),
  });
}

export function useAdminPlacesDataQuality() {
  const auth = useAuth();

  return useQuery({
    enabled: auth.isHydrated && auth.isAuthenticated,
    queryFn: cityquestApi.getAdminPlacesDataQuality,
    queryKey: cityquestKeys.adminPlacesDataQuality(),
  });
}

export function useApproveAdminPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload = {},
      placeId,
    }: {
      payload?: AdminPlaceReviewPayload;
      placeId: number;
    }) => cityquestApi.approveAdminPlace(placeId, payload),
    onSuccess: (place) => {
      queryClient.setQueryData(cityquestKeys.place(place.id), place);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.admin() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.placesRoot() });
    },
  });
}

export function useRejectAdminPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload = {},
      placeId,
    }: {
      payload?: Pick<AdminPlaceReviewPayload, "note">;
      placeId: number;
    }) => cityquestApi.rejectAdminPlace(placeId, payload),
    onSuccess: (place) => {
      queryClient.setQueryData(cityquestKeys.place(place.id), place);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.admin() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.placesRoot() });
    },
  });
}

export function useSetAdminPlaceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      placeId,
    }: {
      payload: AdminPlaceStatusPayload;
      placeId: number;
    }) => cityquestApi.setAdminPlaceStatus(placeId, payload),
    onSuccess: (place) => {
      queryClient.setQueryData(cityquestKeys.place(place.id), place);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.admin() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.placesRoot() });
    },
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.saveRoute(routeId),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useUnsaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.unsaveRoute(routeId),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useLikeRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.likeRoute(routeId),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.routesRoot() });
    },
  });
}

export function useUnlikeRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.unlikeRoute(routeId),
    onSuccess: (route) => {
      queryClient.setQueryData(cityquestKeys.route(route.id), route);
      queryClient.invalidateQueries({ queryKey: cityquestKeys.routesRoot() });
    },
  });
}

export function useStartRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.startRoute(routeId),
    onSuccess: (activity) => {
      if (activity.route) {
        queryClient.setQueryData(cityquestKeys.route(activity.route.id), activity.route);
      }

      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useCompleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: number) => cityquestApi.completeRoute(routeId),
    onSuccess: (activity) => {
      if (activity.route) {
        queryClient.setQueryData(cityquestKeys.route(activity.route.id), activity.route);
      }

      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: cityquestKeys.routesRoot() });
    },
  });
}

export function useFavoritePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: number) => cityquestApi.favoritePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useUnfavoritePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: number) => cityquestApi.unfavoritePlace(placeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityquestKeys.profile() });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      cityquestApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cityquestKeys.notifications() });
    },
  });
}
