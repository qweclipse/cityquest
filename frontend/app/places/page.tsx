import { AppShell } from "@/components/layout/app-shell";
import { PlacesPage } from "@/components/place/places-page";
import {
  parsePlaceCategoryId,
  parsePlaceSearch,
  parsePlaceVerificationFilter,
} from "@/lib/places/place-filters";

interface PlacesRoutePageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    status?: string;
  }>;
}

export default async function PlacesRoutePage({ searchParams }: PlacesRoutePageProps) {
  const params = await searchParams;

  return (
    <AppShell>
      <PlacesPage
        categoryId={parsePlaceCategoryId(params.category)}
        search={parsePlaceSearch(params.q)}
        status={parsePlaceVerificationFilter(params.status)}
      />
    </AppShell>
  );
}
