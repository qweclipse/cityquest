"use client";

import {
  BadgeCheck,
  CalendarDays,
  Gift,
  LockKeyhole,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { plannedFeatureCopy, type PlannedFeature } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

type FeatureMeta = {
  accentIcon: LucideIcon;
  imageSrc: string;
};

const featureMeta = {
  deals: {
    accentIcon: Gift,
    imageSrc: "/images/sections/city-card-light.jpg",
  },
  events: {
    accentIcon: CalendarDays,
    imageSrc: "/images/hero/city-light.jpg",
  },
} as const satisfies Record<PlannedFeature, FeatureMeta>;

export function PlannedFeaturePage({ feature }: { feature: PlannedFeature }) {
  const { language } = useI18n();
  const copy = plannedFeatureCopy[language];
  const featureCopy = copy.features[feature];
  const meta = featureMeta[feature];
  const AccentIcon = meta.accentIcon;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="grid min-h-[27rem] gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {featureCopy.badges.map((badge) => (
                  <span
                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                    key={badge}
                  >
                    <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
                    {badge}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground">
                <AccentIcon className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold sm:text-5xl">
                {featureCopy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {featureCopy.heroNote}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {featureCopy.heroSubtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link className={buttonVariants()} href="/routes/create">
                  <Route className="size-4" aria-hidden="true" />
                  {copy.common.createRoute}
                </Link>
                <Link className={buttonVariants({ variant: "outline" })} href="/collections">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {copy.common.collections}
                </Link>
                <Link className={buttonVariants({ variant: "outline" })} href="/places">
                  <MapPinned className="size-4" aria-hidden="true" />
                  {copy.common.places}
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
                src={meta.imageSrc}
              />
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{copy.common.unavailableTitle}</h2>
          <div className="mt-4 space-y-2">
            {featureCopy.unavailable.map((item) => (
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
        <h2 className="text-lg font-semibold">{copy.common.actionsTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ActionCard
            href="/routes/create"
            icon={Route}
            text={featureCopy.actions.routes}
            title={copy.common.createRoute}
          />
          <ActionCard
            href="/collections"
            icon={Sparkles}
            text={featureCopy.actions.collections}
            title={copy.common.collections}
          />
          <ActionCard
            href="/places"
            icon={MapPinned}
            text={featureCopy.actions.places}
            title={copy.common.places}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{copy.common.roadmapTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {featureCopy.roadmap.map((item) => (
            <RoadmapCard key={item.title} text={item.text} title={item.title} />
          ))}
        </div>
      </section>
    </section>
  );
}

function ActionCard({
  href,
  icon: Icon,
  text,
  title,
}: {
  href: string;
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <Link
      className="group rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted"
      href={href}
    >
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </Link>
  );
}

function RoadmapCard({ text, title }: { text: string; title: string }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}
