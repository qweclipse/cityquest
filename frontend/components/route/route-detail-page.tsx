"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  ExternalLink,
  Footprints,
  Heart,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Scissors,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { RouteMap } from "@/components/route/route-map";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useRoute,
  useCompleteRoute,
  useProfile,
  useSaveRoute,
  useSavedRoutes,
  useStartRoute,
  useUnsaveRoute,
} from "@/hooks/api";
import type { CityRoute, RouteActivity, RoutePoint } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type CityQuestImageSelection,
  getPlaceImageMeta,
  getRouteImageMeta,
} from "@/lib/images/cityquest-images";
import {
  getLocalizedPlaceContent,
  getLocalizedRouteContent,
  getLocalizedRoutePointNote,
} from "@/lib/i18n/content-localization";
import { routeDetailCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  formatPlaceDuration,
  formatPlacePrice,
  placeSourceTypeShortLabel,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  formatRouteBudget,
  orderedRoutePoints,
  placeMapUrl,
  routeDirectionsUrl,
  routeDisplayTitle,
} from "@/lib/routes/route-format";
import {
  categoryAccentClass,
  questAccentClass,
  questAccentPanelClassName,
  routeAccentClass,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface RouteDetailPageProps {
  routeId: number | null;
}

type RouteDetailProductCopy = (typeof routeDetailCopy)[keyof typeof routeDetailCopy];

const routeProgressCopy = {
  en: {
    completeRoute: "Mark complete",
    completedRoute: "Route completed",
    signInToTrack: "Sign in to track",
    startRoute: "Start route",
    tracking: "Updating",
  },
  ro: {
    completeRoute: "Marcheaza finalizat",
    completedRoute: "Traseu finalizat",
    signInToTrack: "Intra ca sa urmaresti",
    startRoute: "Porneste traseul",
    tracking: "Actualizam",
  },
  ru: {
    completeRoute: "Завершить маршрут",
    completedRoute: "Маршрут завершён",
    signInToTrack: "Войдите, чтобы отслеживать",
    startRoute: "Начать маршрут",
    tracking: "Обновляем",
  },
} as const;

export function RouteDetailPage({ routeId }: RouteDetailPageProps) {
  const { dictionary } = useI18n();
  const routeQuery = useRoute(routeId);
  const route = routeQuery.data;

  if (!routeId) {
    return (
      <RouteDetailState
        text={dictionary.routes.results.emptyText}
        title={dictionary.routes.results.emptyTitle}
      />
    );
  }

  if (routeQuery.isLoading) {
    return (
      <div className="grid h-[calc(100vh-10rem)] min-h-[32rem] place-items-center px-4 lg:h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          {dictionary.routes.results.loading}
        </div>
      </div>
    );
  }

  if (routeQuery.isError || !route) {
    return (
      <RouteDetailState
        icon="error"
        text={routeQuery.error?.message ?? dictionary.routes.results.emptyText}
        title={dictionary.routes.results.errorTitle}
      />
    );
  }

  return <RouteDetailExperience route={route} />;
}

function RouteDetailExperience({ route }: { route: CityRoute }) {
  const { dictionary, language } = useI18n();
  const pointNodesRef = useRef(new Map<number, HTMLButtonElement>());
  const shareTimeoutRef = useRef<number | null>(null);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const points = useMemo(() => orderedRoutePoints(route), [route]);
  const pointImageById = useMemo(() => {
    const pointsWithPlaces = points.filter(
      (point): point is RoutePoint & { place: NonNullable<RoutePoint["place"]> } =>
        Boolean(point.place),
    );
    const pointImages = avoidDuplicatePointImages(
      pointsWithPlaces.map((point, index) =>
        getPlaceImageMeta(point.place, { index }),
      ),
    );

    return new Map(
      pointsWithPlaces.map((point, index) => [point.id, pointImages[index]]),
    );
  }, [points]);
  const activePointId = selectedPointId ?? points[0]?.id ?? null;
  const directionsUrl = useMemo(() => routeDirectionsUrl(route), [route]);
  const localizedRoute = getLocalizedRouteContent(route, language);
  const title = routeDisplayTitle(route, dictionary, language);
  const routeImage = getRouteImageMeta(route);
  const copy = routeDetailCopy[language];
  const accentClass = routeAccentClass(route);
  const routeInsightItems = useMemo(
    () =>
      copy.insight.items.map((item) =>
        item.replace("{count}", String(points.length || 0)),
      ),
    [copy.insight.items, points.length],
  );

  useEffect(
    () => () => {
      if (shareTimeoutRef.current !== null) {
        window.clearTimeout(shareTimeoutRef.current);
      }
    },
    [],
  );

  const setPointNode = useCallback((pointId: number, node: HTMLButtonElement | null) => {
    if (node) {
      pointNodesRef.current.set(pointId, node);
      return;
    }

    pointNodesRef.current.delete(pointId);
  }, []);

  const handlePointSelect = useCallback((pointId: number) => {
    setSelectedPointId(pointId);
    window.setTimeout(() => {
      pointNodesRef.current.get(pointId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 0);
  }, []);

  const handleShare = useCallback(() => {
    shareRoute(route.id);
    setShareCopied(true);

    if (shareTimeoutRef.current !== null) {
      window.clearTimeout(shareTimeoutRef.current);
    }

    shareTimeoutRef.current = window.setTimeout(() => {
      setShareCopied(false);
      shareTimeoutRef.current = null;
    }, 1800);
  }, [route.id]);

  return (
    <section className="relative h-[calc(100vh-10rem)] min-h-[42rem] overflow-hidden bg-muted lg:h-[calc(100vh-4rem)] lg:min-h-[36rem]">
      <RouteMap
        activePointId={activePointId}
        className="absolute inset-0"
        focusedPointId={selectedPointId}
        onPointSelect={handlePointSelect}
        route={route}
      />

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex items-center justify-between gap-3 lg:left-4 lg:right-[27rem] lg:top-4">
        <Link
          className={cn(
            buttonVariants({ variant: "outline" }),
            "pointer-events-auto bg-card/92 shadow-sm backdrop-blur",
          )}
          href={`/routes/results?route=${route.id}`}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dictionary.routes.detail.back}
        </Link>

        {directionsUrl ? (
          <a
            className={cn(
              buttonVariants(),
              "pointer-events-auto bg-primary/95 shadow-sm backdrop-blur",
            )}
            href={directionsUrl}
            rel="noreferrer"
            target="_blank"
          >
            <Navigation className="size-4" aria-hidden="true" />
            {dictionary.routes.detail.openDirections}
          </a>
        ) : null}
      </div>

      <aside
        className={cn(
          "absolute bottom-3 left-3 right-3 z-20 flex flex-col overflow-hidden rounded-lg border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur lg:inset-y-4 lg:left-auto lg:right-4 lg:w-[25.5rem]",
          accentClass,
          "border-[var(--quest-accent-border)]",
          sheetExpanded ? "max-h-[calc(100%-1.5rem)]" : "max-h-[68%]",
          "lg:max-h-none",
        )}
      >
        <div className="relative h-24 shrink-0 overflow-hidden bg-muted sm:h-32">
          <CityQuestImage
            alt=""
            className="absolute inset-0"
            image={routeImage}
            showBadge={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>

        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {dictionary.routes.detail.routeOverview}
              </div>
              <h1 className="mt-1 text-xl font-bold leading-tight">{title}</h1>
            </div>
            <Button
              aria-label={
                sheetExpanded
                  ? dictionary.routes.detail.collapseSheet
                  : dictionary.routes.detail.expandSheet
              }
              className="lg:hidden"
              onClick={() => setSheetExpanded((value) => !value)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              {sheetExpanded ? (
                <ChevronDown className="size-4" aria-hidden="true" />
              ) : (
                <ChevronUp className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {localizedRoute.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground lg:line-clamp-none">
              {localizedRoute.description}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <RouteMetric
              icon={Clock}
              label={`${route.duration_minutes ?? 0} ${dictionary.routes.results.minutes}`}
            />
            <RouteMetric icon={Footprints} label={`${route.distance_km ?? 0} km`} />
            <RouteMetric
              icon={Wallet}
              label={formatRouteBudget(route, dictionary.routes.results.budget)}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {directionsUrl ? (
              <a
                className={buttonVariants({ className: "h-10 w-full" })}
                href={directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Navigation className="size-4" aria-hidden="true" />
                {dictionary.routes.detail.openDirections}
              </a>
            ) : null}
            <SaveRouteButton routeId={route.id} />
            <RouteProgressButton routeId={route.id} />
            <Button
              className="h-10 sm:col-span-2"
              onClick={handleShare}
              type="button"
              variant="outline"
            >
              <Share2 className="size-4" aria-hidden="true" />
              {shareCopied ? copy.actions.copied : dictionary.routes.results.share}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <RouteInsight items={routeInsightItems} title={copy.insight.title} />
          <QuickModifyPanel copy={copy} route={route} />

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">{dictionary.routes.detail.routeSteps}</h2>
            <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              {points.length} {dictionary.routes.results.pointsTitle.toLowerCase()}
            </span>
          </div>

          <div className="grid gap-2">
            {points.map((point) => (
              <RoutePointItem
                active={point.id === activePointId}
                image={pointImageById.get(point.id) ?? null}
                key={point.id}
                onSelect={handlePointSelect}
                point={point}
                setPointNode={setPointNode}
              />
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function avoidDuplicatePointImages(
  images: CityQuestImageSelection[],
): CityQuestImageSelection[] {
  let previousSrc: string | null = null;

  return images.map((image) => {
    if (image.src !== previousSrc || image.quality === "real_photo") {
      previousSrc = image.src;

      return image;
    }

    const nextSrc = image.alternates.find((candidate) => candidate !== previousSrc);
    const nextImage = nextSrc
      ? {
          ...image,
          fallbackSrc: nextSrc,
          src: nextSrc,
        }
      : image;

    previousSrc = nextImage.src;

    return nextImage;
  });
}

function RouteProgressButton({ routeId }: { routeId: number }) {
  const { language } = useI18n();
  const auth = useAuth();
  const copy = routeProgressCopy[language];
  const profileQuery = useProfile();
  const startRoute = useStartRoute();
  const completeRoute = useCompleteRoute();
  const [localActivity, setLocalActivity] = useState<RouteActivity | null>(null);
  const activity =
    localActivity ??
    profileQuery.data?.recent_route_activity?.find((entry) => entry.route?.id === routeId) ??
    null;
  const isCompleted = activity?.status === "completed";
  const isStarted = activity?.status === "started";
  const isPending =
    startRoute.isPending ||
    completeRoute.isPending ||
    (auth.isAuthenticated && profileQuery.isLoading);

  if (!auth.isHydrated) {
    return (
      <Button
        className="h-10 w-full"
        data-status="loading"
        data-testid="route-progress-action"
        disabled
        type="button"
        variant="outline"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {copy.tracking}
      </Button>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Link
        className={buttonVariants({
          className: "h-10 w-full",
          variant: "outline",
        })}
        data-status="guest"
        data-testid="route-progress-action"
        href="/login"
      >
        <Footprints className="size-4" aria-hidden="true" />
        {copy.signInToTrack}
      </Link>
    );
  }

  if (isCompleted) {
    return (
      <Button
        className="h-10 w-full"
        data-status="completed"
        data-testid="route-progress-action"
        disabled
        type="button"
        variant="outline"
      >
        <CheckCircle2 className="size-4" aria-hidden="true" />
        {copy.completedRoute}
      </Button>
    );
  }

  return (
    <Button
      className="h-10 w-full"
      data-status={isStarted ? "started" : "idle"}
      data-testid="route-progress-action"
      disabled={isPending}
      onClick={() => {
        if (isStarted) {
          completeRoute.mutate(routeId, { onSuccess: setLocalActivity });
          return;
        }

        startRoute.mutate(routeId, { onSuccess: setLocalActivity });
      }}
      type="button"
      variant={isStarted ? "default" : "outline"}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : isStarted ? (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      ) : (
        <Footprints className="size-4" aria-hidden="true" />
      )}
      {isStarted ? copy.completeRoute : copy.startRoute}
    </Button>
  );
}

function SaveRouteButton({ routeId }: { routeId: number }) {
  const { language } = useI18n();
  const auth = useAuth();
  const copy = routeDetailCopy[language];
  const savedRoutesQuery = useSavedRoutes();
  const saveRoute = useSaveRoute();
  const unsaveRoute = useUnsaveRoute();
  const isSaved =
    savedRoutesQuery.data?.some((savedRoute) => savedRoute.id === routeId) ?? false;
  const isPending =
    saveRoute.isPending ||
    unsaveRoute.isPending ||
    (auth.isAuthenticated && savedRoutesQuery.isLoading);

  if (!auth.isHydrated) {
    return (
      <Button className="h-10 w-full" disabled type="button" variant="outline">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {copy.actions.saveRoute}
      </Button>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Link
        className={buttonVariants({
          className: "h-10 w-full",
          variant: "outline",
        })}
        href="/login"
      >
        <Bookmark className="size-4" aria-hidden="true" />
        {copy.actions.signInToSave}
      </Link>
    );
  }

  return (
    <Button
      className="h-10 w-full"
      disabled={isPending}
      onClick={() => {
        if (isSaved) {
          unsaveRoute.mutate(routeId);
          return;
        }

        saveRoute.mutate(routeId);
      }}
      type="button"
      variant={isSaved ? "outline" : "default"}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : isSaved ? (
        <BadgeCheck className="size-4" aria-hidden="true" />
      ) : (
        <Bookmark className="size-4" aria-hidden="true" />
      )}
      {isSaved ? copy.actions.savedRoute : copy.actions.saveRoute}
    </Button>
  );
}

function RouteInsight({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  return (
    <section className={cn("mb-4 rounded-lg border p-3", questAccentClass("teal"), questAccentPanelClassName)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        {title}
      </div>
      <ul className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-[var(--quest-accent)]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickModifyPanel({
  copy,
  route,
}: {
  copy: RouteDetailProductCopy;
  route: CityRoute;
}) {
  const shorterDuration = clampRouteDuration(
    Math.round(((route.duration_minutes ?? 180) * 0.65) / 30) * 30,
  );
  const baseRouteType = route.route_type ?? "walk";
  const baseVibe = route.vibe ?? "balanced";
  const options = [
    {
      href: routeCreateHref({
        duration: String(shorterDuration),
        type: baseRouteType,
        vibe: baseVibe,
      }),
      icon: Scissors,
      label: copy.modify.options.shorter,
    },
    {
      href: routeCreateHref({
        category: "cafes,food",
        type: "cafe",
        vibe: "calm",
      }),
      icon: Coffee,
      label: copy.modify.options.cafe,
    },
    {
      href: routeCreateHref({
        category: "parks,free-places",
        type: "walk",
        vibe: "nature",
      }),
      icon: Leaf,
      label: copy.modify.options.nature,
    },
    {
      href: routeCreateHref({
        category: "romance,cafes",
        type: "date",
        vibe: "romantic",
      }),
      icon: Heart,
      label: copy.modify.options.romantic,
    },
    {
      href: routeCreateHref({
        budget: "free",
        category: "free-places,parks",
        type: "walk",
        vibe: "balanced",
      }),
      icon: Wallet,
      label: copy.modify.options.free,
    },
  ];

  return (
    <section className={cn("mb-4 rounded-lg border p-3", questAccentClass("plum"), questAccentPanelClassName)}>
      <h2 className="text-sm font-semibold">{copy.modify.title}</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <Link
              className={buttonVariants({
                className:
                  "h-auto min-h-9 justify-start whitespace-normal px-2 py-2 text-left text-xs",
                size: "sm",
                variant: "outline",
              })}
              href={option.href}
              key={option.label}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span className="leading-4">{option.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RoutePointItem({
  active,
  image,
  onSelect,
  point,
  setPointNode,
}: {
  active: boolean;
  image: CityQuestImageSelection | null;
  onSelect: (pointId: number) => void;
  point: RoutePoint;
  setPointNode: (pointId: number, node: HTMLButtonElement | null) => void;
}) {
  const { dictionary, language } = useI18n();
  const copy = routeDetailCopy[language];
  const place = point.place;
  const mapsUrl = placeMapUrl(place);
  const category = place ? categoryDisplayName(place.category, dictionary) : null;
  const verification = place
    ? placeVerificationLabel(place.verification_status, dictionary)
    : null;
  const source = place ? placeSourceTypeShortLabel(place.source_type, dictionary) : null;
  const duration = place
    ? point.estimated_duration_minutes
      ? `${point.estimated_duration_minutes} ${dictionary.routes.results.minutes}`
      : formatPlaceDuration(place, dictionary)
    : `${point.estimated_duration_minutes ?? 0} ${dictionary.routes.results.minutes}`;
  const price = place ? formatPlacePrice(place, dictionary) : null;
  const localizedPlace = place ? getLocalizedPlaceContent(place, language) : null;
  const note =
    getLocalizedRoutePointNote(point, language) ??
    localizedPlace?.shortDescription ??
    null;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background transition",
        place ? categoryAccentClass(place.category) : questAccentClass("copper"),
        active ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] shadow-sm" : "border-border",
      )}
    >
      <button
        className="grid w-full grid-cols-[2.25rem_4rem_minmax(0,1fr)] gap-3 p-3 text-left"
        onClick={() => onSelect(point.id)}
        ref={(node) => setPointNode(point.id, node)}
        type="button"
      >
        <span
          className={cn(
            "grid size-9 place-items-center rounded-full text-sm font-bold",
            active
              ? "bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]"
              : "bg-muted text-muted-foreground",
          )}
        >
          {point.order_number}
        </span>
        <span className="relative h-16 overflow-hidden rounded-lg bg-muted">
          {image ? (
            <CityQuestImage
              alt=""
              className="absolute inset-0"
              image={image}
              showBadge={false}
            />
          ) : (
            <span className="grid h-full place-items-center text-primary">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold leading-5">
            {localizedPlace?.name ?? dictionary.places.categories.place}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {category ? (
              <span className="rounded-lg bg-muted px-2 py-1 text-[0.68rem] font-semibold text-muted-foreground">
                {category}
              </span>
            ) : null}
            {verification ? (
              <span className="rounded-lg bg-[var(--quest-accent-soft)] px-2 py-1 text-[0.68rem] font-semibold text-[var(--quest-accent)]">
                {verification}
              </span>
            ) : null}
          </span>
          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{place?.address ?? dictionary.common.defaultCity}</span>
          </span>
          {note ? (
            <span className="mt-2 block text-sm leading-5 text-muted-foreground">
              {note}
            </span>
          ) : null}
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
          {copy.stages.visit}: {duration}
        </span>
        {price ? (
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
            {copy.stages.price}: {price}
          </span>
        ) : null}
        {source ? (
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
            {copy.stages.source}: {source}
          </span>
        ) : null}
        {mapsUrl ? (
          <a
            className="ml-auto inline-flex items-center gap-1 font-semibold text-[var(--quest-accent)] hover:underline"
            href={mapsUrl}
            rel="noreferrer"
            target="_blank"
          >
            {dictionary.routes.detail.openPointMap}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function RouteMetric({
  icon: Icon,
  label,
}: {
  icon: typeof Clock;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] px-2.5 py-2 text-xs font-semibold">
      <Icon className="mb-1 size-4 text-[var(--quest-accent)]" aria-hidden="true" />
      <div className="truncate">{label}</div>
    </div>
  );
}

function routeCreateHref(params: Record<string, string>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return `/routes/create?${searchParams.toString()}`;
}

function clampRouteDuration(duration: number): number {
  return Math.min(480, Math.max(60, duration));
}

function RouteDetailState({
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
    <section className="grid h-[calc(100vh-10rem)] min-h-[32rem] place-items-center px-4 lg:h-[calc(100vh-4rem)]">
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

function shareRoute(routeId: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = `${window.location.origin}/routes/${routeId}`;

  void navigator.clipboard?.writeText(url);
}
