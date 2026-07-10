"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  DatabaseZap,
  ExternalLink,
  Loader2,
  MapPinOff,
  ShieldCheck,
} from "lucide-react";

import { selectClassName } from "@/components/common/form-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  useAdminPendingPlaces,
  useAdminPlacesDataQuality,
  useApproveAdminPlace,
  useProfile,
  useRejectAdminPlace,
  useSetAdminPlaceStatus,
} from "@/hooks/api";
import type {
  AdminDuplicateCandidate,
  LanguageCode,
  Place,
  PlaceCorrectionSuggestion,
  VerificationStatus,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  getLocalizedPlaceContent,
  getLocalizedPlaceNameText,
} from "@/lib/i18n/content-localization";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import { cn } from "@/lib/utils";

const moderationStatusOptions: VerificationStatus[] = [
  "needs_review",
  "needs_location_review",
  "needs_image_review",
  "needs_source_review",
  "community_confirmed",
  "verified",
  "rejected",
  "closed",
];

const adminPlacesCopy = {
  en: {
    actions: {
      addTestPlace: "Add test place",
      login: "Sign in",
      open: "Open",
      reject: "Reject",
    },
    chips: {
      coordinatesMissing: "Needs coordinates",
      coordinatesReady: "Coordinates ready",
      imageMissing: "Needs image",
      imageReady: "Image ready",
      sourceMissing: "Needs source",
      sourceReady: "Source ready",
    },
    duplicates: {
      empty: "No duplicates found.",
      matches: "matches",
      title: "Possible duplicates",
    },
    hero: {
      eyebrow: "Public beta safety",
      subtitle: "UGC queue, data quality, sources, images and correction suggestions.",
      title: "Place moderation",
    },
    metrics: {
      corrections: "Corrections",
      missingCoordinates: "No coordinates",
      missingImages: "No image",
      missingSource: "No source",
      pending: "Pending",
    },
    pending: {
      empty: "The queue is empty. New places will appear here after submit.",
      loading: "Loading queue",
      subtitle: "New user places are not public until a moderator confirms them.",
      title: "Pending places",
    },
    quality: {
      emptyGroup: "No issues in this group.",
      loading: "Checking data quality",
      missingCoordinates: "No coordinates",
      missingImages: "No image",
      missingSource: "No source",
      subtitle: "Places missing data for maps, cards or verification.",
      title: "Data quality",
    },
    states: {
      checkingSession: "Checking session",
      deniedText: "This page requires moderator or admin rights.",
      deniedTitle: "Moderator rights required",
      loadingRole: "Loading user role",
      moderation: "Moderation",
      signInText: "Sign in with a moderator or admin account.",
      signInTitle: "Sign in required",
    },
    suggestions: {
      empty: "No new suggestions.",
      placeDeleted: "Place deleted",
      title: "Correction suggestions",
    },
    statusAria: "Change place status",
  },
  ro: {
    actions: {
      addTestPlace: "Adauga loc de test",
      login: "Autentificare",
      open: "Deschide",
      reject: "Respinge",
    },
    chips: {
      coordinatesMissing: "Necesita coordonate",
      coordinatesReady: "Coordonate disponibile",
      imageMissing: "Necesita imagine",
      imageReady: "Imagine disponibila",
      sourceMissing: "Necesita sursa",
      sourceReady: "Sursa disponibila",
    },
    duplicates: {
      empty: "Nu au fost gasite duplicate.",
      matches: "potriviri",
      title: "Duplicate posibile",
    },
    hero: {
      eyebrow: "Siguranta public beta",
      subtitle: "Coada UGC, calitatea datelor, surse, imagini si sugestii de corectie.",
      title: "Moderarea locurilor",
    },
    metrics: {
      corrections: "Corectii",
      missingCoordinates: "Fara coordonate",
      missingImages: "Fara imagine",
      missingSource: "Fara sursa",
      pending: "In coada",
    },
    pending: {
      empty: "Coada este goala. Locurile noi vor aparea aici dupa trimitere.",
      loading: "Se incarca coada",
      subtitle: "Locurile noi de la utilizatori nu devin publice pana nu sunt confirmate.",
      title: "Locuri in asteptare",
    },
    quality: {
      emptyGroup: "Nu exista probleme in acest grup.",
      loading: "Verificam calitatea datelor",
      missingCoordinates: "Fara coordonate",
      missingImages: "Fara imagine",
      missingSource: "Fara sursa",
      subtitle: "Locuri fara date pentru harta, carduri sau verificare.",
      title: "Calitatea datelor",
    },
    states: {
      checkingSession: "Verificam sesiunea",
      deniedText: "Aceasta pagina cere drepturi de moderator sau admin.",
      deniedTitle: "Sunt necesare drepturi de moderator",
      loadingRole: "Se incarca rolul utilizatorului",
      moderation: "Moderare",
      signInText: "Autentifica-te cu un cont de moderator sau admin.",
      signInTitle: "Autentificare necesara",
    },
    suggestions: {
      empty: "Nu exista sugestii noi.",
      placeDeleted: "Loc sters",
      title: "Sugestii de corectie",
    },
    statusAria: "Schimba statusul locului",
  },
  ru: {
    actions: {
      addTestPlace: "Добавить тестовое место",
      login: "Войти",
      open: "Открыть",
      reject: "Отклонить",
    },
    chips: {
      coordinatesMissing: "Нужны координаты",
      coordinatesReady: "Координаты есть",
      imageMissing: "Нужно фото",
      imageReady: "Фото есть",
      sourceMissing: "Нужен источник",
      sourceReady: "Источник есть",
    },
    duplicates: {
      empty: "Дубликаты не найдены.",
      matches: "совпадения",
      title: "Возможные дубликаты",
    },
    hero: {
      eyebrow: "Public beta safety",
      subtitle: "Очередь UGC, качество данных, источники, изображения и предложения правок.",
      title: "Модерация мест",
    },
    metrics: {
      corrections: "Правки",
      missingCoordinates: "Без координат",
      missingImages: "Без фото",
      missingSource: "Без источника",
      pending: "В очереди",
    },
    pending: {
      empty: "Очередь пуста. Новые места появятся здесь после submit.",
      loading: "Загружаем очередь",
      subtitle: "Новые пользовательские места не становятся публичными, пока их не подтвердит модератор.",
      title: "Pending places",
    },
    quality: {
      emptyGroup: "Нет проблем в этой группе.",
      loading: "Проверяем качество данных",
      missingCoordinates: "Нет координат",
      missingImages: "Нет изображения",
      missingSource: "Нет источника",
      subtitle: "Сводка мест, где не хватает данных для карты, карточек или проверки.",
      title: "Data quality",
    },
    states: {
      checkingSession: "Проверяем сессию",
      deniedText: "Для этой страницы нужны права moderator или admin.",
      deniedTitle: "Нужны права модератора",
      loadingRole: "Загружаем роль пользователя",
      moderation: "Модерация",
      signInText: "Войдите в аккаунт модератора или администратора.",
      signInTitle: "Нужен вход",
    },
    suggestions: {
      empty: "Новых предложений нет.",
      placeDeleted: "Место удалено",
      title: "Предложения правок",
    },
    statusAria: "Изменить статус места",
  },
} satisfies Record<LanguageCode, unknown>;

type AdminPlacesCopy = (typeof adminPlacesCopy)[LanguageCode];

export function AdminPlacesPage() {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = adminPlacesCopy[language];
  const profileQuery = useProfile();
  const pendingQuery = useAdminPendingPlaces();
  const qualityQuery = useAdminPlacesDataQuality();
  const approvePlace = useApproveAdminPlace();
  const rejectPlace = useRejectAdminPlace();
  const setStatus = useSetAdminPlaceStatus();
  const profile = profileQuery.data ?? auth.user;
  const canModerate = profile?.role === "moderator" || profile?.role === "admin";
  const isBusy =
    approvePlace.isPending || rejectPlace.isPending || setStatus.isPending;

  if (!auth.isHydrated) {
    return <AdminState text={copy.states.checkingSession} title={copy.states.moderation} />;
  }

  if (!auth.isAuthenticated) {
    return (
      <AdminState
        action={
          <Link className={buttonVariants()} href="/login">
            {copy.actions.login}
          </Link>
        }
        text={copy.states.signInText}
        title={copy.states.signInTitle}
      />
    );
  }

  if (profileQuery.isLoading && !profile) {
    return <AdminState text={copy.states.loadingRole} title={copy.states.moderation} />;
  }

  if (!canModerate) {
    return (
      <AdminState
        icon="denied"
        text={copy.states.deniedText}
        title={copy.states.deniedTitle}
      />
    );
  }

  const pendingPlaces = pendingQuery.data?.data ?? [];
  const quality = qualityQuery.data?.data;
  const qualityMeta = qualityQuery.data?.meta;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {copy.hero.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {copy.hero.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.hero.subtitle}
          </p>
        </div>
        <Link className={buttonVariants({ variant: "outline" })} href="/places/new">
          {copy.actions.addTestPlace}
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label={copy.metrics.pending} value={pendingQuery.data?.meta.count ?? 0} />
        <MetricCard
          label={copy.metrics.missingCoordinates}
          value={qualityMeta?.missing_coordinates_count ?? 0}
        />
        <MetricCard label={copy.metrics.missingSource} value={qualityMeta?.missing_source_count ?? 0} />
        <MetricCard label={copy.metrics.missingImages} value={qualityMeta?.missing_images_count ?? 0} />
        <MetricCard
          label={copy.metrics.corrections}
          value={qualityMeta?.correction_suggestions_count ?? 0}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="min-w-0">
          <SectionHeader
            icon={ShieldCheck}
            subtitle={copy.pending.subtitle}
            title={copy.pending.title}
          />

          {pendingQuery.isLoading ? (
            <InlineLoading text={copy.pending.loading} />
          ) : pendingQuery.isError ? (
            <InlineError text={pendingQuery.error.message} />
          ) : pendingPlaces.length > 0 ? (
            <div className="mt-4 grid gap-3">
              {pendingPlaces.map((place) => (
                <PendingPlaceCard
                  busy={isBusy}
                  key={place.id}
                  onApprove={() =>
                    approvePlace.mutate({
                      payload: { status: "community_confirmed" },
                      placeId: place.id,
                    })
                  }
                  onReject={() =>
                    rejectPlace.mutate({
                      payload: { note: "Rejected from moderation queue." },
                      placeId: place.id,
                    })
                  }
                  onStatusChange={(status) =>
                    setStatus.mutate({
                      payload: { status },
                      placeId: place.id,
                    })
                  }
                  place={place}
                  copy={copy}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel text={copy.pending.empty} />
          )}
        </section>

        <aside className="space-y-4">
          <SectionHeader
            icon={DatabaseZap}
            subtitle={copy.quality.subtitle}
            title={copy.quality.title}
          />
          {qualityQuery.isLoading ? (
            <InlineLoading text={copy.quality.loading} />
          ) : qualityQuery.isError ? (
            <InlineError text={qualityQuery.error.message} />
          ) : quality ? (
            <>
              <QualityList
                icon={MapPinOff}
                emptyText={copy.quality.emptyGroup}
                places={quality.missing_coordinates}
                title={copy.quality.missingCoordinates}
              />
              <QualityList
                icon={ExternalLink}
                emptyText={copy.quality.emptyGroup}
                places={quality.missing_source}
                title={copy.quality.missingSource}
              />
              <QualityList
                icon={AlertTriangle}
                emptyText={copy.quality.emptyGroup}
                places={quality.missing_images}
                title={copy.quality.missingImages}
              />
              <CorrectionSuggestions copy={copy} items={quality.correction_suggestions} />
              <DuplicateCandidates copy={copy} items={quality.duplicate_candidates} />
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function PendingPlaceCard({
  busy,
  copy,
  onApprove,
  onReject,
  onStatusChange,
  place,
}: {
  busy: boolean;
  copy: AdminPlacesCopy;
  onApprove: () => void;
  onReject: () => void;
  onStatusChange: (status: VerificationStatus) => void;
  place: Place;
}) {
  const { dictionary, language } = useI18n();
  const categoryName = categoryDisplayName(place.category, dictionary);
  const statusLabel = placeVerificationLabel(place.verification_status, dictionary);
  const hasCoordinates = hasUsableCoordinates(place);
  const hasSource = Object.values(place.links).some(Boolean);
  const hasImage = place.image_url || (place.photos?.length ?? 0) > 0;
  const localizedPlace = getLocalizedPlaceContent(place, language);

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{localizedPlace.name}</h2>
            <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {localizedPlace.shortDescription ?? localizedPlace.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-lg bg-muted px-2 py-1">{categoryName}</span>
            <span
              className={cn(
                "rounded-lg px-2 py-1",
                hasCoordinates ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
              )}
            >
              {hasCoordinates ? copy.chips.coordinatesReady : copy.chips.coordinatesMissing}
            </span>
            <span
              className={cn(
                "rounded-lg px-2 py-1",
                hasSource ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
              )}
            >
              {hasSource ? copy.chips.sourceReady : copy.chips.sourceMissing}
            </span>
            <span
              className={cn(
                "rounded-lg px-2 py-1",
                hasImage ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
              )}
            >
              {hasImage ? copy.chips.imageReady : copy.chips.imageMissing}
            </span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
          <select
            aria-label={copy.statusAria}
            className={selectClassName}
            disabled={busy}
            onChange={(event) => onStatusChange(event.target.value as VerificationStatus)}
            value={place.verification_status}
          >
            {moderationStatusOptions.map((status) => (
              <option key={status} value={status}>
                {placeVerificationLabel(status, dictionary)}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={busy} onClick={onApprove} type="button">
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              <BadgeCheck className="size-4" aria-hidden="true" />
              OK
            </Button>
            <Button disabled={busy} onClick={onReject} type="button" variant="destructive">
              <Ban className="size-4" aria-hidden="true" />
              {copy.actions.reject}
            </Button>
          </div>
          <Link
            className={buttonVariants({ className: "w-full", variant: "outline" })}
            href={`/places/${place.id}`}
          >
            {copy.actions.open}
          </Link>
        </div>
      </div>
    </article>
  );
}

function QualityList({
  emptyText,
  icon: Icon,
  places,
  title,
}: {
  emptyText: string;
  icon: typeof AlertTriangle;
  places: Place[];
  title: string;
}) {
  const { language } = useI18n();

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <h2 className="truncate text-sm font-semibold">{title}</h2>
        </div>
        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">
          {places.length}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {places.slice(0, 5).map((place) => (
          <Link
            className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:bg-muted"
            href={`/places/${place.id}`}
            key={place.id}
          >
            <span className="truncate">
              {getLocalizedPlaceContent(place, language).name}
            </span>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </Link>
        ))}
        {places.length === 0 ? (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CorrectionSuggestions({
  copy,
  items,
}: {
  copy: AdminPlacesCopy;
  items: PlaceCorrectionSuggestion[];
}) {
  const { language } = useI18n();

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{copy.suggestions.title}</h2>
        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">
          {items.length}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 5).map((item) => (
          <div className="rounded-lg border border-border bg-background p-3 text-sm" key={item.id}>
            <div className="font-semibold">
              {getLocalizedPlaceNameText(item.place?.name, language) ??
                copy.suggestions.placeDeleted}
            </div>
            <div className="mt-1 text-xs uppercase text-muted-foreground">
              {item.payload.reason}
            </div>
            <p className="mt-2 line-clamp-3 text-muted-foreground">{item.payload.note}</p>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {copy.suggestions.empty}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DuplicateCandidates({
  copy,
  items,
}: {
  copy: AdminPlacesCopy;
  items: AdminDuplicateCandidate[];
}) {
  const { language } = useI18n();

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{copy.duplicates.title}</h2>
        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold">
          {items.length}
        </span>
      </div>
      <div className="mt-3 grid gap-2">
        {items.slice(0, 5).map((item) => (
          <div className="rounded-lg border border-border bg-background p-3 text-sm" key={`${item.city_id}-${item.name}`}>
            <div className="font-semibold">
              {getLocalizedPlaceNameText(item.name, language) ?? item.name}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {item.count} {copy.duplicates.matches}
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {copy.duplicates.empty}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: typeof ShieldCheck;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function InlineLoading({ text }: { text: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {text}
    </div>
  );
}

function InlineError({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      {text}
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function AdminState({
  action,
  icon,
  text,
  title,
}: {
  action?: ReactNode;
  icon?: "denied";
  text: string;
  title: string;
}) {
  const Icon = icon === "denied" ? Ban : ShieldCheck;

  return (
    <section className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-lg bg-muted text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </section>
  );
}

function hasUsableCoordinates(place: Place): boolean {
  return (
    Number.isFinite(place.coordinates.lat) &&
    Number.isFinite(place.coordinates.lng) &&
    place.coordinates.lat !== 0 &&
    place.coordinates.lng !== 0
  );
}
