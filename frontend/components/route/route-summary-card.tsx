"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Clock, Footprints, Heart, MapPin, Share2, Wallet } from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CityRoute } from "@/lib/api/types";
import { getRouteImageMeta } from "@/lib/images/cityquest-images";
import { getLocalizedRouteContent } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { formatRouteBudget, routeDisplayTitle } from "@/lib/routes/route-format";
import {
  questAccentBadgeClassName,
  questAccentPanelClassName,
  routeAccentClass,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface RouteSummaryCardProps {
  className?: string;
  route: CityRoute;
}

export function RouteSummaryCard({ className, route }: RouteSummaryCardProps) {
  const { dictionary, language } = useI18n();
  const pointCount = route.points?.length ?? 0;
  const localizedRoute = getLocalizedRouteContent(route, language);
  const title = routeDisplayTitle(route, dictionary, language);
  const image = getRouteImageMeta(route);
  const accentClass = routeAccentClass(route);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border text-card-foreground shadow-sm",
        accentClass,
        questAccentPanelClassName,
        className,
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="p-5 sm:p-6">
          <div className={cn("mb-4 inline-flex rounded-lg px-3 py-1 text-xs font-semibold", questAccentBadgeClassName)}>
            {dictionary.routes.results.generatedBadge}
          </div>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
          {localizedRoute.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {localizedRoute.description}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric
              accentClassName={accentClass}
              icon={Clock}
              label={`${route.duration_minutes ?? 0} ${dictionary.routes.results.minutes}`}
            />
            <Metric
              accentClassName={accentClass}
              icon={Footprints}
              label={`${route.distance_km ?? 0} km`}
            />
            <Metric
              accentClassName={accentClass}
              icon={Wallet}
              label={formatRouteBudget(route, dictionary.routes.results.budget)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link className={buttonVariants()} href={`/routes/${route.id}`}>
              {dictionary.routes.results.openDetails}
            </Link>
            <Button disabled type="button" variant="outline">
              <Heart className="size-4" aria-hidden="true" />
              {dictionary.routes.results.save}
            </Button>
            <Button
              onClick={() => shareRoute(route.id)}
              type="button"
              variant="outline"
            >
              <Share2 className="size-4" aria-hidden="true" />
              {dictionary.routes.results.share}
            </Button>
          </div>
        </div>

        <div className="relative min-h-56 bg-muted lg:min-h-full">
          <CityQuestImage
            alt=""
            className="absolute inset-0"
            image={image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-card/90 p-3 text-sm shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 font-semibold">
              <MapPin className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              {pointCount} {dictionary.routes.results.pointsTitle.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({
  accentClassName,
  icon: Icon,
  label,
}: {
  accentClassName: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className={cn("flex h-12 items-center gap-2 rounded-lg border bg-background/70 px-3 text-sm font-semibold", accentClassName, "border-[var(--quest-accent-border)]")}>
      <Icon className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function shareRoute(routeId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = `${window.location.origin}/routes/${routeId}`;

  void navigator.clipboard?.writeText(url);
}
