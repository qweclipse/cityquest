"use client";

import { BadgeCheck, Clock3, Footprints, History, Route } from "lucide-react";
import Link from "next/link";

import {
  AccountEmptyState,
  AccountError,
  AccountLoading,
  AccountPageShell,
  AccountSection,
} from "@/components/account/account-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { useNotifications, useProfile } from "@/hooks/api";
import type { CityRoute, LanguageCode, RouteActivity } from "@/lib/api/types";
import { formatAccountDate, notificationTypeLabel } from "@/lib/account/account-format";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import {
  getLocalizedNotificationContent,
  getLocalizedRouteContent,
} from "@/lib/i18n/content-localization";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { routeDisplayTitle } from "@/lib/routes/route-format";

const routeActivityCopy = {
  en: {
    completed: "Completed route",
    started: "Started route",
  },
  ro: {
    completed: "Traseu finalizat",
    started: "Traseu pornit",
  },
  ru: {
    completed: "Завершённый маршрут",
    started: "Начатый маршрут",
  },
} as const;

export function HistoryPage() {
  const { dictionary, language } = useI18n();
  const copy = accountCopy[language];
  const profileQuery = useProfile();
  const notificationsQuery = useNotifications();
  const routes = profileQuery.data?.saved_routes ?? [];
  const routeActivities = profileQuery.data?.recent_route_activity ?? [];
  const notifications = notificationsQuery.data ?? [];
  const activityCopy = routeActivityCopy[language];
  const isLoading = profileQuery.isLoading || notificationsQuery.isLoading;
  const isError = profileQuery.isError || notificationsQuery.isError;

  return (
    <AccountPageShell icon={History} subtitle={copy.history.subtitle} title={copy.history.title}>
      {isLoading ? <AccountLoading label={copy.common.loading} /> : null}
      {isError ? (
        <AccountError
          message={
            profileQuery.isError
              ? getApiErrorMessage(profileQuery.error, copy.errors.profile)
              : getApiErrorMessage(notificationsQuery.error, copy.errors.notifications)
          }
        />
      ) : null}
      {!isLoading && !isError && notifications.length === 0 && routes.length === 0 && routeActivities.length === 0 ? (
        <AccountEmptyState
          actionHref="/routes/create"
          actionLabel={copy.actions.createRoute}
          text={copy.history.emptyText}
          title={copy.history.emptyTitle}
        />
      ) : null}
      {!isLoading && !isError && (notifications.length > 0 || routes.length > 0 || routeActivities.length > 0) ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <AccountSection title={copy.common.activity}>
            {routeActivities.length > 0 || notifications.length > 0 ? (
              <div className="space-y-3">
                {routeActivities.slice(0, 6).map((activity) => (
                  <RouteActivityHistoryLink
                    activity={activity}
                    completedLabel={activityCopy.completed}
                    key={activity.id}
                    language={language}
                    startedLabel={activityCopy.started}
                  />
                ))}
                {notifications.slice(0, 8).map((notification) => {
                  const notificationContent = getLocalizedNotificationContent(
                    notification,
                    language,
                  );

                  return (
                    <article
                      className="rounded-lg border border-border bg-background p-4"
                      key={notification.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {notificationTypeLabel(notification, language)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatAccountDate(notification.created_at, language)}
                        </span>
                      </div>
                      <h2 className="mt-2 text-sm font-semibold">
                        {notificationContent.title}
                      </h2>
                      {notificationContent.body ? (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {notificationContent.body}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.history.emptyText}</p>
            )}
          </AccountSection>

          <AccountSection title={copy.history.routeSection}>
            {routes.length > 0 ? (
              <div className="space-y-3">
                {routes.slice(0, 5).map((route) => (
                  <HistoryRouteLink
                    key={route.id}
                    route={route}
                    title={routeDisplayTitle(route, dictionary, language)}
                  />
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {copy.savedRoutes.emptyText}
                </p>
                <Link className={buttonVariants({ className: "mt-4" })} href="/routes/create">
                  {copy.actions.createRoute}
                </Link>
              </div>
            )}
          </AccountSection>
        </div>
      ) : null}
    </AccountPageShell>
  );
}

function RouteActivityHistoryLink({
  activity,
  completedLabel,
  language,
  startedLabel,
}: {
  activity: RouteActivity;
  completedLabel: string;
  language: LanguageCode;
  startedLabel: string;
}) {
  const isCompleted = activity.status === "completed";
  const Icon = isCompleted ? BadgeCheck : Footprints;
  const label = isCompleted ? completedLabel : startedLabel;
  const date = activity.completed_at ?? activity.started_at ?? activity.updated_at;
  const routeContent = activity.route
    ? getLocalizedRouteContent(activity.route, language)
    : null;
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase text-muted-foreground">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm font-semibold">
          {routeContent?.title ?? label}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {formatAccountDate(date, language)}
        </span>
      </span>
    </>
  );

  if (!activity.route) {
    return (
      <article className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
        {body}
      </article>
    );
  }

  return (
    <Link
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:bg-muted"
      href={`/routes/${activity.route.id}`}
    >
      {body}
    </Link>
  );
}

function HistoryRouteLink({ route, title }: { route: CityRoute; title: string }) {
  return (
    <Link
      className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:bg-muted"
      href={`/routes/${route.id}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Route className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {route.duration_minutes ?? 0} min
        </span>
      </span>
    </Link>
  );
}
