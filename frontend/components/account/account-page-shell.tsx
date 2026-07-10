"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

export function AccountPageShell({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = accountCopy[language];

  if (!auth.isHydrated) {
    return (
      <AccountFrame icon={Icon} subtitle={subtitle} title={title}>
        <AccountLoading label={copy.common.loading} />
      </AccountFrame>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <AccountFrame icon={LockKeyhole} subtitle={copy.guard.subtitle} title={copy.guard.title}>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Link className={buttonVariants()} href="/login">
              {copy.actions.login}
            </Link>
            <Link className={buttonVariants({ variant: "outline" })} href="/register">
              {copy.actions.register}
            </Link>
          </div>
        </div>
      </AccountFrame>
    );
  }

  return (
    <AccountFrame icon={Icon} subtitle={subtitle} title={title}>
      {children}
    </AccountFrame>
  );
}

export function AccountFrame({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}

export function AccountLoading({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
      <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function AccountError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
      {message}
    </div>
  );
}

export function AccountEmptyState({
  action,
  actionHref,
  actionLabel,
  text,
  title,
}: {
  action?: "default" | "outline";
  actionHref?: string;
  actionLabel?: string;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p>
      {actionHref && actionLabel ? (
        <Link
          className={cn(
            buttonVariants({
              className: "mt-4",
              variant: action === "outline" ? "outline" : "default",
            }),
          )}
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function AccountSection({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-5 shadow-sm", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
