"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MapPinned,
  PencilLine,
  Route,
  Send,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

import { CityQuestImage } from "@/components/common/cityquest-image";
import {
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/common/form-controls";
import { PlaceFavoriteButton } from "@/components/place/place-favorite-button";
import { PlaceMap } from "@/components/place/place-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { usePlace, useSuggestPlaceCorrection } from "@/hooks/api";
import type {
  LanguageCode,
  Place,
  PlaceCorrectionPayload,
  PlaceCorrectionReason,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import {
  getImageQuality,
  getPlaceImageMeta,
} from "@/lib/images/cityquest-images";
import { getLocalizedPlaceContent } from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  formatPlaceCoordinates,
  formatPlaceDuration,
  formatPlacePrice,
  placeMapUrl,
  placeSourceTypeLabel,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  categoryAccentClass,
  questAccentBadgeClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

interface PlaceDetailPageProps {
  placeId: number | null;
}

export function PlaceDetailPage({ placeId }: PlaceDetailPageProps) {
  const { dictionary } = useI18n();
  const placeQuery = usePlace(placeId);

  if (placeId === null) {
    return (
      <PlaceDetailState
        text={dictionary.places.detail.invalidText}
        title={dictionary.places.detail.invalidTitle}
      />
    );
  }

  if (placeQuery.isLoading) {
    return <PlaceDetailLoading />;
  }

  if (placeQuery.isError || !placeQuery.data) {
    return (
      <PlaceDetailState
        icon="error"
        text={placeQuery.error?.message ?? dictionary.places.states.errorText}
        title={dictionary.places.detail.errorTitle}
      />
    );
  }

  return <PlaceDetailContent place={placeQuery.data} />;
}

function PlaceDetailContent({ place }: { place: Place }) {
  const { dictionary, language } = useI18n();
  const categoryName = categoryDisplayName(place.category, dictionary);
  const verificationLabel = placeVerificationLabel(
    place.verification_status,
    dictionary,
  );
  const sourceLabel = placeSourceTypeLabel(place.source_type, dictionary);
  const mapsUrl = placeMapUrl(place);
  const heroImage = getPlaceImageMeta(place);
  const accentClass = categoryAccentClass(place.category);
  const localizedPlace = getLocalizedPlaceContent(place, language);
  const galleryPhotos =
    place.photos?.filter((photo) => getImageQuality(photo.image_url) === "real_photo") ??
    [];
  const sourceLinks = [
    {
      href: place.links.official,
      label: dictionary.places.detail.officialLink,
    },
    {
      href: place.links.external_source,
      label: dictionary.places.detail.sourceLink,
    },
    {
      href: place.links.google_maps,
      label: dictionary.places.detail.googleMaps,
    },
    {
      href: place.links.yandex_maps,
      label: dictionary.places.detail.yandexMaps,
    },
  ].filter((link): link is { href: string; label: string } => Boolean(link.href));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link className={buttonVariants({ variant: "outline" })} href="/places">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dictionary.places.detail.back}
        </Link>
        <div className="flex items-center gap-2">
          <PlaceFavoriteButton placeId={place.id} />
          <Link className={buttonVariants()} href="/routes/create">
            <Route className="size-4" aria-hidden="true" />
            {dictionary.places.actions.createRoute}
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
          accentClass,
        )}
        data-image-quality={heroImage.quality}
      >
        <div className="relative min-h-[19rem] bg-muted sm:min-h-[24rem]">
          <CityQuestImage
            alt=""
            className="absolute inset-0"
            image={heroImage}
            imageClassName="scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/78 via-foreground/20 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur", questAccentBadgeClassName)}>
              <MapPinned className="size-3.5" aria-hidden="true" />
              {categoryName}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/92 px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm backdrop-blur">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {verificationLabel}
            </span>
          </div>
          <div className="absolute bottom-5 left-4 right-4 max-w-3xl sm:left-6 sm:right-6">
            <h1 className="text-3xl font-bold leading-tight text-white drop-shadow sm:text-5xl">
              {localizedPlace.name}
            </h1>
            {localizedPlace.shortDescription ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/88 sm:text-base">
                {localizedPlace.shortDescription}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              {dictionary.places.detail.about}
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {localizedPlace.description}
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
              {dictionary.places.detail.details}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow
                icon={MapPinned}
                label={dictionary.places.detail.category}
                value={categoryName}
              />
              <DetailRow
                icon={ShieldCheck}
                label={dictionary.places.detail.verification}
                value={verificationLabel}
              />
              <DetailRow
                icon={Clock}
                label={dictionary.places.detail.visitDuration}
                value={formatPlaceDuration(place, dictionary)}
              />
              <DetailRow
                icon={Wallet}
                label={dictionary.places.detail.priceRange}
                value={formatPlacePrice(place, dictionary)}
              />
              <DetailRow
                icon={BadgeCheck}
                label={dictionary.places.detail.sourceType}
                value={sourceLabel}
              />
              <DetailRow
                icon={MapPin}
                label={dictionary.places.detail.coordinates}
                value={formatPlaceCoordinates(place)}
              />
              {place.created_by?.name ? (
                <DetailRow
                  icon={UserRound}
                  label={dictionary.places.detail.addedBy}
                  value={place.created_by.name}
                />
              ) : null}
            </div>
          </section>

          {galleryPhotos.length > 0 ? (
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
                {dictionary.places.detail.gallery}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryPhotos.slice(0, 4).map((photo) => (
                  <div
                    className="relative min-h-44 overflow-hidden rounded-lg bg-muted"
                    key={photo.id}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo.image_url})` }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {dictionary.places.detail.mapTitle}
              </div>
              {place.address ? (
                <div className="mt-1 text-sm font-semibold">{place.address}</div>
              ) : null}
            </div>
            <PlaceMap className="min-h-[22rem]" place={place} />
            {mapsUrl ? (
              <div className="border-t border-border p-4">
                <a
                  className={buttonVariants({ className: "w-full", variant: "outline" })}
                  href={mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  {dictionary.places.detail.openMap}
                </a>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {dictionary.places.detail.sourceLinks}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {dictionary.places.detail.sourceLinksText}
            </p>
            <div className="mt-4 grid gap-2">
              {sourceLinks.length > 0 ? (
                sourceLinks.map((link) => (
                  <a
                    className={buttonVariants({
                      className: "justify-between",
                      variant: "outline",
                    })}
                    href={link.href}
                    key={`${link.label}-${link.href}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ))
              ) : (
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {dictionary.places.detail.noSourceLinks}
                </div>
              )}
            </div>
          </section>

          <PlaceCorrectionPanel place={place} />
        </aside>
      </div>
    </section>
  );
}

const correctionReasonValues: PlaceCorrectionReason[] = [
  "name_address",
  "price",
  "source_link",
  "image_link",
  "status_issue",
  "place_closed",
];

const placeCorrectionCopy = {
  en: {
    actions: {
      hide: "Hide form",
      login: "Sign in to suggest a correction",
      open: "Suggest a correction",
      submit: "Send",
    },
    error: "Could not send the correction.",
    fields: {
      address: "Address",
      comment: "Comment",
      googleMaps: "Google Maps",
      image: "Image",
      name: "Name",
      officialWebsite: "Official website",
      priceMax: "Price to",
      priceMin: "Price from",
      reason: "Correction type",
      statusIssue: "What is wrong with the status",
    },
    reasons: {
      image_link: "Image link",
      name_address: "Name or address",
      place_closed: "Place is closed",
      price: "Price",
      source_link: "Source link",
      status_issue: "Status issue",
    },
    submitted: "Thank you, the suggestion was sent for review.",
    text: "If the data is outdated, send a correction to moderators.",
    title: "Suggest a correction",
  },
  ro: {
    actions: {
      hide: "Ascunde formularul",
      login: "Autentifica-te pentru a sugera o corectie",
      open: "Sugereaza o corectie",
      submit: "Trimite",
    },
    error: "Corectia nu a putut fi trimisa.",
    fields: {
      address: "Adresa",
      comment: "Comentariu",
      googleMaps: "Google Maps",
      image: "Imagine",
      name: "Nume",
      officialWebsite: "Site oficial",
      priceMax: "Pret pana la",
      priceMin: "Pret de la",
      reason: "Tipul corectiei",
      statusIssue: "Ce nu este corect la status",
    },
    reasons: {
      image_link: "Link imagine",
      name_address: "Nume sau adresa",
      place_closed: "Locul este inchis",
      price: "Pret",
      source_link: "Link sursa",
      status_issue: "Problema de status",
    },
    submitted: "Multumim, sugestia a fost trimisa la verificare.",
    text: "Daca datele sunt invechite, trimite o corectie moderatorilor.",
    title: "Sugereaza o corectie",
  },
  ru: {
    actions: {
      hide: "Скрыть форму",
      login: "Войти, чтобы предложить исправление",
      open: "Предложить исправление",
      submit: "Отправить",
    },
    error: "Не удалось отправить исправление.",
    fields: {
      address: "Адрес",
      comment: "Комментарий",
      googleMaps: "Google Maps",
      image: "Изображение",
      name: "Название",
      officialWebsite: "Официальный сайт",
      priceMax: "Цена до",
      priceMin: "Цена от",
      reason: "Тип исправления",
      statusIssue: "Что не так со статусом",
    },
    reasons: {
      image_link: "Ссылка на изображение",
      name_address: "Название или адрес",
      place_closed: "Место закрыто",
      price: "Цена",
      source_link: "Ссылка на источник",
      status_issue: "Проблема со статусом",
    },
    submitted: "Спасибо, предложение отправлено в очередь проверки.",
    text: "Если данные устарели, отправьте правку модератору.",
    title: "Предложить исправление",
  },
} satisfies Record<LanguageCode, unknown>;

function PlaceCorrectionPanel({ place }: { place: Place }) {
  const { language } = useI18n();
  const auth = useAuth();
  const suggestCorrection = useSuggestPlaceCorrection();
  const copy = placeCorrectionCopy[language];
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reason, setReason] = useState<PlaceCorrectionReason>("name_address");
  const [note, setNote] = useState("");
  const [name, setName] = useState(place.name);
  const [address, setAddress] = useState(place.address ?? "");
  const [priceMin, setPriceMin] = useState(place.average_price.min?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(place.average_price.max?.toString() ?? "");
  const [officialUrl, setOfficialUrl] = useState(place.links.official ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(place.links.google_maps ?? "");
  const [imageUrl, setImageUrl] = useState(place.image_url ?? "");
  const [statusIssue, setStatusIssue] = useState("");

  const submitSuggestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: PlaceCorrectionPayload = {
      note: note.trim(),
      reason,
    };

    if (reason === "name_address") {
      payload.name = emptyToNull(name);
      payload.address = emptyToNull(address);
    }

    if (reason === "price") {
      payload.average_price_min = emptyToNumber(priceMin);
      payload.average_price_max = emptyToNumber(priceMax);
    }

    if (reason === "source_link") {
      payload.official_url = emptyToNull(officialUrl);
      payload.google_maps_url = emptyToNull(googleMapsUrl);
    }

    if (reason === "image_link") {
      payload.image_url = emptyToNull(imageUrl);
    }

    if (reason === "status_issue") {
      payload.status_issue = emptyToNull(statusIssue);
    }

    suggestCorrection.mutate(
      { payload, placeId: place.id },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setIsOpen(false);
          setNote("");
          setStatusIssue("");
        },
      },
    );
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          <PencilLine className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{copy.title}</div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {copy.text}
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {copy.submitted}
        </div>
      ) : null}

      {!auth.isHydrated ? null : auth.isAuthenticated ? (
        <>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setIsOpen((value) => !value);
              setIsSubmitted(false);
            }}
            type="button"
            variant="outline"
          >
            <PencilLine className="size-4" aria-hidden="true" />
            {isOpen ? copy.actions.hide : copy.actions.open}
          </Button>

          {isOpen ? (
            <form className="mt-4 space-y-3" onSubmit={submitSuggestion}>
              <label className="block text-sm font-medium">
                <span>{copy.fields.reason}</span>
                <select
                  className={cn(selectClassName, "mt-1")}
                  onChange={(event) =>
                    setReason(event.target.value as PlaceCorrectionReason)
                  }
                  value={reason}
                >
                  {correctionReasonValues.map((reasonValue) => (
                    <option key={reasonValue} value={reasonValue}>
                      {copy.reasons[reasonValue]}
                    </option>
                  ))}
                </select>
              </label>

              {reason === "name_address" ? (
                <div className="grid gap-3">
                  <label className="block text-sm font-medium">
                    <span>{copy.fields.name}</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      value={name}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    <span>{copy.fields.address}</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      onChange={(event) => setAddress(event.target.value)}
                      type="text"
                      value={address}
                    />
                  </label>
                </div>
              ) : null}

              {reason === "price" ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <label className="block text-sm font-medium">
                    <span>{copy.fields.priceMin}</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      min={0}
                      onChange={(event) => setPriceMin(event.target.value)}
                      type="number"
                      value={priceMin}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    <span>{copy.fields.priceMax}</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      min={0}
                      onChange={(event) => setPriceMax(event.target.value)}
                      type="number"
                      value={priceMax}
                    />
                  </label>
                </div>
              ) : null}

              {reason === "source_link" ? (
                <div className="grid gap-3">
                  <label className="block text-sm font-medium">
                    <span>{copy.fields.officialWebsite}</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      onChange={(event) => setOfficialUrl(event.target.value)}
                      type="url"
                      value={officialUrl}
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    <span>Google Maps</span>
                    <input
                      className={cn(inputClassName, "mt-1")}
                      onChange={(event) => setGoogleMapsUrl(event.target.value)}
                      type="url"
                      value={googleMapsUrl}
                    />
                  </label>
                </div>
              ) : null}

              {reason === "image_link" ? (
                <label className="block text-sm font-medium">
                  <span>{copy.fields.image}</span>
                  <input
                    className={cn(inputClassName, "mt-1")}
                    onChange={(event) => setImageUrl(event.target.value)}
                    type="url"
                    value={imageUrl}
                  />
                </label>
              ) : null}

              {reason === "status_issue" ? (
                <label className="block text-sm font-medium">
                  <span>{copy.fields.statusIssue}</span>
                  <input
                    className={cn(inputClassName, "mt-1")}
                    onChange={(event) => setStatusIssue(event.target.value)}
                    type="text"
                    value={statusIssue}
                  />
                </label>
              ) : null}

              <label className="block text-sm font-medium">
                <span>{copy.fields.comment}</span>
                <textarea
                  className={cn(textareaClassName, "mt-1 min-h-28")}
                  onChange={(event) => setNote(event.target.value)}
                  required
                  value={note}
                />
              </label>

              {suggestCorrection.error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {getApiErrorMessage(
                    suggestCorrection.error,
                    copy.error,
                  )}
                </div>
              ) : null}

              <Button
                className="w-full"
                disabled={suggestCorrection.isPending || note.trim().length === 0}
                type="submit"
              >
                {suggestCorrection.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                {copy.actions.submit}
              </Button>
            </form>
          ) : null}
        </>
      ) : (
        <Link
          className={buttonVariants({ className: "mt-4 w-full", variant: "outline" })}
          href="/login"
        >
          {copy.actions.login}
        </Link>
      )}
    </section>
  );
}

function PlaceDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 h-[24rem] animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <div className="h-44 animate-pulse rounded-lg bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-[28rem] animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  );
}

function PlaceDetailState({
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
    <section className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        <Link className={buttonVariants({ className: "mt-5" })} href="/places">
          {dictionary.places.actions.showAll}
        </Link>
      </div>
    </section>
  );
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function emptyToNumber(value: string): number | null {
  const trimmed = value.trim();

  return trimmed ? Number(trimmed) : null;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-background p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="mt-1 break-words text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
