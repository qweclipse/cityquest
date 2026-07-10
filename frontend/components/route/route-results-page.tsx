"use client";

import Link from "next/link";
import { AlertCircle, Loader2, MapPin } from "lucide-react";

import { RouteSummaryCard } from "@/components/route/route-summary-card";
import { buttonVariants } from "@/components/ui/button";
import { useRoute } from "@/hooks/api";
import type { LanguageCode, RoutePoint } from "@/lib/api/types";
import {
  getLocalizedPlaceName,
  getLocalizedRoutePointNote,
} from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { orderedRoutePoints } from "@/lib/routes/route-format";
import {
  categoryAccentClass,
  questAccentClass,
  questAccentPanelClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface RouteResultsPageProps {
  routeId: number | null;
}

export function RouteResultsPage({ routeId }: RouteResultsPageProps) {
  const { dictionary, language } = useI18n();
  const routeQuery = useRoute(routeId);
  const route = routeQuery.data;

  if (!routeId) {
    return (
      <EmptyState
        text={dictionary.routes.results.emptyText}
        title={dictionary.routes.results.emptyTitle}
      />
    );
  }

  if (routeQuery.isLoading) {
    return (
      <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          {dictionary.routes.results.loading}
        </div>
      </div>
    );
  }

  if (routeQuery.isError || !route) {
    return (
      <EmptyState
        icon="error"
        text={routeQuery.error?.message ?? dictionary.routes.results.emptyText}
        title={dictionary.routes.results.errorTitle}
      />
    );
  }

  const points = orderedRoutePoints(route);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {dictionary.routes.results.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {dictionary.routes.results.subtitle}
          </p>
        </div>
        <Link className={buttonVariants({ variant: "outline" })} href="/routes/create">
          {dictionary.routes.results.createAgain}
        </Link>
      </div>

      <RouteSummaryCard route={route} />

      <section className={cn("mt-5 rounded-lg border p-5 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
        <h2 className="text-lg font-semibold">{dictionary.routes.results.pointsTitle}</h2>
        <div className="mt-4 grid gap-3">
          {points.map((point) => (
            <RoutePointResult
              key={point.id}
              language={language}
              minutesLabel={dictionary.routes.results.minutes}
              point={point}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function RoutePointResult({
  language,
  minutesLabel,
  point,
}: {
  language: LanguageCode;
  minutesLabel: string;
  point: RoutePoint;
}) {
  const note = getLocalizedRoutePointNote(point, language);
  const placeName = point.place
    ? getLocalizedPlaceName(point.place, language)
    : null;

  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border bg-background/70 p-3 sm:grid-cols-[3rem_minmax(0,1fr)_7rem]",
        point.place ? categoryAccentClass(point.place.category) : questAccentClass("copper"),
        "border-[var(--quest-accent-border)]",
      )}
    >
      <div className="grid size-10 place-items-center rounded-full bg-[var(--quest-accent)] text-sm font-bold text-[var(--quest-accent-foreground)]">
        {point.order_number}
      </div>
      <div className="min-w-0">
        <div className="font-semibold">{placeName}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          <span className="truncate">{point.place?.address}</span>
        </div>
        {note ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{note}</p>
        ) : null}
      </div>
      <div className="text-sm font-semibold text-muted-foreground sm:text-right">
        {point.estimated_duration_minutes ?? 0} {minutesLabel}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  text,
  title,
}: {
  icon?: "error";
  text: string;
  title: string;
}) {
  const { dictionary } = useI18n();
  const Icon = icon === "error" ? AlertCircle : MapPin;

  return (
    <section className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href="/routes/create">
          {dictionary.routes.results.createAgain}
        </Link>
      </div>
    </section>
  );
}
