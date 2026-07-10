"use client";

import {
  BadgeCheck,
  CalendarClock,
  LockKeyhole,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { buddyCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function BuddyPage() {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = buddyCopy[language];
  const readiness = [
    auth.isAuthenticated ? copy.availability.profileReady : copy.availability.signInNeeded,
    copy.availability.verification,
    copy.availability.status,
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap gap-2">
            {readiness.map((item) => (
              <span
                className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                key={item}
              >
                <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
            <div>
              <div className="grid size-14 place-items-center rounded-lg bg-primary text-primary-foreground">
                <UsersRound className="size-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
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
                <Link className={buttonVariants({ variant: "outline" })} href="/collections">
                  <Sparkles className="size-4" aria-hidden="true" />
                  {copy.actions.collections}
                </Link>
                {!auth.isAuthenticated ? (
                  <Link className={buttonVariants({ variant: "outline" })} href="/login">
                    <LockKeyhole className="size-4" aria-hidden="true" />
                    {copy.actions.login}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {copy.roadmap.items.safety.text}
              </p>
            </div>
          </div>
        </div>

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

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{copy.current.title}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ActionCard
              href="/routes/create"
              icon={Route}
              text={copy.current.cards.routes}
              title={copy.actions.createRoute}
            />
            <ActionCard
              href="/collections"
              icon={Sparkles}
              text={copy.current.cards.collections}
              title={copy.actions.collections}
            />
            <ActionCard
              href="/places"
              icon={MapPinned}
              text={copy.current.cards.places}
              title={copy.actions.places}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">{copy.roadmap.title}</h2>
          <div className="mt-4 space-y-3">
            <RoadmapItem
              icon={ShieldCheck}
              text={copy.roadmap.items.safety.text}
              title={copy.roadmap.items.safety.title}
            />
            <RoadmapItem
              icon={UserRoundCheck}
              text={copy.roadmap.items.profile.text}
              title={copy.roadmap.items.profile.title}
            />
            <RoadmapItem
              icon={CalendarClock}
              text={copy.roadmap.items.moderation.text}
              title={copy.roadmap.items.moderation.title}
            />
          </div>
        </section>
      </div>
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
  icon: typeof Route;
  text: string;
  title: string;
}) {
  return (
    <Link
      className="group rounded-lg border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:bg-muted"
      href={href}
    >
      <Icon className="size-5 text-primary" aria-hidden="true" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </Link>
  );
}

function RoadmapItem({
  icon: Icon,
  text,
  title,
}: {
  icon: typeof ShieldCheck;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
