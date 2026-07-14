import { PageHeader } from "@/components/layout/PageHeader";
import { ProgrammazioneView } from "@/components/programmazione/ProgrammazioneView";

export default function ProgrammazionePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Programmazione"
        description="Scheduler per email, WhatsApp e reminder automatici."
      />
      <ProgrammazioneView />
    </div>
  );
}
