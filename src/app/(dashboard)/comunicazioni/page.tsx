import { PageHeader } from "@/components/layout/PageHeader";
import { ComunicazioniShell } from "@/components/comunicazioni/ComunicazioniShell";

export default function ComunicazioniPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Comunicazioni"
        description="Centro comunicazioni, template email e gestione messaggi."
      />
      <ComunicazioniShell />
    </div>
  );
}
