"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  FormField,
  inputClassName,
  selectClassName,
} from "@/components/common/form-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCities, useRegister } from "@/hooks/api";
import type { RegisterPayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import {
  authCopy,
  localizedLanguageNames,
  localizedThemeNames,
} from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation/cityquest-schemas";

const languageCodes = ["ru", "en", "ro"] as const;
const themeCodes = ["system", "light", "dark"] as const;

export function RegisterPage() {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = authCopy[language];
  const registerMutation = useRegister();
  const citiesQuery = useCities();
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      password_confirmation: "",
      preferred_language: language,
      preferred_theme: "system",
    },
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (auth.isHydrated && auth.isAuthenticated) {
      router.replace("/profile");
    }
  }, [auth.isAuthenticated, auth.isHydrated, router]);

  useEffect(() => {
    const firstCity = citiesQuery.data?.[0];

    if (firstCity && !form.getValues("preferred_city_id")) {
      form.setValue("preferred_city_id", firstCity.id, { shouldValidate: true });
    }
  }, [citiesQuery.data, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload: RegisterPayload = {
      ...values,
      preferred_city_id: values.preferred_city_id ?? null,
    };

    registerMutation.mutate(payload, {
      onSuccess: () => {
        router.push("/profile");
      },
    });
  });

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_27rem] lg:px-8">
      <div className="lg:pt-12">
        <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
          CityQuest
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.register.heading}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {copy.register.subtitle}
        </p>
      </div>

      <form
        className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6"
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <UserPlus className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">{copy.register.cta}</h2>
            <p className="text-sm text-muted-foreground">{copy.register.loginText}</p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField error={form.formState.errors.name?.message} label={copy.common.name}>
            <input
              autoComplete="name"
              className={inputClassName}
              type="text"
              {...form.register("name")}
            />
          </FormField>

          <FormField error={form.formState.errors.email?.message} label={copy.common.email}>
            <input
              autoComplete="email"
              className={inputClassName}
              type="email"
              {...form.register("email")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={form.formState.errors.password?.message}
              label={copy.common.password}
            >
              <input
                autoComplete="new-password"
                className={inputClassName}
                type="password"
                {...form.register("password")}
              />
            </FormField>

            <FormField
              error={form.formState.errors.password_confirmation?.message}
              label={copy.common.passwordConfirmation}
            >
              <input
                autoComplete="new-password"
                className={inputClassName}
                type="password"
                {...form.register("password_confirmation")}
              />
            </FormField>
          </div>

          <FormField
            error={form.formState.errors.preferred_city_id?.message}
            label={copy.common.preferredCity}
          >
            <select
              className={selectClassName}
              disabled={citiesQuery.isLoading}
              {...form.register("preferred_city_id", {
                setValueAs: (value: string) => (value ? Number(value) : null),
              })}
            >
              {citiesQuery.data?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={copy.common.preferredLanguage}>
              <select className={selectClassName} {...form.register("preferred_language")}>
                {languageCodes.map((code) => (
                  <option key={code} value={code}>
                    {localizedLanguageNames[code]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={copy.common.preferredTheme}>
              <select className={selectClassName} {...form.register("preferred_theme")}>
                {themeCodes.map((code) => (
                  <option key={code} value={code}>
                    {localizedThemeNames[language][code]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {registerMutation.error ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getApiErrorMessage(registerMutation.error, copy.errors.registerFailed)}
          </div>
        ) : null}

        <Button
          className="mt-5 h-11 w-full"
          disabled={registerMutation.isPending || !auth.isHydrated}
          type="submit"
        >
          {registerMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {registerMutation.isPending ? copy.common.loading : copy.register.cta}
        </Button>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{copy.register.loginText}</span>
          <Link className={buttonVariants({ variant: "link" })} href="/login">
            {copy.register.loginLink}
          </Link>
        </div>
      </form>
    </section>
  );
}
