import { apiFetch } from "@/lib/api/http";
import type {
  AdminPlaceReviewPayload,
  AdminPlaceStatusPayload,
  AdminPlacesDataQualityResponse,
  AdminPlacesPendingResponse,
  ApiCollection,
  ApiResource,
  AuthResponse,
  Category,
  City,
  CityQuestNotification,
  CityRoute,
  CollectionsParams,
  GenerateRoutePayload,
  LoginPayload,
  MapPlacesParams,
  MapPlacesResponse,
  PersistRoutePreviewPayload,
  Place,
  PlaceCorrectionPayload,
  PlacesParams,
  PublicRoutesParams,
  RouteActivity,
  RegisterPayload,
  RoutePreviewResponse,
  StorePlacePayload,
  UpdateProfilePayload,
  User,
} from "@/lib/api/types";

export async function getCities(): Promise<City[]> {
  const response = await apiFetch<ApiCollection<City>>("/cities");

  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch<ApiCollection<Category>>("/categories");

  return response.data;
}

export async function getPlaces(params: PlacesParams = {}): Promise<ApiCollection<Place>> {
  return apiFetch<ApiCollection<Place>>("/places", { query: params });
}

export async function getMapPlaces(params: MapPlacesParams = {}): Promise<MapPlacesResponse> {
  return apiFetch<MapPlacesResponse>("/map/places", { query: params });
}

export async function getPlace(placeId: number): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/places/${placeId}`);

  return response.data;
}

export async function getPublicRoutes(
  params: PublicRoutesParams = {},
): Promise<ApiCollection<CityRoute>> {
  return apiFetch<ApiCollection<CityRoute>>("/routes/public", { query: params });
}

export async function getRoute(routeId: number): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>(`/routes/${routeId}`);

  return response.data;
}

export async function generateRoute(payload: GenerateRoutePayload): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>("/routes/generate", {
    body: payload,
    method: "POST",
  });

  return response.data;
}

export async function previewRoute(
  payload: GenerateRoutePayload,
): Promise<RoutePreviewResponse> {
  const response = await apiFetch<ApiResource<RoutePreviewResponse>>("/routes/preview", {
    body: payload,
    method: "POST",
  });

  return response.data;
}

export async function createRouteFromPreview(
  payload: PersistRoutePreviewPayload,
): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>("/routes/from-preview", {
    body: payload,
    method: "POST",
  });

  return response.data;
}

export async function getCollections(
  params: CollectionsParams = {},
): Promise<ApiCollection<CityRoute>> {
  return apiFetch<ApiCollection<CityRoute>>("/collections", { query: params });
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/login", {
    body: {
      device_name: "cityquest-web",
      ...payload,
    },
    method: "POST",
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/register", {
    body: {
      device_name: "cityquest-web",
      ...payload,
    },
    method: "POST",
  });
}

export async function logout(): Promise<void> {
  await apiFetch<{ message: string }>("/logout", { method: "POST" });
}

export async function getProfile(): Promise<User> {
  const response = await apiFetch<ApiResource<User>>("/profile");

  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiFetch<ApiResource<User>>("/profile", {
    body: payload,
    method: "PATCH",
  });

  return response.data;
}

export async function saveRoute(routeId: number): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>(`/routes/${routeId}/save`, {
    method: "POST",
  });

  return response.data;
}

export async function unsaveRoute(routeId: number): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>(`/routes/${routeId}/save`, {
    method: "DELETE",
  });

  return response.data;
}

export async function likeRoute(routeId: number): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>(`/routes/${routeId}/like`, {
    method: "POST",
  });

  return response.data;
}

export async function unlikeRoute(routeId: number): Promise<CityRoute> {
  const response = await apiFetch<ApiResource<CityRoute>>(`/routes/${routeId}/like`, {
    method: "DELETE",
  });

  return response.data;
}

export async function startRoute(routeId: number): Promise<RouteActivity> {
  const response = await apiFetch<ApiResource<RouteActivity>>(`/routes/${routeId}/start`, {
    method: "POST",
  });

  return response.data;
}

export async function completeRoute(routeId: number): Promise<RouteActivity> {
  const response = await apiFetch<ApiResource<RouteActivity>>(`/routes/${routeId}/complete`, {
    method: "POST",
  });

  return response.data;
}

export async function createPlace(payload: StorePlacePayload): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>("/places", {
    body: payload,
    method: "POST",
  });

  return response.data;
}

export async function suggestPlaceCorrection(
  placeId: number,
  payload: PlaceCorrectionPayload,
): Promise<{ id: number; status: string }> {
  const response = await apiFetch<ApiResource<{ id: number; status: string }>>(
    `/places/${placeId}/suggest-correction`,
    {
      body: { payload },
      method: "POST",
    },
  );

  return response.data;
}

export async function getAdminPendingPlaces(): Promise<AdminPlacesPendingResponse> {
  return apiFetch<AdminPlacesPendingResponse>("/admin/places/pending");
}

export async function getAdminPlacesDataQuality(): Promise<AdminPlacesDataQualityResponse> {
  return apiFetch<AdminPlacesDataQualityResponse>("/admin/places/data-quality");
}

export async function approveAdminPlace(
  placeId: number,
  payload: AdminPlaceReviewPayload = {},
): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/admin/places/${placeId}/approve`, {
    body: payload,
    method: "PATCH",
  });

  return response.data;
}

export async function rejectAdminPlace(
  placeId: number,
  payload: Pick<AdminPlaceReviewPayload, "note"> = {},
): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/admin/places/${placeId}/reject`, {
    body: payload,
    method: "PATCH",
  });

  return response.data;
}

export async function setAdminPlaceStatus(
  placeId: number,
  payload: AdminPlaceStatusPayload,
): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/admin/places/${placeId}/status`, {
    body: payload,
    method: "PATCH",
  });

  return response.data;
}

export async function favoritePlace(placeId: number): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/places/${placeId}/favorite`, {
    method: "POST",
  });

  return response.data;
}

export async function unfavoritePlace(placeId: number): Promise<Place> {
  const response = await apiFetch<ApiResource<Place>>(`/places/${placeId}/favorite`, {
    method: "DELETE",
  });

  return response.data;
}

export async function getNotifications(): Promise<CityQuestNotification[]> {
  const response = await apiFetch<ApiCollection<CityQuestNotification>>("/notifications");

  return response.data;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<CityQuestNotification> {
  const response = await apiFetch<ApiResource<CityQuestNotification>>(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );

  return response.data;
}
