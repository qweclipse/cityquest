import { AppShell } from "@/components/layout/app-shell";
import {
  RouteCreatePage,
  type RouteCreateInitialPreset,
} from "@/components/route/route-create-page";
import type { BudgetMode, PlaceMode } from "@/lib/api/types";

interface CreateRoutePageProps {
  searchParams: Promise<{
    budget?: string;
    category?: string;
    duration?: string;
    mode?: string;
    type?: string;
    vibe?: string;
  }>;
}

const routeTypes = new Set(["walk", "date", "friends", "family", "culture", "cafe"]);
const vibes = new Set(["balanced", "calm", "romantic", "fun", "culture", "nature"]);
const budgets = new Set<BudgetMode>(["any", "free", "low", "medium"]);
const placeModes = new Set<PlaceMode>(["verified_only", "include_community"]);

export default async function CreateRoutePage({ searchParams }: CreateRoutePageProps) {
  const params = await searchParams;

  return (
    <AppShell>
      <RouteCreatePage initialPreset={parseInitialPreset(params)} />
    </AppShell>
  );
}

function parseInitialPreset(params: Awaited<CreateRoutePageProps["searchParams"]>): RouteCreateInitialPreset {
  const durationMinutes = parseDuration(params.duration);
  const routeType = parseSetValue(params.type, routeTypes);
  const vibe = parseSetValue(params.vibe, vibes);
  const budgetMode = parseSetValue(params.budget, budgets);
  const placeMode = parseSetValue(params.mode, placeModes);
  const categorySlugs = parseCategorySlugs(params.category);

  return {
    ...(budgetMode ? { budgetMode } : {}),
    ...(categorySlugs.length > 0 ? { categorySlugs } : {}),
    ...(durationMinutes ? { durationMinutes } : {}),
    ...(placeMode ? { placeMode } : {}),
    ...(routeType ? { routeType } : {}),
    ...(vibe ? { vibe } : {}),
  };
}

function parseDuration(value: string | undefined): number | undefined {
  const duration = Number(value);

  if (!Number.isFinite(duration)) {
    return undefined;
  }

  const roundedToStep = Math.round(duration / 30) * 30;

  return Math.min(480, Math.max(60, roundedToStep));
}

function parseSetValue<T extends string>(
  value: string | undefined,
  allowedValues: ReadonlySet<T>,
): T | undefined {
  return value && allowedValues.has(value as T) ? (value as T) : undefined;
}

function parseCategorySlugs(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => /^[a-z0-9-]+$/.test(slug))
    .slice(0, 8);
}
