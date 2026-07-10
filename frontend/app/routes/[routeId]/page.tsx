import { AppShell } from "@/components/layout/app-shell";
import { RouteDetailPage } from "@/components/route/route-detail-page";

interface RouteDetailsPageProps {
  params: Promise<{
    routeId: string;
  }>;
}

export default async function RouteDetailsPage({ params }: RouteDetailsPageProps) {
  const routeId = Number((await params).routeId);

  return (
    <AppShell>
      <RouteDetailPage routeId={Number.isFinite(routeId) ? routeId : null} />
    </AppShell>
  );
}
