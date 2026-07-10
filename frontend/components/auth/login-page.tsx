"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormField, inputClassName } from "@/components/common/form-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLogin } from "@/hooks/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { authCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { loginSchema, type LoginFormValues } from "@/lib/validation/cityquest-schemas";

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginPage() {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = authCopy[language];
  const login = useLogin();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (auth.isHydrated && auth.isAuthenticated) {
      router.replace("/profile");
    }
  }, [auth.isAuthenticated, auth.isHydrated, router]);

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        router.push("/profile");
      },
    });
  });

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
      <div>
        <div className="inline-flex rounded-lg bg-muted px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
          CityQuest
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.login.heading}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          {copy.login.subtitle}
        </p>
      </div>

      <form
        className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6"
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <LogIn className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">{copy.login.cta}</h2>
            <p className="text-sm text-muted-foreground">{copy.login.registerText}</p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            error={form.formState.errors.email?.message}
            label={copy.common.email}
          >
            <input
              autoComplete="email"
              className={inputClassName}
              type="email"
              {...form.register("email")}
            />
          </FormField>

          <FormField
            error={form.formState.errors.password?.message}
            label={copy.common.password}
          >
            <input
              autoComplete="current-password"
              className={inputClassName}
              type="password"
              {...form.register("password")}
            />
          </FormField>
        </div>

        {login.error ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getApiErrorMessage(login.error, copy.errors.loginFailed)}
          </div>
        ) : null}

        {auth.isHydrated && auth.isAuthenticated ? (
          <div className="mt-4 rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
            {copy.common.alreadySignedIn}
          </div>
        ) : null}

        <Button
          className="mt-5 h-11 w-full"
          disabled={login.isPending || !auth.isHydrated}
          type="submit"
        >
          {login.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {login.isPending ? copy.common.loading : copy.login.cta}
        </Button>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{copy.login.registerText}</span>
          <Link className={buttonVariants({ variant: "link" })} href="/register">
            {copy.login.registerLink}
          </Link>
        </div>
      </form>
    </section>
  );
}
