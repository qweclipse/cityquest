import { AppShell } from "@/components/layout/app-shell";
import { PlacesPage } from "@/components/place/places-page";

export default function NewestPlacesRoutePage() {
  return (
    <AppShell>
      <PlacesPage categoryId={null} search="" status="user_added" />
    </AppShell>
  );
}
