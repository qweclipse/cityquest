import { AppShell } from "@/components/layout/app-shell";
import { CollectionsPage } from "@/components/collections/collections-page";
import {
  parseCollectionRouteType,
  parseCollectionTab,
} from "@/lib/routes/collection-filters";

interface CollectionsRoutePageProps {
  searchParams: Promise<{
    tab?: string;
    type?: string;
  }>;
}

export default async function CollectionsRoutePage({
  searchParams,
}: CollectionsRoutePageProps) {
  const params = await searchParams;

  return (
    <AppShell>
      <CollectionsPage
        routeType={parseCollectionRouteType(params.type)}
        tab={parseCollectionTab(params.tab)}
      />
    </AppShell>
  );
}
