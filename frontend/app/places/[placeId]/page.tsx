import { AppShell } from "@/components/layout/app-shell";
import { PlaceDetailPage } from "@/components/place/place-detail-page";

interface PlaceDetailsPageProps {
  params: Promise<{
    placeId: string;
  }>;
}

export default async function PlaceDetailsPage({ params }: PlaceDetailsPageProps) {
  const placeId = Number((await params).placeId);

  return (
    <AppShell>
      <PlaceDetailPage placeId={Number.isFinite(placeId) ? placeId : null} />
    </AppShell>
  );
}
