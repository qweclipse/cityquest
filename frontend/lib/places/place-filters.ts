import type { VerificationStatus } from "@/lib/api/types";

export type PlaceVerificationFilter = "all" | Extract<
  VerificationStatus,
  "community_confirmed" | "user_added" | "verified"
>;

export const placeVerificationFilters: PlaceVerificationFilter[] = [
  "all",
  "verified",
  "community_confirmed",
  "user_added",
];

export function parsePlaceCategoryId(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const categoryId = Number(value);

  return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null;
}

export function parsePlaceSearch(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 120);
}

export function parsePlaceVerificationFilter(
  value: string | undefined,
): PlaceVerificationFilter {
  return placeVerificationFilters.includes(value as PlaceVerificationFilter)
    ? (value as PlaceVerificationFilter)
    : "all";
}

export function placeVerificationParam(
  filter: PlaceVerificationFilter,
): VerificationStatus | undefined {
  return filter === "all" ? undefined : filter;
}
