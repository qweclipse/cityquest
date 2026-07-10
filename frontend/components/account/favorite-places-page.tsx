"use client";

import { Heart } from "lucide-react";

import {
  AccountEmptyState,
  AccountError,
  AccountLoading,
  AccountPageShell,
} from "@/components/account/account-page-shell";
import { PlaceCard } from "@/components/place/place-card";
import { useProfile } from "@/hooks/api";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function FavoritePlacesPage() {
  const { language } = useI18n();
  const copy = accountCopy[language];
  const profileQuery = useProfile();
  const places = profileQuery.data?.favorite_places ?? [];

  return (
    <AccountPageShell
      icon={Heart}
      subtitle={copy.favorites.subtitle}
      title={copy.favorites.title}
    >
      {profileQuery.isLoading ? <AccountLoading label={copy.common.loading} /> : null}
      {profileQuery.isError ? (
        <AccountError message={getApiErrorMessage(profileQuery.error, copy.errors.profile)} />
      ) : null}
      {!profileQuery.isLoading && !profileQuery.isError && places.length === 0 ? (
        <AccountEmptyState
          actionHref="/places"
          actionLabel={copy.actions.explorePlaces}
          text={copy.favorites.emptyText}
          title={copy.favorites.emptyTitle}
        />
      ) : null}
      {places.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : null}
    </AccountPageShell>
  );
}
