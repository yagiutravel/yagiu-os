import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { InfoGrid } from "@/components/ui/InfoGrid";
import { formatQuestionarioValue } from "@/models/cliente-questionario";
import { profiloSectionLabel } from "@/lib/clienti/profilo-ui";
import type { ClienteQuestionarioView } from "@/types/cliente-questionario";
import { ClienteQuestionarioFlagBadge } from "./ClienteQuestionarioFlagBadge";

type ClienteQuestionarioContentProps = {
  questionario: ClienteQuestionarioView;
};

export function ClienteQuestionarioContent({
  questionario,
}: ClienteQuestionarioContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Salute e alimentazione"
          description="Allergie, intolleranze, farmaci e preferenze alimentari."
        />
        <CardContent className="space-y-6">
          <InfoGrid
            columns={2}
            fields={[
              {
                label: "Allergie",
                value: formatQuestionarioValue(questionario.allergie),
              },
              {
                label: "Intolleranze",
                value: formatQuestionarioValue(questionario.intolleranze),
              },
              {
                label: "Farmaci",
                value: formatQuestionarioValue(questionario.farmaci),
              },
              {
                label: "Note alimentari",
                value: formatQuestionarioValue(questionario.noteAlimentari),
              },
            ]}
          />

          <div>
            <p className={profiloSectionLabel}>Preferenze alimentari</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ClienteQuestionarioFlagBadge
                label="Vegetariano"
                active={questionario.vegetariano}
              />
              <ClienteQuestionarioFlagBadge
                label="Vegano"
                active={questionario.vegano}
              />
              <ClienteQuestionarioFlagBadge
                label="Celiaco"
                active={questionario.celiaco}
              />
              <ClienteQuestionarioFlagBadge
                label="Fumatore"
                active={questionario.fumatore}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Contatto di emergenza"
          description="Referente da contattare in caso di necessità."
        />
        <CardContent>
          <InfoGrid
            columns={2}
            fields={[
              {
                label: "Contatto emergenza",
                value: formatQuestionarioValue(questionario.contattoEmergenza),
              },
              {
                label: "Numero emergenza",
                value: formatQuestionarioValue(questionario.numeroEmergenza),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Logistica e abbigliamento"
          description="Taglie, preferenze camera e richieste di compagnia."
        />
        <CardContent>
          <InfoGrid
            columns={2}
            fields={[
              {
                label: "Taglia maglietta",
                value: formatQuestionarioValue(questionario.tagliaMaglietta),
              },
              {
                label: "Taglia felpa",
                value: formatQuestionarioValue(questionario.tagliaFelpa),
              },
              {
                label: "Camera preferita",
                value: formatQuestionarioValue(questionario.cameraPreferita),
              },
              {
                label: "Compagno richiesto",
                value: formatQuestionarioValue(questionario.compagnoRichiesto),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
