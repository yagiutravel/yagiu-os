import { PageHeader } from "@/components/layout/PageHeader";
import { ImpostazioniView } from "@/components/impostazioni/ImpostazioniView";

export default function ImpostazioniPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Impostazioni"
        description="Configura workspace, profilo e preferenze dell'applicazione."
      />
      <ImpostazioniView />
    </div>
  );
}
