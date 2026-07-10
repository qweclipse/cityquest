import { AppShell } from "@/components/layout/app-shell";
import { PlannedFeaturePage } from "@/components/roadmap/planned-feature-page";

export default function EventsRoutePage() {
  return (
    <AppShell>
      <PlannedFeaturePage feature="events" />
    </AppShell>
  );
}
