import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { getDocumentiViaggiatorePlaceholder } from "@/lib/clienti/documenti-viaggiatore.data";
import { DocumentoItem } from "./DocumentoItem";

type ProfiloViaggiatoreDocumentiProps = {
  clienteId: string;
};

export function ProfiloViaggiatoreDocumenti({
  clienteId,
}: ProfiloViaggiatoreDocumentiProps) {
  const { documenti } = getDocumentiViaggiatorePlaceholder(clienteId);

  return (
    <Card>
      <CardHeader
        title="Documenti"
        description="Documenti di viaggio, identità e assicurazione del viaggiatore."
      />
      <CardContent>
        <div className="space-y-3">
          {documenti.map((documento) => (
            <DocumentoItem key={documento.id} documento={documento} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
