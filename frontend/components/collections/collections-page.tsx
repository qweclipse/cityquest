"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, MapPinned, Plus, Route } from "lucide-react";

import { RouteCard } from "@/components/route/route-card";
import { buttonVariants } from "@/components/ui/button";
import { useCollections, useCities } from "@/hooks/api";
import {
  avoidAdjacentDuplicateImages,
  getRouteImageMeta,
} from "@/lib/images/cityquest-images";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  collectionRouteTypeFilters,
  collectionTabs,
  type CollectionRouteTypeFilter,
  type CollectionTab,
} from "@/lib/routes/collection-filters";
import {
  questAccentClass,
  questAccentPanelClassName,
  routeTypeAccentName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface CollectionsPageProps {
  routeType: CollectionRouteTypeFilter;
  tab: CollectionTab;
}

export function CollectionsPage({ routeType, tab }: CollectionsPageProps) {
  const { dictionary } = useI18n();
  const citiesQuery = useCities();
  const city = citiesQuery.data?.[0] ?? null;
  const collectionsQuery = useCollections({
    city_id: city?.id,
    per_page: 12,
    tab,
  });
  const routes = useMemo(
    () => collectionsQuery.data?.data ?? [],
    [collectionsQuery.data?.data],
  );
  const filteredRoutes = useMemo(
    () =>
      routeType === "all"
        ? routes
        : routes.filter((route) => route.route_type === routeType),
    [routeType, routes],
  );
  const routeImages = useMemo(
    () =>
      avoidAdjacentDuplicateImages(filteredRoutes, (route, index) =>
        getRouteImageMeta(route, { index }),
      ),
    [filteredRoutes],
  );
  const totalRoutes = collectionsQuery.data?.meta?.total ?? routes.length;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {dictionary.collections.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {dictionary.collections.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {dictionary.collections.subtitle}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:min-w-[25rem]">
          <div className={cn("rounded-lg border p-3 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPinned className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              {city?.name ?? dictionary.common.defaultCity}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {totalRoutes} {dictionary.collections.meta.routes}
            </div>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/routes/create">
            <Plus className="size-4" aria-hidden="true" />
            {dictionary.collections.actions.create}
          </Link>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div
          aria-label={dictionary.collections.tabs.ariaLabel}
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
        >
          {collectionTabs.map((tabOption) => (
            <Link
              aria-current={tabOption === tab ? "page" : undefined}
              className={cn(
                "inline-flex h-9 shrink-0 items-center rounded-lg border px-3 text-sm font-semibold transition",
                questAccentClass("teal"),
                tabOption === tab
                  ? "border-[var(--quest-teal)] bg-[var(--quest-teal)] text-[var(--quest-accent-foreground)]"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              href={collectionsHref({ routeType, tab: tabOption })}
              key={tabOption}
              role="tab"
            >
              {dictionary.collections.tabs[tabOption]}
            </Link>
          ))}
        </div>

        <div
          aria-label={dictionary.collections.filters.ariaLabel}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {collectionRouteTypeFilters.map((filter) => {
            const accentClass = questAccentClass(routeTypeAccentName(filter));

            return (
              <Link
                aria-current={filter === routeType ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center rounded-lg border px-2.5 text-xs font-semibold transition",
                  accentClass,
                  filter === routeType
                    ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]"
                    : "border-border bg-card text-muted-foreground hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)] hover:text-foreground",
                )}
                href={collectionsHref({ routeType: filter, tab })}
                key={filter}
              >
                {routeTypeFilterLabel(filter, dictionary)}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {collectionsQuery.isLoading || !city ? (
          <CollectionsLoading />
        ) : collectionsQuery.isError ? (
          <CollectionsState
            icon="error"
            text={collectionsQuery.error?.message ?? dictionary.collections.states.errorText}
            title={dictionary.collections.states.errorTitle}
          />
        ) : filteredRoutes.length === 0 ? (
          <CollectionsState
            text={dictionary.collections.states.emptyText}
            title={dictionary.collections.states.emptyTitle}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoutes.map((route, index) => (
              <RouteCard
                fallbackIndex={index}
                image={routeImages[index]}
                key={route.id}
                route={route}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          key={index}
        >
          <div className="h-48 animate-pulse bg-muted" />
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

function CollectionsState({
  icon,
  text,
  title,
}: {
  icon?: "error";
  text: string;
  title: string;
}) {
  const { dictionary } = useI18n();
  const Icon = icon === "error" ? AlertCircle : Route;

  return (
    <div className="grid min-h-[22rem] place-items-center rounded-lg border border-border bg-card px-6 text-center shadow-sm">
      <div className="max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href="/routes/create">
          {dictionary.collections.actions.create}
        </Link>
      </div>
    </div>
  );
}

function collectionsHref({
  routeType,
  tab,
}: {
  routeType: CollectionRouteTypeFilter;
  tab: CollectionTab;
}): string {
  const params = new URLSearchParams();

  if (tab !== "popular") {
    params.set("tab", tab);
  }

  if (routeType !== "all") {
    params.set("type", routeType);
  }

  const query = params.toString();

  return query ? `/collections?${query}` : "/collections";
}

function routeTypeFilterLabel(
  filter: CollectionRouteTypeFilter,
  dictionary: ReturnType<typeof useI18n>["dictionary"],
): string {
  switch (filter) {
    case "all":
      return dictionary.collections.filters.all;
    case "budget":
      return dictionary.routes.labels.routeTypes.budget;
    case "cafe_walk":
      return dictionary.routes.labels.routeTypes.cafeWalk;
    case "culture":
      return dictionary.routes.labels.routeTypes.culture;
    case "date":
      return dictionary.routes.labels.routeTypes.date;
    case "family":
      return dictionary.routes.labels.routeTypes.family;
    case "photo":
      return dictionary.routes.labels.routeTypes.photo;
    case "walk":
      return dictionary.routes.labels.routeTypes.walk;
  }
}
