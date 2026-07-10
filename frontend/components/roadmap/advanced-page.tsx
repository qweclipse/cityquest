"use client";

import {
  Bell,
  CalendarDays,
  Database,
  Gift,
  Layers3,
  LockKeyhole,
  MapPinned,
  PackageOpen,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { advancedCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

type RoadmapKey = (typeof advancedCopy)["en"]["roadmap"]["items"][number]["key"];

const roadmapIcons = {
  buddy: UsersRound,
  deals: Gift,
  events: CalendarDays,
  notifications: Bell,
  packs: PackageOpen,
  personal: Route,
  places: Database,
  travel: Plane,
} as const satisfies Record<RoadmapKey, LucideIcon>;

export function AdvancedPage() {
  const { language } = useI18n();
  const copy = advancedCopy[language];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {[
                  copy.availability.future,
                  copy.availability.apiFirst,
                  copy.availability.noPayments,
                ].map((badge) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                    key={badge}
                  >
                    <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Layers3 className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold sm:text-5xl">
                {copy.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {copy.hero.note}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {copy.hero.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link className={buttonVariants()} href="/routes/create">
                  <Route className="size-4" aria-hidden="true" />
                  {copy.actions.createRoute}
                </Link>
                <Link className={buttonVariants({ variant: "outline" })} href="/profile">
                  <UserRound className="size-4" aria-hidden="true" />
                  {copy.actions.profile}
                </Link>
                <Link className={buttonVariants({ variant: "outline" })} href="/notifications">
                  <Bell className="size-4" aria-hidden="true" />
                  {copy.actions.notifications}
                </Link>
              </div>
            </div>

            <div className="relative min-h-64 border-t border-border bg-muted lg:border-l lg:border-t-0">
              <Image
                alt=""
                className="object-cover opacity-95"
                fill
                priority
                sizes="(min-width: 1024px) 18rem, 100vw"
                src="/images/sections/city-card-dark.jpg"
              />
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{copy.unavailable.title}</h2>
          <div className="mt-4 space-y-2">
            {copy.unavailable.items.map((item) => (
              <div
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                key={item}
              >
                <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-5">
        <h2 className="text-lg font-semibold">{copy.now.title}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {copy.now.items.map((item, index) => {
            const Icon = index === 0 ? Route : index === 1 ? MapPinned : UserRound;

            return (
              <InfoCard
                icon={Icon}
                key={item.title}
                text={item.text}
                title={item.title}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{copy.roadmap.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {copy.roadmap.items.map((item) => {
            const Icon = roadmapIcons[item.key];

            return (
              <InfoCard
                icon={Icon}
                key={item.key}
                text={item.text}
                title={item.title}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <ActionLink
          href="/collections"
          icon={Sparkles}
          label={copy.actions.collections}
        />
        <ActionLink href="/places" icon={MapPinned} label={copy.actions.places} />
      </section>
    </section>
  );
}

function InfoCard({
  icon: Icon,
  text,
  title,
}: {
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-muted"
      href={href}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <Sparkles className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
