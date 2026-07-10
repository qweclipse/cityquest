"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Clock,
  Footprints,
  Heart,
  MapPinned,
  Route,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { buttonVariants } from "@/components/ui/button";
import type { CityRoute } from "@/lib/api/types";
import {
  type CityQuestImageSelection,
  getRouteImageMeta,
} from "@/lib/images/cityquest-images";
import { getLocalizedRouteContent } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  formatRouteBudgetRange,
  orderedRoutePoints,
  routeDisplayTitle,
  routeTypeDisplayLabel,
  routeVibeDisplayLabel,
} from "@/lib/routes/route-format";
import {
  questAccentBadgeClassName,
  routeAccentClass,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface RouteCardProps {
  className?: string;
  fallbackIndex?: number;
  image?: CityQuestImageSelection;
  route: CityRoute;
}

export function RouteCard({
  className,
  fallbackIndex,
  image,
  route,
}: RouteCardProps) {
  const { dictionary, language } = useI18n();
  const points = orderedRoutePoints(route);
  const localizedRoute = getLocalizedRouteContent(route, language);
  const title = routeDisplayTitle(route, dictionary, language);
  const firstPoint = points[0]?.place;
  const imageSelection = image ?? getRouteImageMeta(route, { index: fallbackIndex });
  const completedCount = getRouteCompletedCount(route);
  const accentClass = routeAccentClass(route);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--quest-accent-border)] hover:shadow-[0_18px_46px_var(--quest-accent-shadow)]",
        accentClass,
        className,
      )}
      data-image-quality={imageSelection.quality}
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1 bg-[var(--quest-accent)]" />
      <div className="relative min-h-48 bg-muted">
        <CityQuestImage
          alt=""
          className="absolute inset-0"
          image={imageSelection}
          imageClassName="transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/12 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur", questAccentBadgeClassName)}>
            {routeTypeDisplayLabel(route.route_type, dictionary)}
          </span>
          <span className="rounded-lg bg-[color-mix(in_oklch,var(--quest-accent),var(--foreground)_12%)] px-2.5 py-1 text-xs font-semibold text-[var(--quest-accent-foreground)] shadow-sm backdrop-blur">
            {routeVibeDisplayLabel(route.vibe, dictionary)}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow">
            {title}
          </h2>
          {route.city?.name ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-card/92 px-2.5 py-1 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur">
              <MapPinned className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
              {route.city.name}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {localizedRoute.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {localizedRoute.description}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-[0.95fr_0.85fr_1.2fr] gap-2">
          <Metric
            accentClassName={accentClass}
            icon={Clock}
            label={`${route.duration_minutes ?? 0} ${dictionary.routes.results.minutes}`}
          />
          <Metric accentClassName={accentClass} icon={Footprints} label={`${route.distance_km ?? 0} km`} />
          <Metric
            accentClassName={accentClass}
            icon={Wallet}
            label={formatRouteBudgetRange(route)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
            <Route className="size-3.5" aria-hidden="true" />
            {points.length} {dictionary.collections.cards.stops}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
            <Heart className="size-3.5" aria-hidden="true" />
            {route.likes_count}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
            <Bookmark className="size-3.5" aria-hidden="true" />
            {route.saves_count}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 font-semibold">
            <Trophy className="size-3.5" aria-hidden="true" />
            {completedCount}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              <span className="truncate">
                {route.author?.name ?? dictionary.collections.cards.cityquestAuthor}
              </span>
            </div>
            {firstPoint ? (
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {dictionary.collections.cards.startsAt}: {firstPoint.name}
              </div>
            ) : null}
          </div>
          <Link
            className={buttonVariants({ className: "shrink-0" })}
            href={`/routes/${route.id}`}
          >
            {dictionary.collections.actions.open}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function getRouteCompletedCount(route: CityRoute): number {
  const routeWithCompletions = route as CityRoute & {
    completed_count?: number;
    completions_count?: number;
  };

  return routeWithCompletions.completions_count ?? routeWithCompletions.completed_count ?? 0;
}

function Metric({
  accentClassName,
  icon: Icon,
  label,
}: {
  accentClassName: string;
  icon: typeof Clock;
  label: string;
}) {
  return (
    <div className={cn("min-w-0 rounded-lg border px-2.5 py-2 text-xs font-semibold", accentClassName, "border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)]")}>
      <Icon className="mb-1 size-4 text-[var(--quest-accent)]" aria-hidden="true" />
      <div className="truncate">{label}</div>
    </div>
  );
}
