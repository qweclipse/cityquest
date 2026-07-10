"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CircleCheckBig,
  Link2,
  Loader2,
  MapPinned,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/common/form-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCategories, useCities, useCreatePlace } from "@/hooks/api";
import type { Place, StorePlacePayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { placeSubmitCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  categoryDisplayName,
  placeVerificationLabel,
} from "@/lib/places/place-format";
import {
  storePlaceSchema,
  type StorePlaceFormValues,
} from "@/lib/validation/cityquest-schemas";

const defaultValues: StorePlaceFormValues = {
  category_id: 0,
  city_id: 0,
  currency_code: "MDL",
  description: "",
  lat: 47.0105,
  lng: 28.8638,
  name: "",
  visit_duration_minutes: 45,
};

export function PlaceSubmitPage() {
  const auth = useAuth();
  const { dictionary, language } = useI18n();
  const copy = placeSubmitCopy[language];
  const citiesQuery = useCities();
  const categoriesQuery = useCategories();
  const createPlace = useCreatePlace();
  const [submittedPlace, setSubmittedPlace] = useState<Place | null>(null);
  const form = useForm<StorePlaceFormValues>({
    defaultValues,
    resolver: zodResolver(storePlaceSchema),
  });

  useEffect(() => {
    const firstCity = citiesQuery.data?.[0];

    if (firstCity && !form.getValues("city_id")) {
      form.setValue("city_id", firstCity.id, { shouldValidate: true });
    }
  }, [citiesQuery.data, form]);

  useEffect(() => {
    const firstCategory = categoriesQuery.data?.[0];

    if (firstCategory && !form.getValues("category_id")) {
      form.setValue("category_id", firstCategory.id, { shouldValidate: true });
    }
  }, [categoriesQuery.data, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = normalizeStorePlacePayload(values);

    createPlace.mutate(payload, {
      onSuccess: (place) => {
        setSubmittedPlace(place);
        form.reset({
          ...defaultValues,
          category_id: values.category_id,
          city_id: values.city_id,
        });
      },
    });
  });

  if (!auth.isHydrated) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {copy.title}
        </div>
      </section>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link className={buttonVariants({ variant: "outline" })} href="/places">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {dictionary.places.detail.back}
        </Link>

        <div className="mt-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{copy.auth.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {copy.auth.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className={buttonVariants()} href="/login">
              {copy.actions.login}
            </Link>
            <Link className={buttonVariants({ variant: "outline" })} href="/register">
              {copy.actions.register}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link className={buttonVariants({ variant: "outline" })} href="/places">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {dictionary.places.detail.back}
      </Link>

      <div className="mt-5">
        <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
          {dictionary.places.eyebrow}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      {submittedPlace ? (
        <SubmittedPlaceReview
          onAddAnother={() => setSubmittedPlace(null)}
          place={submittedPlace}
        />
      ) : (
      <form className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]" onSubmit={onSubmit}>
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <SectionTitle>{copy.sections.basics}</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField error={form.formState.errors.city_id?.message} label={copy.fields.city}>
                <select
                  className={selectClassName}
                  disabled={citiesQuery.isLoading}
                  {...form.register("city_id", { valueAsNumber: true })}
                >
                  {citiesQuery.data?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                error={form.formState.errors.category_id?.message}
                label={copy.fields.category}
              >
                <select
                  className={selectClassName}
                  disabled={categoriesQuery.isLoading}
                  {...form.register("category_id", { valueAsNumber: true })}
                >
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryDisplayName(category, dictionary)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField error={form.formState.errors.name?.message} label={copy.fields.name}>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  type="text"
                  {...form.register("name")}
                />
              </FormField>

              <FormField
                error={form.formState.errors.short_description?.message}
                label={copy.fields.shortDescription}
              >
                <input
                  className={inputClassName}
                  type="text"
                  {...form.register("short_description", optionalTextValue)}
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <SectionTitle>{copy.sections.details}</SectionTitle>
            <div className="mt-4 space-y-4">
              <FormField
                error={form.formState.errors.description?.message}
                label={copy.fields.description}
              >
                <textarea className={textareaClassName} {...form.register("description")} />
              </FormField>

              <FormField
                error={form.formState.errors.address?.message}
                label={copy.fields.address}
              >
                <input
                  autoComplete="street-address"
                  className={inputClassName}
                  type="text"
                  {...form.register("address", optionalTextValue)}
                />
              </FormField>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <SectionTitle>{copy.sections.location}</SectionTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.hints.coordinates}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField error={form.formState.errors.lat?.message} label={copy.fields.lat}>
                <input
                  className={inputClassName}
                  step="0.000001"
                  type="number"
                  {...form.register("lat", { valueAsNumber: true })}
                />
              </FormField>

              <FormField error={form.formState.errors.lng?.message} label={copy.fields.lng}>
                <input
                  className={inputClassName}
                  step="0.000001"
                  type="number"
                  {...form.register("lng", { valueAsNumber: true })}
                />
              </FormField>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-5">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPinned className="size-4 text-primary" aria-hidden="true" />
                <SectionTitle>{copy.sections.price}</SectionTitle>
              </div>

              <div className="mt-4 grid gap-4">
                <FormField
                  error={form.formState.errors.visit_duration_minutes?.message}
                  label={copy.fields.visitDuration}
                >
                  <input
                    className={inputClassName}
                    min={5}
                    step={5}
                    type="number"
                    {...form.register("visit_duration_minutes", optionalNumberValue)}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <FormField
                    error={form.formState.errors.average_price_min?.message}
                    label={copy.fields.priceMin}
                  >
                    <input
                      className={inputClassName}
                      min={0}
                      step={1}
                      type="number"
                      {...form.register("average_price_min", optionalNumberValue)}
                    />
                  </FormField>

                  <FormField
                    error={form.formState.errors.average_price_max?.message}
                    label={copy.fields.priceMax}
                  >
                    <input
                      className={inputClassName}
                      min={0}
                      step={1}
                      type="number"
                      {...form.register("average_price_max", optionalNumberValue)}
                    />
                  </FormField>
                </div>

                <FormField
                  error={form.formState.errors.currency_code?.message}
                  label={copy.fields.currency}
                >
                  <input
                    className={inputClassName}
                    maxLength={3}
                    type="text"
                    {...form.register("currency_code", {
                      setValueAs: (value: string) => emptyToNull(value)?.toUpperCase() ?? null,
                    })}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-primary" aria-hidden="true" />
                <SectionTitle>{copy.sections.links}</SectionTitle>
              </div>

              <div className="mt-4 space-y-4">
                <FormField
                  error={form.formState.errors.official_url?.message}
                  label={copy.fields.officialUrl}
                >
                  <input
                    autoComplete="url"
                    className={inputClassName}
                    type="url"
                    {...form.register("official_url", optionalTextValue)}
                  />
                </FormField>

                <FormField
                  error={form.formState.errors.google_maps_url?.message}
                  label={copy.fields.googleMapsUrl}
                >
                  <input
                    autoComplete="url"
                    className={inputClassName}
                    type="url"
                    {...form.register("google_maps_url", optionalTextValue)}
                  />
                </FormField>

                <FormField
                  error={form.formState.errors.yandex_maps_url?.message}
                  label={copy.fields.yandexMapsUrl}
                >
                  <input
                    autoComplete="url"
                    className={inputClassName}
                    type="url"
                    {...form.register("yandex_maps_url", optionalTextValue)}
                  />
                </FormField>

                <FormField
                  error={form.formState.errors.external_source_url?.message}
                  label={copy.fields.externalSourceUrl}
                >
                  <input
                    autoComplete="url"
                    className={inputClassName}
                    type="url"
                    {...form.register("external_source_url", optionalTextValue)}
                  />
                </FormField>

                <FormField
                  error={form.formState.errors.image_url?.message}
                  label={copy.fields.imageUrl}
                >
                  <input
                    autoComplete="url"
                    className={inputClassName}
                    type="url"
                    {...form.register("image_url", optionalTextValue)}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm leading-6 text-muted-foreground">{copy.hints.moderation}</p>
              </div>

              {createPlace.error ? (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {getApiErrorMessage(createPlace.error, copy.errors.create)}
                </div>
              ) : null}

              <Button
                className="mt-5 h-11 w-full"
                disabled={
                  createPlace.isPending ||
                  citiesQuery.isLoading ||
                  categoriesQuery.isLoading
                }
                type="submit"
              >
                {createPlace.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {createPlace.isPending ? copy.actions.submitting : copy.actions.submit}
              </Button>
            </section>
          </div>
        </aside>
      </form>
      )}
    </section>
  );
}

function SubmittedPlaceReview({
  onAddAnother,
  place,
}: {
  onAddAnother: () => void;
  place: Place;
}) {
  const { dictionary, language } = useI18n();
  const copy = placeSubmitCopy[language];
  const statusLabel = placeVerificationLabel(place.verification_status, dictionary);

  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
            <CircleCheckBig className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">{copy.review.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.review.text}
          </p>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{copy.review.statusLabel}</span>
            <span className="min-w-0 truncate font-semibold">{statusLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button onClick={onAddAnother} type="button" variant="outline">
            <Plus className="size-4" aria-hidden="true" />
            {copy.review.addAnother}
          </Button>
          <Link className={buttonVariants()} href={`/places/${place.id}`}>
            <MapPinned className="size-4" aria-hidden="true" />
            {copy.review.openPlace}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

const optionalTextValue = {
  setValueAs: (value: string) => emptyToNull(value),
};

const optionalNumberValue = {
  setValueAs: (value: string) => (value === "" ? null : Number(value)),
};

function normalizeStorePlacePayload(values: StorePlaceFormValues): StorePlacePayload {
  return {
    ...values,
    address: emptyToNull(values.address),
    currency_code: emptyToNull(values.currency_code)?.toUpperCase() ?? null,
    external_source_url: emptyToNull(values.external_source_url),
    google_maps_url: emptyToNull(values.google_maps_url),
    image_url: emptyToNull(values.image_url),
    official_url: emptyToNull(values.official_url),
    short_description: emptyToNull(values.short_description),
    yandex_maps_url: emptyToNull(values.yandex_maps_url),
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
