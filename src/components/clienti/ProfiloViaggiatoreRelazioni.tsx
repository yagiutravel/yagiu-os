import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getRelazioniViaggiatorePlaceholder } from "@/lib/clienti/relazioni-viaggiatore.data";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import type { RelazionePersona } from "@/types/relazioni-viaggiatore";
import { PersonaRelazioneItem } from "./PersonaRelazioneItem";

type ProfiloViaggiatoreRelazioniProps = {
  clienteId: string;
};

type RelazioneRuoloProps = {
  label: string;
  persona: RelazionePersona;
};

function RelazioneRuolo({ label, persona }: RelazioneRuoloProps) {
  return (
    <div className="flex h-full flex-col">
      <p className={`mb-2.5 ${profiloSectionLabel}`}>{label}</p>
      <PersonaRelazioneItem persona={persona} />
    </div>
  );
}

export function ProfiloViaggiatoreRelazioni({
  clienteId,
}: ProfiloViaggiatoreRelazioniProps) {
  const relazioni = getRelazioniViaggiatorePlaceholder(clienteId);

  return (
    <Card>
      <CardHeader
        title="Relazioni"
        description="Persone collegate al viaggiatore durante i tour Yagiu."
      />
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RelazioneRuolo label="Tour Leader" persona={relazioni.tourLeader} />
          <RelazioneRuolo label="Guida Locale" persona={relazioni.guidaLocale} />
          <RelazioneRuolo label="Driver" persona={relazioni.driver} />
          <RelazioneRuolo
            label="Compagno di camera"
            persona={relazioni.compagnoCamera}
          />
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-6">
          <p className={`mb-4 ${profiloSectionLabel}`}>Ha viaggiato con</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relazioni.haViaggiatoCon.map((persona) => (
              <PersonaRelazioneItem key={persona.id} persona={persona} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
