import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarioView } from "@/components/calendario/CalendarioView";

export default function CalendarioPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Calendario"
        description="Visualizza partenze, ritorni e tour programmati per mese."
      />
      <CalendarioView />
    </div>
  );
}
