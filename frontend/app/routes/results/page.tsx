import { AppShell } from "@/components/layout/app-shell";
import { RouteResultsPage } from "@/components/route/route-results-page";

interface ResultsPageProps {
  searchParams: Promise<{
    route?: string;
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const routeId = Number(params.route);

  return (
    <AppShell>
      <RouteResultsPage routeId={Number.isFinite(routeId) ? routeId : null} />
    </AppShell>
  );
}
