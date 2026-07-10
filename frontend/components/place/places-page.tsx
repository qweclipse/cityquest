"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, MapPinned, Plus, Search, ShieldCheck } from "lucide-react";

import { PlaceCard } from "@/components/place/place-card";
import { buttonVariants } from "@/components/ui/button";
import { useCategories, useCities, usePlaces } from "@/hooks/api";
import {
  avoidAdjacentDuplicateImages,
  getPlaceImageMeta,
} from "@/lib/images/cityquest-images";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  placeVerificationFilters,
  placeVerificationParam,
  type PlaceVerificationFilter,
} from "@/lib/places/place-filters";
import {
  categoryDisplayName,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  categoryAccentClass,
  questAccentClass,
  questAccentPanelClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface PlacesPageProps {
  categoryId: number | null;
  search: string;
  status: PlaceVerificationFilter;
}

export function PlacesPage({ categoryId, search, status }: PlacesPageProps) {
  const { dictionary } = useI18n();
  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const city = citiesQuery.data?.[0] ?? null;
  const categories = categoriesQuery.data ?? [];
  const activeCategory = categories.find((category) => category.id === categoryId) ?? null;
  const placesQuery = usePlaces({
    category_id: categoryId ?? undefined,
    city_id: city?.id,
    per_page: 24,
    search: search || undefined,
    verification_status: placeVerificationParam(status),
  });
  const places = useMemo(() => placesQuery.data?.data ?? [], [placesQuery.data?.data]);
  const placeImages = useMemo(
    () =>
      avoidAdjacentDuplicateImages(places, (place, index) =>
        getPlaceImageMeta(place, { index }),
      ),
    [places],
  );
  const totalPlaces = placesQuery.data?.meta?.total ?? places.length;
  const hasActiveFilters = Boolean(categoryId || search || status !== "all");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {dictionary.places.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {dictionary.places.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {dictionary.places.subtitle}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[25rem]">
          <div className={cn("rounded-lg border p-3 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPinned className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              {city?.name ?? dictionary.common.defaultCity}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {totalPlaces} {dictionary.places.meta.places}
              {activeCategory ? (
                <>
                  {" "}
                  · {categoryDisplayName(activeCategory, dictionary)}
                </>
              ) : null}
            </div>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/places/new">
            <Plus className="size-4" aria-hidden="true" />
            {dictionary.places.actions.add}
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <form
          action="/places"
          className="grid gap-2 rounded-lg border border-border bg-card p-2 shadow-sm sm:grid-cols-[1fr_auto_auto]"
          method="GET"
        >
          {categoryId ? (
            <input name="category" type="hidden" value={String(categoryId)} />
          ) : null}
          {status !== "all" ? <input name="status" type="hidden" value={status} /> : null}
          <label className="relative min-w-0">
            <span className="sr-only">{dictionary.places.filters.searchLabel}</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              aria-label={dictionary.places.filters.searchLabel}
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/25"
              defaultValue={search}
              name="q"
              placeholder={dictionary.places.filters.searchPlaceholder}
              type="search"
            />
          </label>
          <button className={buttonVariants({ size: "lg" })} type="submit">
            {dictionary.places.actions.search}
          </button>
          {hasActiveFilters ? (
            <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/places">
              {dictionary.places.actions.clearFilters}
            </Link>
          ) : null}
        </form>

        <div
          aria-label={dictionary.places.filters.categoryAriaLabel}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          <Link
            aria-current={!categoryId ? "page" : undefined}
            className={cn(
              filterClass(!categoryId),
              questAccentClass("teal"),
              !categoryId &&
                "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]",
            )}
            href={placesHref({ categoryId: null, search, status })}
          >
            {dictionary.places.categories.all}
          </Link>
          {categories.map((category) => {
            const active = category.id === categoryId;

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  filterClass(active),
                  categoryAccentClass(category),
                  active
                    ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]"
                    : "hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]",
                )}
                href={placesHref({ categoryId: category.id, search, status })}
                key={category.id}
              >
                {categoryDisplayName(category, dictionary)}
                {typeof category.places_count === "number" ? (
                  <span className="text-muted-foreground">{category.places_count}</span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div
          aria-label={dictionary.places.filters.statusAriaLabel}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {placeVerificationFilters.map((filter) => (
            <Link
              aria-current={filter === status ? "page" : undefined}
              className={cn(
                filterClass(filter === status, "text-xs"),
                questAccentClass("teal"),
                filter === status &&
                  "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]",
              )}
              href={placesHref({ categoryId, search, status: filter })}
              key={filter}
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {verificationFilterLabel(filter, dictionary)}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {placesQuery.isLoading || !city || categoriesQuery.isLoading ? (
          <PlacesLoading />
        ) : placesQuery.isError ? (
          <PlacesState
            icon="error"
            text={placesQuery.error?.message ?? dictionary.places.states.errorText}
            title={dictionary.places.states.errorTitle}
          />
        ) : places.length === 0 ? (
          <PlacesState
            text={dictionary.places.states.emptyText}
            title={dictionary.places.states.emptyTitle}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place, index) => (
              <PlaceCard
                fallbackIndex={index}
                image={placeImages[index]}
                key={place.id}
                place={place}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PlacesLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          key={index}
        >
          <div className="h-44 animate-pulse bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 animate-pulse rounded-lg bg-muted" />
              <div className="h-14 animate-pulse rounded-lg bg-muted" />
              <div className="h-14 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlacesState({
  icon,
  text,
  title,
}: {
  icon?: "error";
  text: string;
  title: string;
}) {
  const { dictionary } = useI18n();
  const Icon = icon === "error" ? AlertCircle : MapPinned;

  return (
    <div className="grid min-h-[22rem] place-items-center rounded-lg border border-border bg-card px-6 text-center shadow-sm">
      <div className="max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href="/places">
          {dictionary.places.actions.showAll}
        </Link>
      </div>
    </div>
  );
}

function placesHref({
  categoryId,
  search,
  status,
}: {
  categoryId: number | null;
  search: string;
  status: PlaceVerificationFilter;
}): string {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set("category", String(categoryId));
  }

  if (search) {
    params.set("q", search);
  }

  if (status !== "all") {
    params.set("status", status);
  }

  const query = params.toString();

  return query ? `/places?${query}` : "/places";
}

function filterClass(active: boolean, extraClassName?: string): string {
  return cn(
    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold transition",
    active
      ? "border-primary/40 bg-muted text-foreground"
      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
    extraClassName,
  );
}

function verificationFilterLabel(
  filter: PlaceVerificationFilter,
  dictionary: Dictionary,
): string {
  if (filter === "all") {
    return dictionary.places.filters.statusAll;
  }

  return placeVerificationLabel(filter, dictionary);
}
