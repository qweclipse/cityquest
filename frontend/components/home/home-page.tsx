"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Heart,
  Map,
  MapPinned,
  Plus,
  Shuffle,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { HomeActionId } from "@/lib/i18n/dictionaries";
import { homePageCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import {
  questAccentButtonClassName,
  questAccentClass,
  questAccentIconClassName,
  questAccentPanelClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

const actionIcons: Record<HomeActionId, LucideIcon> = {
  create: MapPinned,
  profile: UserRound,
  random: Shuffle,
};

const actionHrefs: Record<HomeActionId, string> = {
  create: "/routes/create",
  profile: "/profile",
  random: "/routes/random",
};

const actionStyles: Record<
  HomeActionId,
  {
    accent: string;
  }
> = {
  create: {
    accent: questAccentClass("teal"),
  },
  profile: {
    accent: questAccentClass("plum"),
  },
  random: {
    accent: questAccentClass("copper"),
  },
};

const benefitIcons = [Heart, Map, Sparkles] satisfies LucideIcon[];
const benefitAccents = [
  questAccentClass("rose"),
  questAccentClass("teal"),
  questAccentClass("gold"),
];

export function HomePage() {
  const { dictionary, language } = useI18n();
  const copy = homePageCopy[language];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
      <div className="relative isolate overflow-hidden rounded-lg bg-[var(--surface-contrast)] shadow-[0_22px_70px_rgba(70,82,72,0.18)] dark:bg-[#101413] dark:shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <div
          aria-hidden="true"
          className="cityquest-home-hero-photo absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="cityquest-home-hero-overlay absolute inset-0"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/18 to-transparent dark:from-black/42" />

        <div className="relative flex min-h-[calc(100svh-5.25rem)] flex-col justify-center gap-3 px-4 pb-24 pt-7 sm:min-h-[620px] sm:gap-7 sm:px-8 sm:py-10 lg:px-12 xl:px-14">
          <div className="mx-auto max-w-3xl text-center text-foreground dark:text-[#fff8ef]">
            <p className="mb-2 text-sm font-semibold text-primary dark:text-[var(--quest-copper)] sm:mb-3">
              {dictionary.home.eyebrow}
            </p>
            <h1 className="font-serif text-[2.15rem] font-bold leading-[0.96] text-balance drop-shadow-[0_2px_16px_rgba(255,248,238,0.4)] sm:text-5xl sm:leading-[0.98] lg:text-6xl dark:drop-shadow-[0_5px_24px_rgba(0,0,0,0.55)]">
              {dictionary.home.title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[0.95rem] leading-6 text-muted-foreground sm:mt-4 sm:text-lg sm:leading-7 dark:text-[#f3e4d1]">
              {dictionary.home.subtitle}
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-2 sm:gap-4 md:grid-cols-3">
            {dictionary.home.actions.map((action) => {
              const Icon = actionIcons[action.id];
              const href = actionHrefs[action.id];
              const styles = actionStyles[action.id];

              return (
                <article
                  className={cn(
                    "group relative isolate flex flex-col overflow-hidden rounded-lg border p-2.5 text-left shadow-[0_16px_42px_var(--quest-accent-shadow)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_54px_var(--quest-accent-shadow)] sm:min-h-[228px] sm:p-5 md:p-6 dark:shadow-[0_18px_50px_rgba(0,0,0,0.28)]",
                    styles.accent,
                    questAccentPanelClassName,
                  )}
                  key={action.id}
                >
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--quest-accent)]" />
                  <div className="relative flex flex-1 items-start gap-3 sm:block sm:text-center">
                    <div
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.34)] transition group-hover:scale-[1.04] sm:mx-auto sm:size-16",
                        questAccentIconClassName,
                      )}
                    >
                      <Icon className="size-5 sm:size-8" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-snug text-foreground sm:mt-5 sm:text-xl dark:text-[#fff6e8]">
                        {action.title}
                      </h2>
                      <p className="mt-1 text-[0.82rem] leading-5 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-6 dark:text-[#e5d4c0]">
                        {action.text}
                      </p>
                    </div>
                  </div>
                  <Link
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "relative mt-2 min-h-10 w-full gap-2 whitespace-normal px-3 py-2 text-center shadow-[0_10px_22px_rgba(49,33,22,0.12)] sm:mt-5",
                      questAccentButtonClassName,
                    )}
                    href={href}
                  >
                    {action.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <section className="relative isolate mt-4 overflow-hidden rounded-lg border border-border/70 bg-[color-mix(in_oklch,var(--surface-elevated),transparent_7%)] shadow-[0_18px_55px_rgba(55,72,64,0.12)] backdrop-blur sm:mt-5 dark:border-white/10 dark:bg-[#101413]/80 dark:shadow-[0_18px_60px_rgba(0,0,0,0.26)]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/60 dark:bg-white/10" />
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="p-5 sm:p-6 lg:p-8">
            <h2 className="max-w-3xl font-serif text-2xl font-bold leading-tight text-foreground sm:text-3xl dark:text-[#fff6e8]">
              {copy.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base dark:text-[#d7c5af]">
              {copy.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {copy.benefits.map((benefit, index) => {
                const Icon = benefitIcons[index] ?? Sparkles;

                return (
                  <div className={cn("flex gap-3", benefitAccents[index])} key={benefit.title}>
                    <span className={cn("grid size-11 shrink-0 place-items-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]", questAccentIconClassName)}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground dark:text-[#fff4e6]">
                        {benefit.title}
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-muted-foreground dark:text-[#d7c5af]">
                        {benefit.text}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground dark:text-[#d7c5af]">
                {copy.community}
              </p>
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  questAccentClass("rose"),
                  questAccentButtonClassName,
                  "min-h-10 whitespace-normal px-5 py-2 text-center",
                )}
                href="/places/new"
              >
                <Plus className="size-4" aria-hidden="true" />
                {copy.addPlace}
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="cityquest-home-section-photo relative min-h-[220px] border-t border-border/70 bg-cover bg-center sm:min-h-[260px] lg:border-l lg:border-t-0 dark:border-white/10"
          />
        </div>
      </section>
    </section>
  );
}
