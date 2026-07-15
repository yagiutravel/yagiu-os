import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InfoGrid } from "@/components/ui/InfoGrid";
import type { ProfiloViaggiatore } from "@/types/profilo-viaggiatore";
import { profiloSectionStack } from "@/lib/clienti/profilo-ui";
import { ProfiloViaggiatoreRelazioni } from "./ProfiloViaggiatoreRelazioni";
import { ProfiloViaggiatorePreferenze } from "./ProfiloViaggiatorePreferenze";
import { ProfiloViaggiatoreDocumenti } from "./ProfiloViaggiatoreDocumenti";
import { ProfiloViaggiatoreTourEffettuati } from "./ProfiloViaggiatoreTourEffettuati";

type ProfiloViaggiatorePanoramicaProps = {
  profilo: ProfiloViaggiatore;
};

export function ProfiloViaggiatorePanoramica({
  profilo,
}: ProfiloViaggiatorePanoramicaProps) {
  const { profilo: anagrafica, esperienzaYagiu } = profilo;

  return (
    <div className={profiloSectionStack}>
      <Card>
        <CardHeader
          title="Profilo Viaggiatore"
          description="Contatti e dati anagrafici del viaggiatore."
        />
        <CardContent>
          <InfoGrid
            columns={3}
            fields={[
              { label: "Email", value: anagrafica.email },
              { label: "Telefono", value: anagrafica.telefono },
              { label: "WhatsApp", value: anagrafica.whatsapp },
              { label: "Nazionalità", value: anagrafica.nazionalita },
              { label: "Data di nascita", value: anagrafica.dataNascita },
              { label: "Città / Paese", value: anagrafica.cittaPaese },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Esperienza Yagiu"
          description="Relazione con Yagiu e viaggi effettuati."
        />
        <CardContent>
          <InfoGrid
            columns={3}
            fields={[
              {
                label: "Tour Leader assegnato",
                value: esperienzaYagiu.tourLeaderAssegnato,
              },
              { label: "Guida locale", value: esperienzaYagiu.guidaLocale },
              { label: "Viaggio attuale", value: esperienzaYagiu.viaggioAttuale },
              {
                label: "Numero viaggi effettuati",
                value: esperienzaYagiu.numeroViaggiEffettuati,
              },
              {
                label: "Cliente abituale",
                value: esperienzaYagiu.clienteAbituale ? "" : "—",
                badge: esperienzaYagiu.clienteAbituale ? (
                  <Badge variant="success">Cliente abituale</Badge>
                ) : undefined,
              },
            ]}
          />
        </CardContent>
      </Card>

      <ProfiloViaggiatoreRelazioni clienteId={profilo.id} />

      <ProfiloViaggiatoreTourEffettuati clienteId={profilo.id} />

      <ProfiloViaggiatorePreferenze clienteId={profilo.id} />

      <ProfiloViaggiatoreDocumenti clienteId={profilo.id} />
    </div>
  );
}
