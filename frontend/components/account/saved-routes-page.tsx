"use client";

import { Star } from "lucide-react";

import {
  AccountEmptyState,
  AccountError,
  AccountLoading,
  AccountPageShell,
} from "@/components/account/account-page-shell";
import { RouteCard } from "@/components/route/route-card";
import { useProfile } from "@/hooks/api";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function SavedRoutesPage() {
  const { language } = useI18n();
  const copy = accountCopy[language];
  const profileQuery = useProfile();
  const routes = profileQuery.data?.saved_routes ?? [];

  return (
    <AccountPageShell
      icon={Star}
      subtitle={copy.savedRoutes.subtitle}
      title={copy.savedRoutes.title}
    >
      {profileQuery.isLoading ? <AccountLoading label={copy.common.loading} /> : null}
      {profileQuery.isError ? (
        <AccountError message={getApiErrorMessage(profileQuery.error, copy.errors.profile)} />
      ) : null}
      {!profileQuery.isLoading && !profileQuery.isError && routes.length === 0 ? (
        <AccountEmptyState
          actionHref="/routes/create"
          actionLabel={copy.actions.createRoute}
          text={copy.savedRoutes.emptyText}
          title={copy.savedRoutes.emptyTitle}
        />
      ) : null}
      {routes.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      ) : null}
    </AccountPageShell>
  );
}
