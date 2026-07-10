"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BadgeCheck,
  Coffee,
  Heart,
  Leaf,
  ListChecks,
  Loader2,
  MapPinned,
  Music2,
  Palette,
  Route,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type UseFormSetValue } from "react-hook-form";
import { useRouter } from "next/navigation";

import { RoutePreviewVariants } from "@/components/route/route-preview-variants";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useCities,
  useCreateRouteFromPreview,
  usePreviewRoute,
} from "@/hooks/api";
import type {
  BudgetMode,
  GenerateRoutePayload,
  LanguageCode,
  PlaceMode,
  RoutePreviewResponse,
  RoutePreviewVariant,
} from "@/lib/api/types";
import {
  generateRouteSchema,
  type GenerateRouteFormValues,
} from "@/lib/validation/cityquest-schemas";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { categoryDisplayName } from "@/lib/places/place-format";
import {
  categoryAccentClass,
  questAccentClass,
  questAccentPanelClassName,
  routeTypeAccentName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

const routeTypes = [
  { icon: MapPinned, value: "walk" },
  { icon: Heart, value: "date" },
  { icon: UsersRound, value: "friends" },
  { icon: Leaf, value: "family" },
  { icon: Palette, value: "culture" },
  { icon: Coffee, value: "cafe" },
] as const;

type RouteTypeValue = (typeof routeTypes)[number]["value"];

const vibes = [
  "balanced",
  "calm",
  "romantic",
  "fun",
  "culture",
  "nature",
] as const;

type VibeValue = (typeof vibes)[number];

const budgets: BudgetMode[] = ["any", "free", "low", "medium"];
const placeModes: PlaceMode[] = ["verified_only", "include_community"];

const createFlowCopy = {
  en: {
    actions: {
      regenerate: "Regenerate options",
    },
    live: {
      changed: "Preferences changed. Generate again to refresh the options below.",
      composition: "Likely composition",
      current: "Current preferences",
      emptyInterests: "mixed city places",
      eyebrow: "Live preview",
      likelyIncludes: "likely includes",
      noSave: "Options are not saved until you open one.",
      places: "places",
      title: "Route shape",
    },
    compositionByType: {
      cafe: "cafe + food + easy walk",
      culture: "museum + culture + architecture",
      date: "quiet cafe + park + photo spot",
      family: "park + simple culture + free stop",
      friends: "hidden place + cafe + city walk",
      walk: "park + architecture + local stop",
    },
    previewTitle: "Choose your route option",
  },
  ro: {
    actions: {
      regenerate: "Regeneraza optiunile",
    },
    live: {
      changed: "Preferintele s-au schimbat. Genereaza din nou ca sa actualizezi optiunile.",
      composition: "Compozitie probabila",
      current: "Preferinte curente",
      emptyInterests: "locuri urbane variate",
      eyebrow: "Previzualizare live",
      likelyIncludes: "probabil include",
      noSave: "Optiunile nu se salveaza pana nu deschizi una.",
      places: "locuri",
      title: "Forma traseului",
    },
    compositionByType: {
      cafe: "cafenea + mancare + plimbare usoara",
      culture: "muzeu + cultura + arhitectura",
      date: "cafenea linistita + parc + loc foto",
      family: "parc + cultura usoara + oprire gratuita",
      friends: "loc ascuns + cafenea + plimbare urbana",
      walk: "parc + arhitectura + loc local",
    },
    previewTitle: "Alege optiunea traseului",
  },
  ru: {
    actions: {
      regenerate: "Обновить варианты",
    },
    live: {
      changed: "Предпочтения изменились. Сгенерируй снова, чтобы обновить варианты ниже.",
      composition: "Вероятный состав",
      current: "Текущие настройки",
      emptyInterests: "разные городские места",
      eyebrow: "Живой предпросмотр",
      likelyIncludes: "скорее всего внутри",
      noSave: "Варианты не сохраняются, пока ты не откроешь один из них.",
      places: "мест",
      title: "Форма маршрута",
    },
    compositionByType: {
      cafe: "кафе + еда + лёгкая прогулка",
      culture: "музей + культура + архитектура",
      date: "тихое кафе + парк + фото-точка",
      family: "парк + простая культура + бесплатная остановка",
      friends: "скрытое место + кафе + прогулка по городу",
      walk: "парк + архитектура + локальное место",
    },
    previewTitle: "Выберите вариант маршрута",
  },
} satisfies Record<LanguageCode, unknown>;

const defaultValues: GenerateRouteFormValues = {
  budget_mode: "any",
  category_ids: [],
  city_id: 0,
  duration_minutes: 180,
  place_mode: "verified_only",
  route_type: "walk",
  vibe: "balanced",
};

export interface RouteCreateInitialPreset {
  budgetMode?: BudgetMode;
  categorySlugs?: string[];
  durationMinutes?: number;
  placeMode?: PlaceMode;
  routeType?: string;
  vibe?: string;
}

export function RouteCreatePage({
  initialPreset = {},
}: {
  initialPreset?: RouteCreateInitialPreset;
}) {
  const { dictionary, language } = useI18n();
  const copy = createFlowCopy[language];
  const router = useRouter();
  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const previewRoute = usePreviewRoute();
  const createRouteFromPreview = useCreateRouteFromPreview();
  const presetAppliedRef = useRef(false);
  const [previewPayload, setPreviewPayload] = useState<GenerateRoutePayload | null>(null);
  const [previewData, setPreviewData] = useState<RoutePreviewResponse | null>(null);
  const form = useForm<GenerateRouteFormValues>({
    defaultValues,
    resolver: zodResolver(generateRouteSchema),
  });
  const selectedCategories = useWatch({ control: form.control, name: "category_ids" }) ?? [];
  const selectedCityId = useWatch({ control: form.control, name: "city_id" }) ?? 0;
  const duration = useWatch({ control: form.control, name: "duration_minutes" }) ?? 180;
  const selectedRouteType =
    (useWatch({ control: form.control, name: "route_type" }) ?? "walk") as RouteTypeValue;
  const selectedVibe =
    (useWatch({ control: form.control, name: "vibe" }) ?? "balanced") as VibeValue;
  const selectedBudget =
    (useWatch({ control: form.control, name: "budget_mode" }) ?? "any") as BudgetMode;
  const selectedPlaceMode =
    ((useWatch({ control: form.control, name: "place_mode" }) ??
      "verified_only") as PlaceMode);
  const selectedCategoryOptions = (categoriesQuery.data ?? []).filter((category) =>
    selectedCategories.includes(category.id),
  );
  const selectedCategoryNames = selectedCategoryOptions.map((category) =>
    categoryDisplayName(category, dictionary),
  );
  const currentPayload = normalizeRoutePayload({
    budget_mode: selectedBudget,
    category_ids: selectedCategories,
    city_id: selectedCityId,
    duration_minutes: duration,
    place_mode: selectedPlaceMode,
    route_type: selectedRouteType,
    vibe: selectedVibe,
  });
  const previewIsStale = previewPayload
    ? !routePayloadsMatch(currentPayload, previewPayload)
    : false;
  const placeRange = estimatePlaceRange(duration);
  const likelyComposition = selectedCategoryNames.length
    ? selectedCategoryNames.slice(0, 3).join(" + ")
    : copy.compositionByType[selectedRouteType];
  const liveSummary = `${dictionary.routes.create.vibe[selectedVibe]} ${
    dictionary.routes.create.routeType[selectedRouteType]
  } · ${placeRange} ${copy.live.places} · ${copy.live.likelyIncludes} ${likelyComposition}`;

  useEffect(() => {
    const firstCity = citiesQuery.data?.[0];

    if (firstCity && !form.getValues("city_id")) {
      form.setValue("city_id", firstCity.id, { shouldValidate: true });
    }
  }, [citiesQuery.data, form]);

  useEffect(() => {
    if (presetAppliedRef.current) {
      return;
    }

    const categorySlugs = initialPreset.categorySlugs ?? [];
    const categoriesReady = categorySlugs.length === 0 || categoriesQuery.data !== undefined;

    if (!categoriesReady) {
      return;
    }

    if (initialPreset.durationMinutes) {
      form.setValue("duration_minutes", initialPreset.durationMinutes, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (initialPreset.routeType) {
      form.setValue("route_type", initialPreset.routeType, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (initialPreset.vibe) {
      form.setValue("vibe", initialPreset.vibe, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (initialPreset.budgetMode) {
      form.setValue("budget_mode", initialPreset.budgetMode, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (initialPreset.placeMode) {
      form.setValue("place_mode", initialPreset.placeMode, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (categorySlugs.length > 0) {
      const categoryIds =
        categoriesQuery.data
          ?.filter((category) => categorySlugs.includes(category.slug))
          .map((category) => category.id) ?? [];

      if (categoryIds.length > 0) {
        form.setValue("category_ids", categoryIds, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }

    presetAppliedRef.current = true;
  }, [categoriesQuery.data, form, initialPreset]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = normalizeRoutePayload(values);

    setPreviewPayload(payload);
    setPreviewData(null);
    previewRoute.mutate(payload, {
      onSuccess: (response) => {
        setPreviewData(response);
      },
    });
  });

  const handleChooseVariant = (variant: RoutePreviewVariant) => {
    if (!previewPayload) {
      return;
    }

    createRouteFromPreview.mutate(
      {
        ...previewPayload,
        preview: variant,
      },
      {
        onSuccess: (route) => {
          router.push(`/routes/${route.id}`);
        },
      },
    );
  };

  const routeError = previewRoute.error ?? createRouteFromPreview.error;
  const isWorking = previewRoute.isPending || createRouteFromPreview.isPending;
  const submitLabel = previewRoute.isPending
    ? dictionary.routes.create.actions.generating
    : previewData
      ? copy.actions.regenerate
      : dictionary.routes.create.actions.generate;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {dictionary.routes.create.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {dictionary.routes.create.subtitle}
        </p>
      </div>

      <form className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]" onSubmit={onSubmit}>
        <div className="space-y-5">
          <section className={cn("rounded-lg border p-5 shadow-sm", questAccentClass("sage"), questAccentPanelClassName)}>
            <SectionTitle>{dictionary.routes.create.sections.basics}</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                {dictionary.routes.create.fields.city}
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                  {...form.register("city_id", { valueAsNumber: true })}
                >
                  {citiesQuery.data?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                {dictionary.routes.create.fields.duration}: {duration}{" "}
                {dictionary.routes.results.minutes}
                <input
                  className="accent-primary"
                  max={480}
                  min={60}
                  step={30}
                  type="range"
                  {...form.register("duration_minutes", { valueAsNumber: true })}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  {dictionary.routes.create.durationHint}
                </span>
              </label>
            </div>
          </section>

          <section className={cn("rounded-lg border p-5 shadow-sm", questAccentClass("teal"), questAccentPanelClassName)}>
            <SectionTitle>{dictionary.routes.create.sections.interests}</SectionTitle>
            <div className="mt-4">
              <FieldLabel>{dictionary.routes.create.fields.categories}</FieldLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {categoriesQuery.data?.map((category) => {
                  const selected = selectedCategories.includes(category.id);

                  return (
                    <button
                      className={cn(
                        "h-9 rounded-lg border px-3 text-sm font-medium transition",
                        categoryAccentClass(category),
                        selected
                          ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]"
                          : "border-border bg-background text-foreground hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]",
                      )}
                      key={category.id}
                      onClick={() => toggleCategory(category.id, selectedCategories, form.setValue)}
                      type="button"
                    >
                      {categoryDisplayName(category, dictionary)}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className={cn("rounded-lg border p-5 shadow-sm", questAccentClass("plum"), questAccentPanelClassName)}>
            <SectionTitle>{dictionary.routes.create.sections.settings}</SectionTitle>

            <div className="mt-4 grid gap-5 xl:grid-cols-2">
              <div>
                <FieldLabel>{dictionary.routes.create.fields.routeType}</FieldLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {routeTypes.map((option) => {
                    const Icon = option.icon;

                    return (
                      <OptionButton
                        active={selectedRouteType === option.value}
                        accentClassName={questAccentClass(routeTypeAccentName(option.value))}
                        key={option.value}
                        onClick={() => form.setValue("route_type", option.value)}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {dictionary.routes.create.routeType[option.value]}
                      </OptionButton>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>{dictionary.routes.create.fields.vibe}</FieldLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {vibes.map((vibe) => (
                    <OptionButton
                      active={selectedVibe === vibe}
                      accentClassName={questAccentClass("plum")}
                      key={vibe}
                      onClick={() => form.setValue("vibe", vibe)}
                    >
                      <Music2 className="size-4" aria-hidden="true" />
                      {dictionary.routes.create.vibe[vibe]}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>{dictionary.routes.create.fields.budget}</FieldLabel>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {budgets.map((budget) => (
                    <OptionButton
                      active={selectedBudget === budget}
                      accentClassName={questAccentClass("sage")}
                      key={budget}
                      onClick={() => form.setValue("budget_mode", budget)}
                    >
                      {dictionary.routes.create.budget[budget]}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel>{dictionary.routes.create.fields.placeMode}</FieldLabel>
                <div className="mt-2 grid gap-2">
                  {placeModes.map((mode) => (
                    <OptionButton
                      active={selectedPlaceMode === mode}
                      accentClassName={questAccentClass("teal")}
                      key={mode}
                      onClick={() => form.setValue("place_mode", mode)}
                    >
                      <BadgeCheck className="size-4" aria-hidden="true" />
                      {mode === "verified_only"
                        ? dictionary.routes.create.placeMode.verifiedOnly
                        : dictionary.routes.create.placeMode.includeCommunity}
                    </OptionButton>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <section className={cn("overflow-hidden rounded-lg border shadow-sm", questAccentClass("gold"), questAccentPanelClassName)}>
            <div className="p-5">
              <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
                {copy.live.eyebrow}
              </div>
              <h2 className="mt-2 text-xl font-bold">{copy.live.title}</h2>
              <p className="mt-3 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] p-3 text-sm font-semibold leading-6">
                {liveSummary}
              </p>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
                  {copy.live.current}
                </div>
                <div className="mt-3 grid gap-2">
                  <PreviewRow
                    icon={Route}
                    label={dictionary.routes.create.fields.routeType}
                    value={dictionary.routes.create.routeType[selectedRouteType]}
                  />
                  <PreviewRow
                    icon={Music2}
                    label={dictionary.routes.create.fields.vibe}
                    value={dictionary.routes.create.vibe[selectedVibe]}
                  />
                  <PreviewRow
                    icon={MapPinned}
                    label={dictionary.routes.create.fields.duration}
                    value={`${duration} ${dictionary.routes.results.minutes}`}
                  />
                  <PreviewRow
                    icon={WalletCards}
                    label={dictionary.routes.create.fields.budget}
                    value={dictionary.routes.create.budget[selectedBudget]}
                  />
                  <PreviewRow
                    icon={BadgeCheck}
                    label={dictionary.routes.create.fields.placeMode}
                    value={
                      selectedPlaceMode === "verified_only"
                        ? dictionary.routes.create.placeMode.verifiedOnly
                        : dictionary.routes.create.placeMode.includeCommunity
                    }
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {copy.live.composition}
                </div>
                <div className="mt-2 text-sm font-semibold">{likelyComposition}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(selectedCategoryNames.length
                    ? selectedCategoryNames
                    : [copy.live.emptyInterests]
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

              <p className="mt-4 text-xs font-medium leading-5 text-muted-foreground">
                {copy.live.noSave}
              </p>

              {previewIsStale ? (
                <div className="mt-3 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] p-3 text-sm font-semibold">
                  {copy.live.changed}
                </div>
              ) : null}
            </div>

            <div className="border-t border-[var(--quest-accent-border)] bg-[color-mix(in_oklch,var(--quest-accent-surface),var(--card)_55%)] p-3">
              {routeError ? (
                <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {routeError.message}
                </div>
              ) : null}
              <Button
                className="h-11 w-full"
                data-testid="route-preview-submit"
                disabled={isWorking}
                type="submit"
              >
                {previewRoute.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {submitLabel}
                {!previewRoute.isPending ? (
                  <ArrowRight className="size-4" aria-hidden="true" />
                ) : null}
              </Button>
            </div>
          </section>
        </aside>
      </form>

      <RoutePreviewVariants
        isPersisting={createRouteFromPreview.isPending}
        onChoose={handleChooseVariant}
        title={copy.previewTitle}
        variants={previewData?.variants ?? []}
      />
    </section>
  );
}

function PreviewRow({
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

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function FieldLabel({ children }: { children: string }) {
  return <div className="text-sm font-medium">{children}</div>;
}

function OptionButton({
  accentClassName,
  active,
  children,
  onClick,
}: {
  accentClassName?: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
        accentClassName,
        active
          ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]"
          : "border-border bg-background text-foreground hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function toggleCategory(
  categoryId: number,
  selectedCategories: number[],
  setValue: UseFormSetValue<GenerateRouteFormValues>,
) {
  const nextCategories = selectedCategories.includes(categoryId)
    ? selectedCategories.filter((id) => id !== categoryId)
    : [...selectedCategories, categoryId];

  setValue("category_ids", nextCategories, { shouldDirty: true, shouldValidate: true });
}

function normalizeRoutePayload(
  values: GenerateRoutePayload | GenerateRouteFormValues,
): GenerateRoutePayload {
  return {
    ...values,
    category_ids: values.category_ids?.filter(Boolean) ?? [],
  };
}

function routePayloadsMatch(
  currentPayload: GenerateRoutePayload,
  previewPayload: GenerateRoutePayload,
): boolean {
  return (
    currentPayload.budget_mode === previewPayload.budget_mode &&
    currentPayload.city_id === previewPayload.city_id &&
    currentPayload.duration_minutes === previewPayload.duration_minutes &&
    currentPayload.place_mode === previewPayload.place_mode &&
    currentPayload.route_type === previewPayload.route_type &&
    currentPayload.vibe === previewPayload.vibe &&
    numberArraysMatch(currentPayload.category_ids ?? [], previewPayload.category_ids ?? [])
  );
}

function numberArraysMatch(leftValues: number[], rightValues: number[]): boolean {
  if (leftValues.length !== rightValues.length) {
    return false;
  }

  const leftSorted = [...leftValues].sort((left, right) => left - right);
  const rightSorted = [...rightValues].sort((left, right) => left - right);

  return leftSorted.every((value, index) => value === rightSorted[index]);
}

function estimatePlaceRange(durationMinutes: number): string {
  if (durationMinutes <= 120) {
    return "2-3";
  }

  if (durationMinutes <= 240) {
    return "3-5";
  }

  return "5-7";
}
