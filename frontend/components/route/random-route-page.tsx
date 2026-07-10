"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Clock,
  Footprints,
  Loader2,
  MapPin,
  MapPinned,
  RefreshCcw,
  Route,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  WalletCards,
} from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useCategories,
  useCities,
  useCreateRouteFromPreview,
  usePreviewRoute,
} from "@/hooks/api";
import type {
  BudgetMode,
  Category,
  GenerateRoutePayload,
  LanguageCode,
  PlaceMode,
  RoutePreviewResponse,
  RoutePreviewVariant,
} from "@/lib/api/types";
import { randomRouteCopy } from "@/lib/i18n/feature-copy";
import { getRouteImageMeta } from "@/lib/images/cityquest-images";
import {
  getLocalizedPlaceName,
  getLocalizedPreviewContent,
} from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { categoryDisplayName } from "@/lib/places/place-format";
import {
  questAccentButtonClassName,
  questAccentClass,
  questAccentIconClassName,
  questAccentPanelClassName,
  routeAccentClass,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

type RandomRouteType = "cafe" | "culture" | "date" | "family" | "friends" | "walk";
type RandomVibe = "balanced" | "calm" | "culture" | "fun" | "nature" | "romantic";

interface RandomPresetSummary {
  budgetMode: BudgetMode;
  categoryNames: string[];
  categorySlugs: string[];
  durationMinutes: number;
  placeMode: PlaceMode;
  routeType: RandomRouteType;
  vibe: RandomVibe;
}

const routeTypes: RandomRouteType[] = [
  "walk",
  "culture",
  "cafe",
  "friends",
  "family",
  "date",
];

const vibes: RandomVibe[] = [
  "balanced",
  "calm",
  "culture",
  "nature",
  "fun",
  "romantic",
];

const durations = [120, 150, 180, 210, 240, 300] as const;
const budgets: BudgetMode[] = ["any", "any", "low", "medium", "free"];
const stepAccents = [
  questAccentClass("copper"),
  questAccentClass("teal"),
  questAccentClass("gold"),
];

const categorySlugsByRouteType: Record<RandomRouteType, string[]> = {
  cafe: ["cafes", "food", "hidden-places"],
  culture: ["culture", "museums", "history", "architecture"],
  date: ["romance", "cafes", "photo-spots", "parks"],
  family: ["family", "parks", "museums", "free-places"],
  friends: ["hidden-places", "cafes", "culture", "parks"],
  walk: ["parks", "architecture", "free-places", "history"],
};

export function RandomRoutePage() {
  const router = useRouter();
  const { dictionary, language } = useI18n();
  const copy = randomRouteCopy[language];
  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const previewRoute = usePreviewRoute();
  const createRouteFromPreview = useCreateRouteFromPreview();
  const city = citiesQuery.data?.[0] ?? null;
  const categories = categoriesQuery.data ?? [];
  const [lastPreset, setLastPreset] = useState<RandomPresetSummary | null>(null);
  const [isOpeningRoute, setIsOpeningRoute] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<GenerateRoutePayload | null>(null);
  const [previewData, setPreviewData] = useState<RoutePreviewResponse | null>(null);
  const isPreparing = citiesQuery.isLoading || categoriesQuery.isLoading;
  const isGenerating =
    previewRoute.isPending || createRouteFromPreview.isPending || isOpeningRoute;
  const canGenerate = Boolean(city) && !isPreparing && !isGenerating;
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = copy.states.loadingMessages;
  const routeError = previewRoute.error ?? createRouteFromPreview.error;
  const bestVariant = pickBestVariant(previewData);
  const configureHref = lastPreset ? randomPresetCreateHref(lastPreset) : "/routes/create";

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((currentIndex) => currentIndex + 1);
    }, 1100);

    return () => window.clearInterval(intervalId);
  }, [isGenerating]);

  const handleGenerate = () => {
    if (!city) {
      return;
    }

    const { payload, summary } = createRandomPayload(city.id, categories, dictionary);

    setLastPreset(summary);
    setPreviewPayload(payload);
    setPreviewData(null);
    setIsOpeningRoute(false);
    setLoadingMessageIndex(0);
    previewRoute.mutate(payload, {
      onError: () => {
        setIsOpeningRoute(false);
      },
      onSuccess: (response) => {
        setPreviewData(response);
      },
    });
  };

  const handleChooseVariant = (variant: RoutePreviewVariant) => {
    if (!previewPayload) {
      return;
    }

    setIsOpeningRoute(true);
    createRouteFromPreview.mutate(
      {
        ...previewPayload,
        preview: variant,
      },
      {
        onError: () => {
          setIsOpeningRoute(false);
        },
        onSuccess: (route) => {
          router.push(`/routes/${route.id}`);
        },
      },
    );
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {isGenerating ? (
        <RandomRouteLoadingOverlay
          activeIndex={loadingMessageIndex}
          messages={loadingMessages}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className={cn("rounded-lg border p-6 shadow-sm sm:p-8", questAccentClass("copper"), questAccentPanelClassName)}>
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {copy.hero.eyebrow}
          </div>
          <div className={cn("mt-8 grid size-14 place-items-center rounded-lg shadow-[0_16px_34px_var(--quest-accent-shadow)]", questAccentButtonClassName)}>
            <Shuffle className="size-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold sm:text-5xl">
            {copy.hero.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {copy.hero.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              className={cn(questAccentClass("rose"), questAccentButtonClassName)}
              data-testid="random-route-preview"
              disabled={!canGenerate}
              onClick={handleGenerate}
              size="lg"
              type="button"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Shuffle className="size-4" aria-hidden="true" />
              )}
              {isGenerating ? copy.actions.generating : copy.actions.lucky}
            </Button>
            <Link
              className={buttonVariants({ size: "lg", variant: "outline" })}
              href="/routes/create"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {copy.actions.createCustom}
            </Link>
          </div>

          {isPreparing ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
              {copy.states.loading}
            </p>
          ) : null}

          {citiesQuery.isError ? (
            <ErrorMessage title={copy.states.cityError} />
          ) : !city ? (
            <ErrorMessage title={copy.states.noCity} />
          ) : null}

          {routeError ? (
            <ErrorMessage
              text={routeError.message}
              title={copy.states.errorTitle}
            />
          ) : null}
        </section>

        <aside className={cn("rounded-lg border p-5 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
          <h2 className="text-lg font-semibold">{copy.preset.title}</h2>
          <div className="mt-4 grid gap-2">
            <PresetRow
              icon={MapPinned}
              label={copy.preset.routeType}
              value={
                lastPreset
                  ? dictionary.routes.create.routeType[lastPreset.routeType]
                  : dictionary.routes.create.routeType.walk
              }
            />
            <PresetRow
              icon={Sparkles}
              label={copy.preset.vibe}
              value={
                lastPreset
                  ? dictionary.routes.create.vibe[lastPreset.vibe]
                  : dictionary.routes.create.vibe.balanced
              }
            />
            <PresetRow
              icon={Clock}
              label={copy.preset.duration}
              value={`${lastPreset?.durationMinutes ?? 180} ${dictionary.routes.results.minutes}`}
            />
            <PresetRow
              icon={WalletCards}
              label={copy.preset.budget}
              value={
                lastPreset
                  ? dictionary.routes.create.budget[lastPreset.budgetMode]
                  : dictionary.routes.create.budget.any
              }
            />
            <PresetRow
              icon={BadgeCheck}
              label={copy.preset.placeMode}
              value={copy.preset.placeMode}
            />
          </div>

          <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] p-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {copy.preset.categories}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(lastPreset?.categoryNames.length
                ? lastPreset.categoryNames
                : [copy.preset.fallbackCategories]
              ).map((category) => (
                <span
                  className="rounded-lg bg-[var(--quest-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--quest-accent)]"
                  key={category}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {bestVariant ? (
            <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Sparkles className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
                {copy.preset.why}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {getLocalizedPreviewContent(bestVariant, language).explanation}
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="mt-5">
        <h2 className="text-lg font-semibold">{copy.steps.title}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {copy.steps.items.map((item, index) => (
            <article
              className={cn("rounded-lg border p-4 shadow-sm", stepAccents[index] ?? questAccentClass("copper"), questAccentPanelClassName)}
              key={item.title}
            >
              <div className={cn("grid size-9 place-items-center rounded-lg text-sm font-bold", questAccentIconClassName)}>
                {index + 1}
              </div>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {bestVariant ? (
        <RandomRouteResultCard
          configureHref={configureHref}
          isPersisting={createRouteFromPreview.isPending || isOpeningRoute}
          onOpen={handleChooseVariant}
          onRetry={handleGenerate}
          variant={bestVariant}
        />
      ) : previewData ? (
        <RandomRouteEmptyState />
      ) : null}
    </section>
  );
}

function RandomRouteResultCard({
  configureHref,
  isPersisting,
  onOpen,
  onRetry,
  variant,
}: {
  configureHref: string;
  isPersisting: boolean;
  onOpen: (variant: RoutePreviewVariant) => void;
  onRetry: () => void;
  variant: RoutePreviewVariant;
}) {
  const { dictionary, language } = useI18n();
  const copy = randomRouteCopy[language];
  const localizedVariant = getLocalizedPreviewContent(variant, language);
  const accentClass = routeAccentClass(variant);
  const image = getRouteImageMeta(
    {
      id: 1,
      image_url: variant.image_url,
      points: variant.places.map((point) => ({
        estimated_duration_minutes: point.estimated_duration_minutes,
        id: point.place_id,
        note: point.reason,
        order_number: point.order_number,
        place: point.place,
      })),
      route_type: variant.route_type,
      slug: `random-${variant.variant}`,
      title: localizedVariant.title,
      vibe: variant.vibe,
    },
    { stableKey: `random-${variant.variant}-${localizedVariant.title}` },
  );

  return (
    <section className="mt-6" data-testid="random-route-result">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {copy.result.eyebrow}
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {copy.result.title}
          </h2>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {copy.result.notSaved}
        </div>
      </div>

      <article
        className={cn(
          "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
          accentClass,
          "border-[var(--quest-accent-border)]",
        )}
      >
        <div className="grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="relative min-h-72 bg-muted">
            <CityQuestImage
              alt=""
              className="absolute inset-0"
              image={image}
              imageClassName="transition duration-300 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/12 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-flex rounded-lg bg-card/90 px-2.5 py-1 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur">
                {variant.places.length} {copy.result.places}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
              {localizedVariant.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {localizedVariant.description}
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              <RandomMetric
                icon={Clock}
                label={`${variant.duration_minutes} ${dictionary.routes.results.minutes}`}
              />
              <RandomMetric icon={Footprints} label={`${variant.distance_km} km`} />
              <RandomMetric
                icon={Wallet}
                label={`${dictionary.routes.results.budget}: ${formatPreviewBudget(variant)}`}
              />
              <RandomMetric
                icon={MapPin}
                label={`${variant.places.length} ${copy.result.places}`}
              />
            </div>

            <div className="mt-5 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
                {copy.preset.why}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {localizedVariant.explanation}
              </p>
              {variant.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {variant.tags.slice(0, 5).map((tag) => (
                    <span
                      className="rounded-lg bg-background/76 px-2 py-1 text-xs font-semibold text-muted-foreground"
                      key={tag}
                    >
                      {randomTagLabel(tag, language)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold">{copy.result.included}</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {variant.places.slice(0, 3).map((point) => (
                  <div
                    className="min-w-0 rounded-lg border border-border bg-background/70 p-3"
                    key={`${variant.variant}-${point.place_id}`}
                  >
                    <div className="text-xs font-semibold text-[var(--quest-accent)]">
                      {point.order_number}
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold">
                      {getLocalizedPlaceName(point.place, language)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                className="h-11 sm:flex-1"
                data-testid="random-route-open"
                disabled={isPersisting}
                onClick={() => onOpen(variant)}
                type="button"
              >
                {isPersisting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Route className="size-4" aria-hidden="true" />
                )}
                {copy.actions.openRoute}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                className="h-11 sm:flex-1"
                disabled={isPersisting}
                onClick={onRetry}
                type="button"
                variant="outline"
              >
                <RefreshCcw className="size-4" aria-hidden="true" />
                {copy.actions.tryAnother}
              </Button>
              <Link
                className={buttonVariants({
                  className: "h-11 sm:flex-1",
                  variant: "outline",
                })}
                href={configureHref}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {copy.actions.createCustom}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function RandomRouteEmptyState() {
  const { language } = useI18n();
  const copy = randomRouteCopy[language];

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-5 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
        <MapPinned className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-bold">{copy.states.emptyTitle}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {copy.states.emptyText}
      </p>
    </div>
  );
}

function RandomMetric({
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

function PresetRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 px-3 py-2">
      <Icon className="size-4 shrink-0 text-[var(--quest-accent)]" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function ErrorMessage({ text, title }: { text?: string; title: string }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle className="size-4" aria-hidden="true" />
        {title}
      </div>
      {text ? <p className="mt-1 leading-6">{text}</p> : null}
    </div>
  );
}

function RandomRouteLoadingOverlay({
  activeIndex,
  messages,
}: {
  activeIndex: number;
  messages: readonly string[];
}) {
  const activeStep = activeIndex % messages.length;
  const activeMessage = messages[activeStep];

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-background/82 px-4 backdrop-blur-md"
      role="status"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-24"
        style={{ backgroundImage: 'url("/images/routes/city-route-1.jpg")' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-background/72 via-background/78 to-background/88"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-border bg-card/96 shadow-2xl">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{ backgroundImage: 'url("/images/routes/walk-route-1.jpg")' }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/92 to-card"
        />
        <div className="relative p-6 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_32px_rgba(154,106,67,0.24)]">
            <Loader2 className="size-7 animate-spin" aria-hidden="true" />
          </div>
          <div className="mt-5 text-xl font-bold">{activeMessage}</div>
          <div aria-hidden="true" className="mx-auto mt-4 flex max-w-64 items-center gap-2">
            {messages.map((_, step) => (
              <span className="flex flex-1 items-center gap-2" key={step}>
                <span
                  className={
                    step <= activeStep
                      ? "size-2.5 rounded-full bg-primary"
                      : "size-2.5 rounded-full bg-muted"
                  }
                />
                {step < messages.length - 1 ? (
                  <span className="h-px flex-1 bg-border" />
                ) : null}
              </span>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            {messages.map((message, index) => {
              const isActive = index === activeStep;
              const isComplete = index < activeStep;

              return (
                <div
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/86 px-3 py-2 text-left text-sm font-semibold"
                  key={message}
                >
                  <span
                    className={
                      isActive || isComplete
                        ? "grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"
                        : "grid size-6 place-items-center rounded-full bg-muted text-muted-foreground"
                    }
                  >
                    {index + 1}
                  </span>
                  <span className={isActive ? "text-foreground" : "text-muted-foreground"}>
                    {message}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function createRandomPayload(
  cityId: number,
  categories: Category[],
  dictionary: ReturnType<typeof useI18n>["dictionary"],
): { payload: GenerateRoutePayload; summary: RandomPresetSummary } {
  const routeType = randomItem(routeTypes);
  const vibe = randomItem(vibes);
  const durationMinutes = randomItem(durations);
  const budgetMode = randomItem(budgets);
  const categoryIds = pickCategoryIds(routeType, categories);
  const selectedCategories = categories.filter((category) => categoryIds.includes(category.id));
  const categoryNames = selectedCategories.map((category) =>
    categoryDisplayName(category, dictionary),
  );
  const categorySlugs = selectedCategories.map((category) => category.slug);
  const placeMode: PlaceMode = "verified_only";

  return {
    payload: {
      budget_mode: budgetMode,
      category_ids: categoryIds,
      city_id: cityId,
      duration_minutes: durationMinutes,
      place_mode: placeMode,
      route_type: routeType,
      vibe,
    },
    summary: {
      budgetMode,
      categoryNames,
      categorySlugs,
      durationMinutes,
      placeMode,
      routeType,
      vibe,
    },
  };
}

function pickCategoryIds(routeType: RandomRouteType, categories: Category[]): number[] {
  const preferredSlugs = categorySlugsByRouteType[routeType];
  const preferredCategories = categories.filter((category) =>
    preferredSlugs.includes(category.slug),
  );
  const shuffled = shuffle(preferredCategories);
  const count = Math.min(shuffled.length, randomItem([1, 2]));

  return shuffled.slice(0, count).map((category) => category.id);
}

function randomItem<T>(items: readonly T[]): T {
  return items[randomIndex(items.length)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    const currentItem = nextItems[index];

    nextItems[index] = nextItems[swapIndex];
    nextItems[swapIndex] = currentItem;
  }

  return nextItems;
}

function randomIndex(length: number): number {
  if (length <= 0) {
    return 0;
  }

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);

    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function pickBestVariant(
  previewData: RoutePreviewResponse | null,
): RoutePreviewVariant | null {
  if (!previewData?.variants.length) {
    return null;
  }

  return (
    previewData.variants.find((variant) => variant.variant === "balanced") ??
    previewData.variants[0]
  );
}

function randomPresetCreateHref(preset: RandomPresetSummary): string {
  const params = new URLSearchParams();

  params.set("budget", preset.budgetMode);
  params.set("duration", String(preset.durationMinutes));
  params.set("mode", preset.placeMode);
  params.set("type", preset.routeType);
  params.set("vibe", preset.vibe);

  if (preset.categorySlugs.length > 0) {
    params.set("category", preset.categorySlugs.join(","));
  }

  return `/routes/create?${params.toString()}`;
}

function formatPreviewBudget(variant: RoutePreviewVariant): string {
  const min = variant.price_min ?? 0;
  const max = variant.price_max ?? 0;
  const currency = variant.currency_code ?? "";

  if (min === 0 && max === 0) {
    return `0 ${currency}`.trim();
  }

  if (min === max) {
    return `${Math.round(min)} ${currency}`.trim();
  }

  return `${Math.round(min)}-${Math.round(max)} ${currency}`.trim();
}

function randomTagLabel(tag: string, language: LanguageCode): string {
  const labels: Record<LanguageCode, Record<string, string>> = {
    en: {
      any: "any budget",
      balanced: "balanced",
      calm: "calm",
      culture: "culture",
      diverse: "diverse",
      free: "free",
      fun: "fun",
      low: "low budget",
      medium: "medium budget",
      nature: "nature",
      rich: "rich",
      romantic: "romantic",
      short: "short",
    },
    ro: {
      any: "orice buget",
      balanced: "echilibrat",
      calm: "linistit",
      culture: "cultura",
      diverse: "divers",
      free: "gratuit",
      fun: "distractiv",
      low: "buget redus",
      medium: "buget mediu",
      nature: "natura",
      rich: "complet",
      romantic: "romantic",
      short: "scurt",
    },
    ru: {
      any: "любой бюджет",
      balanced: "баланс",
      calm: "спокойно",
      culture: "культура",
      diverse: "разнообразно",
      free: "бесплатно",
      fun: "весело",
      low: "низкий бюджет",
      medium: "средний бюджет",
      nature: "природа",
      rich: "насыщенно",
      romantic: "романтично",
      short: "коротко",
    },
  };

  return labels[language][tag] ?? tag.replaceAll("_", " ");
}
