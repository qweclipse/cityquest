export type LanguageCode = "ru" | "en" | "ro";

export type ThemePreference = "light" | "dark" | "system";

export type BudgetMode = "free" | "low" | "medium" | "any";

export type PlaceMode = "verified_only" | "include_community";

export type VerificationStatus =
  | "verified"
  | "community_confirmed"
  | "user_added"
  | "needs_review"
  | "needs_location_review"
  | "needs_image_review"
  | "needs_source_review"
  | "rejected"
  | "closed";

export type UserRole = "user" | "moderator" | "admin";

export type MapStatusFilter = "verified" | "community" | "all";

export type SourceType = "official" | "community" | "aggregated" | "manual" | "imported";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ApiResource<T> {
  data: T;
}

export interface ApiCollection<T> {
  data: T[];
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ListParams {
  page?: number;
  per_page?: number;
}

export interface City {
  id: number;
  country: string;
  name: string;
  slug: string;
  coordinates: Coordinates;
  timezone: string;
  currency_code: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  places_count?: number;
}

export interface PublicUser {
  id: number | null;
  name: string | null;
  avatar_url: string | null;
  level: number | null;
}

export interface PlacePhoto {
  id: number;
  image_url: string;
  source: string | null;
}

export interface Place {
  id: number;
  city?: City;
  category?: Category;
  created_by?: PublicUser;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  address: string | null;
  coordinates: Coordinates;
  average_price: {
    min: number | null;
    max: number | null;
    currency_code: string | null;
  };
  visit_duration_minutes: number | null;
  verification_status: VerificationStatus;
  source_type: SourceType;
  links: {
    official: string | null;
    google_maps: string | null;
    yandex_maps: string | null;
    external_source: string | null;
  };
  image_url: string | null;
  photos?: PlacePhoto[];
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface RoutePoint {
  id: number;
  order_number: number;
  estimated_duration_minutes: number | null;
  note: string | null;
  place?: Place;
}

export interface CityRoute {
  id: number;
  city?: City;
  author?: PublicUser;
  title: string;
  slug: string;
  description: string | null;
  route_type: string | null;
  vibe: string | null;
  duration_minutes: number | null;
  distance_km: number | null;
  budget: {
    min: number | null;
    max: number | null;
    currency_code: string | null;
  };
  is_public: boolean;
  likes_count: number;
  saves_count: number;
  image_url: string | null;
  created_source: string;
  points?: RoutePoint[];
  line?: Coordinates[];
  created_at: string | null;
  updated_at: string | null;
}

export type RouteActivityStatus = "started" | "completed";

export interface RouteActivity {
  id: number;
  status: RouteActivityStatus;
  route?: CityRoute | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type RoutePreviewVariantName = "balanced" | "rich" | "short";

export interface RoutePreviewPlace {
  estimated_duration_minutes: number | null;
  order_number: number;
  place: Place;
  place_id: number;
  reason: string;
}

export interface RoutePreviewVariant {
  currency_code: string | null;
  description: string;
  distance_km: number;
  duration_minutes: number;
  explanation: string;
  image_url: string | null;
  line: Coordinates[];
  places: RoutePreviewPlace[];
  price_max: number | null;
  price_min: number | null;
  route_type: string | null;
  tags: string[];
  title: string;
  tradeoffs: string[];
  variant: RoutePreviewVariantName;
  vibe: string | null;
}

export interface RoutePreviewResponse {
  input: GenerateRoutePayload;
  variants: RoutePreviewVariant[];
}

export interface PersistRoutePreviewPayload extends GenerateRoutePayload {
  preview: RoutePreviewVariant;
}

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  unlocked_at?: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  preferred_language: LanguageCode;
  preferred_theme: ThemePreference;
  level: number;
  preferred_city?: City | null;
  achievements?: Achievement[];
  saved_routes?: CityRoute[];
  favorite_places?: Place[];
  stats?: {
    achievements_count: number;
    completed_routes_count: number;
    contributions_count: number;
    favorite_places_count: number;
    saved_routes_count: number;
  };
  recent_route_activity?: RouteActivity[];
  suggested_next_route?: CityRoute | null;
  preferred_categories?: Category[];
  preferred_vibes?: string[];
  contribution_status?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    last_status: VerificationStatus | null;
    last_place_name: string | null;
  };
  created_at: string | null;
}

export type AvatarSlot =
  | "head"
  | "top"
  | "bottom"
  | "shoes"
  | "accessory"
  | "pet"
  | "background"
  | "effect";

export type AvatarRarity = "common" | "uncommon" | "rare" | "epic";

export interface AvatarItem {
  id: string;
  code: string;
  name: string;
  slot: AvatarSlot;
  rarity: AvatarRarity;
  owned: boolean;
  starter: boolean;
  visual: string;
  imageSrc?: string;
  description: string;
}

export type EquippedAvatarItems = Record<AvatarSlot, string>;

export interface UserProgress {
  level: number;
  xp: number;
  xp_to_next_level: number;
  routes_completed: number;
  places_discovered: number;
  items_owned_count: number;
  achievements_count: number;
}

export type PlaceCorrectionReason =
  | "name_address"
  | "price"
  | "source_link"
  | "image_link"
  | "status_issue"
  | "place_closed";

export interface PlaceCorrectionPayload {
  reason: PlaceCorrectionReason;
  note: string;
  name?: string | null;
  address?: string | null;
  average_price_min?: number | null;
  average_price_max?: number | null;
  official_url?: string | null;
  google_maps_url?: string | null;
  image_url?: string | null;
  status_issue?: string | null;
}

export interface PlaceCorrectionSuggestion {
  id: number;
  payload: PlaceCorrectionPayload;
  place: {
    id: number;
    name: string;
    verification_status: VerificationStatus;
  } | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  submitted_by: {
    id: number;
    name: string;
  } | null;
  created_at: string | null;
}

export interface AdminDuplicateCandidate {
  city_id: number;
  count: number;
  name: string;
}

export interface AdminPlacesPendingResponse {
  data: Place[];
  meta: {
    count: number;
  };
}

export interface AdminPlacesDataQualityResponse {
  data: {
    correction_suggestions: PlaceCorrectionSuggestion[];
    duplicate_candidates: AdminDuplicateCandidate[];
    missing_coordinates: Place[];
    missing_images: Place[];
    missing_source: Place[];
  };
  meta: {
    correction_suggestions_count: number;
    duplicate_candidates_count: number;
    missing_coordinates_count: number;
    missing_images_count: number;
    missing_source_count: number;
  };
}

export interface AdminPlaceReviewPayload {
  note?: string | null;
  status?: Extract<VerificationStatus, "verified" | "community_confirmed">;
}

export interface AdminPlaceStatusPayload {
  note?: string | null;
  status: VerificationStatus;
}

export interface CityQuestNotification {
  id: number;
  title: string;
  body: string | null;
  type: string;
  read_at: string | null;
  created_at: string | null;
}

export interface AuthResponse {
  token_type: "Bearer";
  token: string;
  user: User;
}

export interface PlacesParams extends ListParams {
  city_id?: number;
  category_id?: number;
  search?: string;
  verification_status?: VerificationStatus;
}

export interface MapPlacesParams {
  city_id?: number;
  category_id?: number;
  per_page?: number;
  status_filter?: MapStatusFilter;
}

export interface MapPlacesMeta {
  total_count: number;
  filtered_count: number;
  visible_count: number;
  mappable_count: number;
  unmappable_count: number;
  hidden_by_status_count: number;
  hidden_by_pagination_count: number;
  status_filter: MapStatusFilter;
  per_page: number;
  category_counts: {
    all: Record<string, number>;
    visible: Record<string, number>;
    mappable: Record<string, number>;
  };
}

export interface MapPlacesResponse {
  places: Place[];
  meta: MapPlacesMeta;
}

export interface PublicRoutesParams extends ListParams {
  city_id?: number;
  route_type?: string;
  vibe?: string;
}

export interface CollectionsParams extends ListParams {
  tab?: "popular" | "new" | "nearby" | "following";
  city_id?: number;
}

export interface GenerateRoutePayload {
  city_id: number;
  date?: string;
  preferred_day?: string;
  duration_minutes?: number;
  route_type?: string;
  vibe?: string;
  category_ids?: number[];
  interests?: string[];
  budget_mode?: BudgetMode;
  place_mode?: PlaceMode;
}

export interface StorePlacePayload {
  city_id: number;
  category_id: number;
  name: string;
  description: string;
  short_description?: string | null;
  address?: string | null;
  lat: number;
  lng: number;
  average_price_min?: number | null;
  average_price_max?: number | null;
  currency_code?: string | null;
  visit_duration_minutes?: number | null;
  official_url?: string | null;
  google_maps_url?: string | null;
  yandex_maps_url?: string | null;
  external_source_url?: string | null;
  image_url?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  password_confirmation: string;
  preferred_city_id?: number | null;
  preferred_language?: LanguageCode;
  preferred_theme?: ThemePreference;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar_url?: string | null;
  preferred_city_id?: number | null;
  preferred_language?: LanguageCode;
  preferred_theme?: ThemePreference;
}
