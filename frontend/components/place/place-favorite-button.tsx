"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useFavoritePlace,
  useFavoritePlaces,
  useUnfavoritePlace,
} from "@/hooks/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { useI18n } from "@/lib/i18n/i18n-provider";

interface PlaceFavoriteButtonProps {
  placeId: number;
}

export function PlaceFavoriteButton({ placeId }: PlaceFavoriteButtonProps) {
  const { dictionary } = useI18n();
  const auth = useAuth();
  const favoritePlacesQuery = useFavoritePlaces();
  const favoritePlace = useFavoritePlace();
  const unfavoritePlace = useUnfavoritePlace();
  const isFavorite =
    favoritePlacesQuery.data?.some((place) => place.id === placeId) ?? false;
  const canToggle = auth.isHydrated && auth.isAuthenticated;
  const isPending = favoritePlace.isPending || unfavoritePlace.isPending;
  const label = !canToggle
    ? dictionary.places.actions.favoriteLocked
    : isFavorite
      ? dictionary.places.actions.removeFavorite
      : dictionary.places.actions.favorite;

  return (
    <Button
      aria-pressed={canToggle ? isFavorite : undefined}
      aria-label={label}
      disabled={!canToggle || isPending}
      onClick={() => {
        if (!canToggle || isPending) {
          return;
        }

        if (isFavorite) {
          unfavoritePlace.mutate(placeId);
        } else {
          favoritePlace.mutate(placeId);
        }
      }}
      size="icon-lg"
      title={label}
      type="button"
      variant="outline"
    >
      <Heart
        className={isFavorite ? "size-4 fill-primary text-primary" : "size-4"}
        aria-hidden="true"
      />
    </Button>
  );
}
