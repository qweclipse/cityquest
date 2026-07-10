import { AppShell } from "@/components/layout/app-shell";
import { PlannedFeaturePage } from "@/components/roadmap/planned-feature-page";

export default function DealsRoutePage() {
  return (
    <AppShell>
      <PlannedFeaturePage feature="deals" />
    </AppShell>
  );
}
