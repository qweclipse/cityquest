"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPinned,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import { PlaceFavoriteButton } from "@/components/place/place-favorite-button";
import { buttonVariants } from "@/components/ui/button";
import type { Place } from "@/lib/api/types";
import {
  type CityQuestImageSelection,
  getPlaceImageMeta,
} from "@/lib/images/cityquest-images";
import { getLocalizedPlaceContent } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  formatPlaceDuration,
  formatPlacePrice,
  placeSourceTypeShortLabel,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  categoryAccentClass,
  questAccentBadgeClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface PlaceCardProps {
  className?: string;
  fallbackIndex?: number;
  image?: CityQuestImageSelection;
  place: Place;
}

export function PlaceCard({
  className,
  fallbackIndex,
  image,
  place,
}: PlaceCardProps) {
  const { dictionary, language } = useI18n();
  const categoryName = categoryDisplayName(place.category, dictionary);
  const verificationLabel = placeVerificationLabel(
    place.verification_status,
    dictionary,
  );
  const imageSelection = image ?? getPlaceImageMeta(place, { index: fallbackIndex });
  const accentClass = categoryAccentClass(place.category);
  const localizedPlace = getLocalizedPlaceContent(place, language);

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
      <div className="relative min-h-44 bg-muted">
        <CityQuestImage
          alt=""
          className="absolute inset-0"
          image={imageSelection}
          imageClassName="transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur", questAccentBadgeClassName)}>
            <MapPinned className="size-3.5" aria-hidden="true" />
            {categoryName}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-[color-mix(in_oklch,var(--quest-teal),var(--card)_8%)] px-2.5 py-1 text-xs font-semibold text-[var(--quest-teal)] shadow-sm backdrop-blur dark:bg-[color-mix(in_oklch,var(--quest-teal),var(--card)_76%)]">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {verificationLabel}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="line-clamp-2 text-2xl font-bold leading-tight text-white drop-shadow">
            {localizedPlace.name}
          </h2>
          {place.city?.name ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-card/92 px-2.5 py-1 text-xs font-semibold text-card-foreground shadow-sm backdrop-blur">
              <MapPinned className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
              {place.city.name}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {localizedPlace.shortDescription ?? localizedPlace.description}
        </p>

        <div className="mt-4 grid grid-cols-[0.95fr_1fr_1fr] gap-2">
          <Metric accentClassName={accentClass} icon={Clock} label={formatPlaceDuration(place, dictionary)} />
          <Metric accentClassName={accentClass} icon={Wallet} label={formatPlacePrice(place, dictionary)} />
          <Metric
            accentClassName={accentClass}
            icon={BadgeCheck}
            label={placeSourceTypeShortLabel(place.source_type, dictionary)}
          />
        </div>

        <div className="mt-4 min-h-10 text-xs leading-5 text-muted-foreground">
          {place.address ? (
            <span className="line-clamp-2">
              {dictionary.places.cards.address}: {place.address}
            </span>
          ) : (
            <span>{dictionary.places.cards.noAddress}</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <PlaceFavoriteButton placeId={place.id} />
          <Link
            className={buttonVariants({ className: "min-w-0 flex-1" })}
            href={`/places/${place.id}`}
          >
            {dictionary.places.actions.open}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
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
    <div className={cn("min-h-16 min-w-0 rounded-lg border px-2.5 py-2 text-xs font-semibold", accentClassName, "border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)]")}>
      <Icon className="mb-1 size-4 text-[var(--quest-accent)]" aria-hidden="true" />
      <div className="line-clamp-2 text-[0.7rem] leading-tight">{label}</div>
    </div>
  );
}
