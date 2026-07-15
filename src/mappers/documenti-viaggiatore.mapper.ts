import { CLIENTE_DOCUMENTO_TIPO_LABELS } from "@/models/cliente-documento";
import type { ClienteDocumentoView } from "@/types/cliente-documento";
import type {
  DocumentiViaggiatore,
  DocumentoTipo,
  DocumentoViaggiatore,
} from "@/types/documenti-viaggiatore";

const DOCUMENTO_TIPO_ORDER: DocumentoTipo[] = [
  "passaporto",
  "assicurazione",
  "visto",
  "liberatoria",
];

const CLIENTE_TO_VIAGGIATORE_TIPO: Partial<
  Record<ClienteDocumentoView["tipo"], DocumentoTipo>
> = {
  passaporto: "passaporto",
  assicurazione: "assicurazione",
  visto: "visto",
};

export function mapClienteDocumentoToDocumentoViaggiatore(
  documento: ClienteDocumentoView,
): DocumentoViaggiatore | null {
  const tipo = CLIENTE_TO_VIAGGIATORE_TIPO[documento.tipo];
  if (!tipo) return null;

  const label = CLIENTE_DOCUMENTO_TIPO_LABELS[documento.tipo];

  return {
    id: documento.id,
    tipo,
    nome: documento.numero ? `${label} · ${documento.numero}` : label,
    stato: documento.stato,
    dataScadenza: documento.scadenza,
  };
}

export function mapClienteDocumentiToDocumentiViaggiatore(
  documenti: ClienteDocumentoView[],
): DocumentiViaggiatore {
  const mapped = documenti
    .map(mapClienteDocumentoToDocumentoViaggiatore)
    .filter((item): item is DocumentoViaggiatore => item !== null);

  const byTipo = new Map(mapped.map((item) => [item.tipo, item]));

  return {
    documenti: DOCUMENTO_TIPO_ORDER.map((tipo) => byTipo.get(tipo) ?? null).filter(
      (item): item is DocumentoViaggiatore => item !== null,
    ),
  };
}
