import { PageHeader } from "@/components/layout/PageHeader";
import { AutomazioniView } from "@/components/automazioni/AutomazioniView";

export default function AutomazioniPage() {
  return (
    <>
      <PageHeader
        title="Automazioni"
        description="Workflow automatici con trigger e azioni configurabili."
      />
      <AutomazioniView />
    </>
  );
}
