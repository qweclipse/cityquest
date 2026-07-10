"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  MapPin,
  MapPinned,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import { CityMap } from "@/components/map/city-map";
import { buttonVariants } from "@/components/ui/button";
import { useCategories, useCities, useMapPlaces } from "@/hooks/api";
import type { MapPlacesMeta, MapStatusFilter, Place } from "@/lib/api/types";
import { cityMapCopy } from "@/lib/i18n/feature-copy";
import { getLocalizedPlaceContent } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  formatPlaceDuration,
  formatPlacePrice,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  categoryAccentClass,
  questAccentBadgeClassName,
  questAccentClass,
  questAccentPanelClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

const INITIAL_MAP_LIMIT = 250;
const MAP_LIMIT_STEP = 250;

type CityMapCopy = (typeof cityMapCopy)[keyof typeof cityMapCopy];

export function MapPage() {
  const { dictionary, language } = useI18n();
  const copy = cityMapCopy[language];
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<number | null>(null);
  const [mapLimit, setMapLimit] = useState(INITIAL_MAP_LIMIT);
  const [statusFilter, setStatusFilter] = useState<MapStatusFilter>("community");
  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const city = citiesQuery.data?.[0] ?? null;
  const categories = categoriesQuery.data ?? [];
  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const mapPlacesQuery = useMapPlaces({
    category_id: activeCategoryId ?? undefined,
    city_id: city?.id,
    per_page: mapLimit,
    status_filter: statusFilter,
  });
  const mapMeta = mapPlacesQuery.data?.meta ?? null;
  const places = useMemo(() => mapPlacesQuery.data?.places ?? [], [mapPlacesQuery.data?.places]);
  const mappablePlaces = useMemo(() => places.filter(isMappablePlace), [places]);
  const selectedPlaceId =
    activePlaceId !== null && mappablePlaces.some((place) => place.id === activePlaceId)
      ? activePlaceId
      : mappablePlaces[0]?.id ?? null;
  const activePlace =
    selectedPlaceId === null
      ? null
      : mappablePlaces.find((place) => place.id === selectedPlaceId) ?? null;
  const isLoading = mapPlacesQuery.isLoading || citiesQuery.isLoading || categoriesQuery.isLoading;
  const visibleMapCount = mapMeta?.mappable_count ?? mappablePlaces.length;
  const filteredCount = mapMeta?.filtered_count ?? places.length;
  const allCategoryTotal = mapMeta
    ? sumCounts(mapMeta.category_counts.all)
    : categories.reduce((sum, category) => sum + (category.places_count ?? 0), 0);
  const allCategoryVisible = mapMeta
    ? sumCounts(mapMeta.category_counts.mappable)
    : mappablePlaces.length;
  const statusOptions = [
    { label: copy.filters.community, value: "community" },
    { label: copy.filters.verified, value: "verified" },
    { label: copy.filters.all, value: "all" },
  ] satisfies Array<{ label: string; value: MapStatusFilter }>;

  const resetMapWindow = () => {
    setActivePlaceId(null);
    setMapLimit(INITIAL_MAP_LIMIT);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setActiveCategoryId(categoryId);
    resetMapWindow();
  };

  const handleStatusFilterChange = (nextStatusFilter: MapStatusFilter) => {
    setStatusFilter(nextStatusFilter);
    resetMapWindow();
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {copy.hero.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{copy.hero.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.hero.subtitle}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[28rem]">
          <div className={cn("rounded-lg border p-3 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPinned className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              {city?.name ?? dictionary.common.defaultCity}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatTemplate(copy.meta.showing, {
                filtered: filteredCount,
                visible: visibleMapCount,
              })}
              {activeCategory ? (
                <>
                  {" "}
                  · {categoryDisplayName(activeCategory, dictionary)}
                </>
              ) : null}
            </div>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/routes/create">
            <Route className="size-4" aria-hidden="true" />
            {copy.actions.createRoute}
          </Link>
        </div>
      </div>

      <div className={cn("mt-5 rounded-lg border p-3 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              {copy.meta.categories}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                aria-pressed={activeCategoryId === null}
                className={cn(
                  filterClass(activeCategoryId === null),
                  questAccentClass("teal"),
                  activeCategoryId === null &&
                    "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]",
                )}
                onClick={() => handleCategoryChange(null)}
                title={formatTemplate(copy.meta.countHint, {
                  total: allCategoryTotal,
                  visible: allCategoryVisible,
                })}
                type="button"
              >
                {copy.actions.allCategories}
                <span className="text-muted-foreground">
                  {countLabel(allCategoryVisible, allCategoryTotal)}
                </span>
              </button>
              {categories.map((category) => {
                const totalCategoryCount = getCategoryCount(mapMeta, "all", category.id) ??
                  category.places_count ??
                  0;
                const visibleCategoryCount =
                  getCategoryCount(mapMeta, "mappable", category.id) ??
                  (mapMeta ? 0 : category.places_count ?? 0);

                return (
                  <button
                    aria-pressed={category.id === activeCategoryId}
                    className={cn(
                      filterClass(category.id === activeCategoryId),
                      categoryAccentClass(category),
                      category.id === activeCategoryId
                        ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]"
                        : "hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]",
                    )}
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    title={formatTemplate(copy.meta.countHint, {
                      total: totalCategoryCount,
                      visible: visibleCategoryCount,
                    })}
                    type="button"
                  >
                    {categoryDisplayName(category, dictionary)}
                    <span className="text-muted-foreground">
                      {countLabel(visibleCategoryCount, totalCategoryCount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:w-[25rem]">
            <div className="mb-2 text-sm font-semibold">{copy.filters.statusLabel}</div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {statusOptions.map((option) => (
                <button
                  aria-pressed={statusFilter === option.value}
                  className={cn(
                    statusFilterClass(statusFilter === option.value),
                    questAccentClass("teal"),
                    statusFilter === option.value &&
                      "border-[var(--quest-accent-border)] bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]",
                  )}
                  key={option.value}
                  onClick={() => handleStatusFilterChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <MapMetaNotices
          copy={copy}
          mapMeta={mapMeta}
          onLoadMore={() => setMapLimit((currentLimit) => currentLimit + MAP_LIMIT_STEP)}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="overflow-hidden rounded-lg border border-[color-mix(in_oklch,var(--quest-teal),var(--border)_58%)] bg-card shadow-sm">
          {isLoading ? (
            <MapLoading title={copy.states.loading} />
          ) : mapPlacesQuery.isError ? (
            <MapState
              icon="error"
              text={copy.states.errorText}
              title={copy.states.errorTitle}
            />
          ) : mappablePlaces.length === 0 ? (
            <MapState text={copy.states.emptyText} title={copy.states.emptyTitle} />
          ) : (
            <CityMap
              activePlaceId={activePlace?.id ?? null}
              className="min-h-[32rem] xl:min-h-[44rem]"
              emptyText={copy.states.mapUnavailableText}
              emptyTitle={copy.states.mapUnavailableTitle}
              markerLabel={copy.markers.markerLabel}
              onPlaceSelect={setActivePlaceId}
              places={mappablePlaces}
            />
          )}
        </div>

        <aside className="space-y-4">
          {activePlace ? (
            <SelectedPlaceCard
              place={activePlace}
              selectedLabel={copy.markers.selected}
              title={copy.meta.selected}
            />
          ) : null}

          <section className={cn("rounded-lg border p-4 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{copy.actions.places}</h2>
              <span className="text-sm text-muted-foreground">{mappablePlaces.length}</span>
            </div>
            <div className="mt-4 space-y-2 xl:max-h-[31rem] xl:overflow-y-auto xl:pr-1">
              {mappablePlaces.length > 0 ? (
                mappablePlaces.map((place) => (
                  <PlaceListButton
                    active={place.id === activePlace?.id}
                    key={place.id}
                    onSelect={() => setActivePlaceId(place.id)}
                    place={place}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                  {copy.states.emptyText}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function SelectedPlaceCard({
  place,
  selectedLabel,
  title,
}: {
  place: Place;
  selectedLabel: string;
  title: string;
}) {
  const { dictionary, language } = useI18n();
  const accentClass = categoryAccentClass(place.category);
  const localizedPlace = getLocalizedPlaceContent(place, language);

  return (
    <section className={cn("rounded-lg border p-4 shadow-sm", accentClass, questAccentPanelClassName)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className={cn("rounded-lg px-2 py-1 text-xs font-semibold", questAccentBadgeClassName)}>
          {selectedLabel}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{localizedPlace.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {localizedPlace.shortDescription ?? localizedPlace.description}
      </p>
      <div className="mt-4 grid gap-2 text-sm">
        <FactRow
          icon={MapPin}
          label={place.address ?? dictionary.places.cards.noAddress}
        />
        <FactRow icon={Clock} label={formatPlaceDuration(place, dictionary)} />
        <FactRow icon={WalletCards} label={formatPlacePrice(place, dictionary)} />
        <FactRow
          icon={ShieldCheck}
          label={placeVerificationLabel(place.verification_status, dictionary)}
        />
      </div>
      <Link
        className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
        href={`/places/${place.id}`}
      >
        {dictionary.places.actions.open}
      </Link>
    </section>
  );
}

function PlaceListButton({
  active,
  onSelect,
  place,
}: {
  active: boolean;
  onSelect: () => void;
  place: Place;
}) {
  const { dictionary, language } = useI18n();
  const category = categoryDisplayName(place.category, dictionary);
  const accentClass = categoryAccentClass(place.category);
  const localizedPlace = getLocalizedPlaceContent(place, language);

  return (
    <button
      className={cn(
        "w-full rounded-lg border border-border bg-background p-3 text-left transition hover:bg-muted",
        accentClass,
        active && "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)]",
      )}
      onClick={onSelect}
      type="button"
    >
      <span className="block font-semibold">{localizedPlace.name}</span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {category} · {formatPlaceDuration(place, dictionary)}
      </span>
    </button>
  );
}

function MapMetaNotices({
  copy,
  mapMeta,
  onLoadMore,
}: {
  copy: CityMapCopy;
  mapMeta: MapPlacesMeta | null;
  onLoadMore: () => void;
}) {
  if (!mapMeta) {
    return null;
  }

  const notices = [
    mapMeta.hidden_by_status_count > 0
      ? formatTemplate(copy.meta.hiddenByStatus, {
          count: mapMeta.hidden_by_status_count,
        })
      : null,
    mapMeta.unmappable_count > 0
      ? formatTemplate(copy.meta.missingCoordinates, {
          count: mapMeta.unmappable_count,
        })
      : null,
  ].filter(Boolean);

  if (notices.length === 0 && mapMeta.hidden_by_pagination_count === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 text-sm text-muted-foreground lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="space-y-1">
        {notices.map((notice) => (
          <p key={notice}>{notice}</p>
        ))}
        {mapMeta.hidden_by_pagination_count > 0 ? (
          <p>
            {formatTemplate(copy.meta.hiddenByPagination, {
              count: mapMeta.hidden_by_pagination_count,
            })}
          </p>
        ) : null}
      </div>
      {mapMeta.hidden_by_pagination_count > 0 ? (
        <button
          className={buttonVariants({ size: "sm", variant: "outline" })}
          onClick={onLoadMore}
          type="button"
        >
          {copy.actions.loadMore}
        </button>
      ) : null}
    </div>
  );
}

function FactRow({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
      <Icon className="size-4 shrink-0 text-[var(--quest-accent)]" aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
    </div>
  );
}

function MapLoading({ title }: { title: string }) {
  return (
    <div className="min-h-[32rem] bg-muted p-5 xl:min-h-[44rem]">
      <div className="h-full min-h-[28rem] animate-pulse rounded-lg bg-background/70" />
      <p className="mt-4 text-sm font-semibold text-muted-foreground">{title}</p>
    </div>
  );
}

function MapState({
  icon,
  text,
  title,
}: {
  icon?: "error";
  text: string;
  title: string;
}) {
  const Icon = icon === "error" ? AlertCircle : MapPin;

  return (
    <div className="grid min-h-[32rem] place-items-center bg-muted px-5 text-center xl:min-h-[44rem]">
      <div className="max-w-sm">
        <div className={cn("mx-auto grid size-12 place-items-center rounded-lg shadow-sm", questAccentClass("teal"), "bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]")}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function filterClass(active: boolean): string {
  return cn(
    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function statusFilterClass(active: boolean): string {
  return cn(
    "inline-flex min-h-9 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

function countLabel(visibleCount: number, totalCount: number): string {
  if (totalCount > 0 && visibleCount !== totalCount) {
    return `${visibleCount}/${totalCount}`;
  }

  return String(visibleCount);
}

function formatTemplate(template: string, values: Record<string, number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function getCategoryCount(
  mapMeta: MapPlacesMeta | null,
  countType: keyof MapPlacesMeta["category_counts"],
  categoryId: number,
): number | null {
  return mapMeta?.category_counts[countType][String(categoryId)] ?? null;
}

function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function isMappablePlace(place: Place): boolean {
  return (
    typeof place.coordinates?.lat === "number" &&
    Number.isFinite(place.coordinates.lat) &&
    place.coordinates.lat !== 0 &&
    typeof place.coordinates.lng === "number" &&
    Number.isFinite(place.coordinates.lng) &&
    place.coordinates.lng !== 0
  );
}
