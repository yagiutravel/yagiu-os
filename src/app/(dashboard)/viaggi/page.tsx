import { PageHeader } from "@/components/layout/PageHeader";
import { ViaggiView } from "@/components/viaggi/ViaggiView";

export default function ViaggiPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Viaggi"
        description="Pianifica e monitora tour in corso e prossime partenze."
      />
      <ViaggiView />
    </div>
  );
}
