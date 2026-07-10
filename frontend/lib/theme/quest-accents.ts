import type { Category, CityRoute } from "@/lib/api/types";

export type QuestAccentName =
  | "copper"
  | "gold"
  | "plum"
  | "rose"
  | "sage"
  | "sky"
  | "teal";

const defaultAccent: QuestAccentName = "copper";

const categoryAccentBySlug: Record<string, QuestAccentName> = {
  architecture: "gold",
  cafes: "copper",
  culture: "gold",
  family: "sky",
  food: "copper",
  "free-places": "sage",
  "hidden-places": "teal",
  history: "gold",
  museums: "gold",
  parks: "sage",
  "photo-spots": "teal",
  romance: "plum",
};

const routeTypeAccentBySlug: Record<string, QuestAccentName> = {
  budget: "sage",
  cafe: "copper",
  cafe_walk: "copper",
  culture: "gold",
  date: "plum",
  family: "sky",
  friends: "teal",
  photo: "teal",
  walk: "copper",
};

const vibeAccentBySlug: Record<string, QuestAccentName> = {
  balanced: "copper",
  calm: "sage",
  classic: "gold",
  creative: "plum",
  culture: "gold",
  easy: "sage",
  fun: "teal",
  history: "gold",
  inspiring: "rose",
  local: "teal",
  nature: "sage",
  romantic: "plum",
};

export const questAccentBadgeClassName =
  "border border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]";

export const questAccentPanelClassName =
  "border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)]";

export const questAccentIconClassName =
  "bg-[var(--quest-accent-soft)] text-[var(--quest-accent)]";

export const questAccentButtonClassName =
  "bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)] shadow-[0_12px_26px_var(--quest-accent-shadow)] hover:bg-[color-mix(in_oklch,var(--quest-accent),var(--foreground)_8%)]";

export function questAccentClass(accent: QuestAccentName): string {
  return `quest-accent-${accent}`;
}

export function categoryAccentName(
  category: Pick<Category, "slug"> | null | undefined,
): QuestAccentName {
  return categoryAccentBySlug[category?.slug ?? ""] ?? defaultAccent;
}

export function categoryAccentClass(
  category: Pick<Category, "slug"> | null | undefined,
): string {
  return questAccentClass(categoryAccentName(category));
}

export function routeTypeAccentName(routeType: string | null | undefined): QuestAccentName {
  return routeTypeAccentBySlug[routeType ?? ""] ?? defaultAccent;
}

export function routeAccentName(
  route: Pick<CityRoute, "route_type" | "vibe">,
): QuestAccentName {
  return (
    routeTypeAccentBySlug[route.route_type ?? ""] ??
    vibeAccentBySlug[route.vibe ?? ""] ??
    defaultAccent
  );
}

export function routeAccentClass(route: Pick<CityRoute, "route_type" | "vibe">): string {
  return questAccentClass(routeAccentName(route));
}
