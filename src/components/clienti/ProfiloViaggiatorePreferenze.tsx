import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InfoGrid } from "@/components/ui/InfoGrid";
import { getPreferenzeViaggiatorePlaceholder } from "@/lib/clienti/preferenze-viaggiatore.data";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import { TipologiaViaggioBadge } from "./TipologiaViaggioBadge";

export function ProfiloViaggiatorePreferenze() {
  const preferenze = getPreferenzeViaggiatorePlaceholder();

  return (
    <Card>
      <CardHeader
        title="Preferenze"
        description="Tipologie di viaggio preferite ed esigenze personali."
      />
      <CardContent className="space-y-6">
        <div>
          <p className={profiloSectionLabel}>Tipologia viaggio preferita</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preferenze.tipologieViaggio.map((tipologia) => (
              <TipologiaViaggioBadge key={tipologia} tipologia={tipologia} />
            ))}
          </div>
        </div>

        <InfoGrid
          columns={2}
          fields={[
            { label: "Lingue", value: preferenze.lingue },
            { label: "Allergie", value: preferenze.allergie },
            { label: "Dieta", value: preferenze.dieta },
            { label: "Livello trekking", value: preferenze.livelloTrekking },
          ]}
        />
      </CardContent>
    </Card>
  );
}
