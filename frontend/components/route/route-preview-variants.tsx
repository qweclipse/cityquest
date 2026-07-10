"use client";

import {
  ArrowRight,
  Clock,
  Footprints,
  Info,
  Loader2,
  MapPin,
  Route,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { Button } from "@/components/ui/button";
import type { LanguageCode, RoutePreviewVariant } from "@/lib/api/types";
import { getRouteImageMeta } from "@/lib/images/cityquest-images";
import {
  getLocalizedPlaceName,
  getLocalizedPreviewContent,
  getLocalizedPreviewPlaceReason,
} from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  questAccentBadgeClassName,
  routeAccentClass,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface RoutePreviewVariantsProps {
  isPersisting?: boolean;
  onChoose: (variant: RoutePreviewVariant) => void;
  title?: string;
  variants: RoutePreviewVariant[];
}

const previewCopy = {
  en: {
    defaultTitle: "Choose a route variant",
    moreStops: (count: number) => `+${count} more stops in the full plan`,
    notSaved: "No route is saved until you open one.",
    open: "Open this route",
    preview: "Preview",
    stops: "stops",
    variants: {
      balanced: "Balanced",
      rich: "Rich",
      short: "Short",
    },
    why: "Why this variant",
  },
  ro: {
    defaultTitle: "Alege varianta traseului",
    moreStops: (count: number) => `+${count} opriri in planul complet`,
    notSaved: "Traseul nu se salveaza pana nu deschizi o varianta.",
    open: "Deschide traseul",
    preview: "Previzualizare",
    stops: "opriri",
    variants: {
      balanced: "Echilibrat",
      rich: "Complet",
      short: "Scurt",
    },
    why: "De ce aceasta varianta",
  },
  ru: {
    defaultTitle: "Выберите вариант маршрута",
    moreStops: (count: number) => `+${count} точек в полном плане`,
    notSaved: "Маршрут не сохранится, пока вы не откроете вариант.",
    open: "Открыть маршрут",
    preview: "Предпросмотр",
    stops: "точек",
    variants: {
      balanced: "Баланс",
      rich: "Насыщенный",
      short: "Короткий",
    },
    why: "Почему этот вариант",
  },
} satisfies Record<LanguageCode, unknown>;

export function RoutePreviewVariants({
  isPersisting = false,
  onChoose,
  title,
  variants,
}: RoutePreviewVariantsProps) {
  const { language } = useI18n();
  const copy = previewCopy[language];

  if (variants.length === 0) {
    return null;
  }

  return (
    <section className="mt-6" data-testid="route-preview-variants">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            {copy.preview}
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {title ?? copy.defaultTitle}
          </h2>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {copy.notSaved}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {variants.map((variant, index) => (
          <VariantCard
            isPersisting={isPersisting}
            key={variant.variant}
            onChoose={onChoose}
            variant={variant}
            variantIndex={index}
          />
        ))}
      </div>
    </section>
  );
}

function VariantCard({
  isPersisting,
  onChoose,
  variant,
  variantIndex,
}: {
  isPersisting: boolean;
  onChoose: (variant: RoutePreviewVariant) => void;
  variant: RoutePreviewVariant;
  variantIndex: number;
}) {
  const { dictionary } = useI18n();
  const { language } = useI18n();
  const copy = previewCopy[language];
  const localizedVariant = getLocalizedPreviewContent(variant, language);
  const accentClass = routeAccentClass(variant);
  const image = getRouteImageMeta(
    {
      id: variantIndex + 1,
      image_url: variant.image_url,
      points: variant.places.map((point) => ({
        estimated_duration_minutes: point.estimated_duration_minutes,
        id: point.place_id,
        note: point.reason,
        order_number: point.order_number,
        place: point.place,
      })),
      route_type: variant.route_type,
      slug: variant.variant,
      title: localizedVariant.title,
      vibe: variant.vibe,
    },
    { index: variantIndex },
  );

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_46px_var(--quest-accent-shadow)]",
        accentClass,
        "border-[var(--quest-accent-border)]",
      )}
    >
      <div className="relative min-h-44 bg-muted">
        <CityQuestImage
          alt=""
          className="absolute inset-0"
          image={image}
          imageClassName="transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/76 via-foreground/16 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur", questAccentBadgeClassName)}>
            {copy.variants[variant.variant]}
          </span>
          <span className="rounded-lg bg-card/88 px-2.5 py-1 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur">
            {variant.places.length} {copy.stops}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow">
            {localizedVariant.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/88">
            {localizedVariant.description}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric icon={Clock} label={`${variant.duration_minutes} ${dictionary.routes.results.minutes}`} />
          <Metric icon={Footprints} label={`${variant.distance_km} km`} />
          <Metric
            icon={Wallet}
            label={`${dictionary.routes.results.budget}: ${formatPreviewBudget(variant)}`}
          />
        </div>

        <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
            {copy.why}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {localizedVariant.explanation}
          </p>
          {localizedVariant.tradeoffs.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {localizedVariant.tradeoffs.map((tradeoff) => (
                <span
                  className="rounded-lg bg-background/76 px-2 py-1 text-[0.7rem] font-semibold text-muted-foreground"
                  key={tradeoff}
                >
                  {tradeoff}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2">
          {variant.places.slice(0, 4).map((point) => (
            <div
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2 rounded-lg border border-border bg-background/70 p-2"
              key={`${variant.variant}-${point.place_id}`}
            >
              <div className="grid size-7 place-items-center rounded-full bg-[var(--quest-accent)] text-xs font-bold text-[var(--quest-accent-foreground)]">
                {point.order_number}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {getLocalizedPlaceName(point.place, language)}
                </div>
                <div className="mt-1 flex items-start gap-1 text-xs leading-5 text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-[var(--quest-accent)]" aria-hidden="true" />
                  <span className="line-clamp-2">
                    {getLocalizedPreviewPlaceReason(point, language)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {variant.places.length > 4 ? (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {copy.moreStops(variant.places.length - 4)}
            </div>
          ) : null}
        </div>

        <Button
          className="mt-4 h-11 w-full"
          data-testid={`route-preview-open-${variant.variant}`}
          disabled={isPersisting}
          onClick={() => onChoose(variant)}
          type="button"
        >
          {isPersisting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Route className="size-4" aria-hidden="true" />
          )}
          {copy.open}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)] px-2.5 py-2 text-xs font-semibold">
      <Icon className="mb-1 size-4 text-[var(--quest-accent)]" aria-hidden="true" />
      <div className="truncate">{label}</div>
    </div>
  );
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
