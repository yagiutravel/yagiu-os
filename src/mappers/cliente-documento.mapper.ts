import {
  calcolaStatoDocumento,
  CLIENTE_DOCUMENTO_TIPI,
} from "@/models/cliente-documento";
import type { ClienteDocumentoRow } from "@/types/database";
import type {
  ClienteDocumento,
  ClienteDocumentiData,
  ClienteDocumentoView,
} from "@/types/cliente-documento";

export function mapDocumentoToView(
  documento: ClienteDocumento,
  now = new Date(),
): ClienteDocumentoView {
  return {
    ...documento,
    stato: calcolaStatoDocumento(documento.scadenza, now),
  };
}

export function mapDocumentiToViews(
  documenti: ClienteDocumento[],
  now = new Date(),
): ClienteDocumentoView[] {
  const byTipo = new Map(
    documenti.map((item) => [item.tipo, mapDocumentoToView(item, now)]),
  );

  return CLIENTE_DOCUMENTO_TIPI.map(
    (tipo) => byTipo.get(tipo) ?? null,
  ).filter((item): item is ClienteDocumentoView => item !== null);
}

export function mapClienteDocumentiData(
  documenti: ClienteDocumento[],
  now = new Date(),
): ClienteDocumentiData {
  return {
    documenti: mapDocumentiToViews(documenti, now),
  };
}

/** Mapper Supabase cliente_documenti. */
export function mapClienteDocumentoRowToDocumento(
  row: ClienteDocumentoRow,
): ClienteDocumento {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    tipo: row.tipo as ClienteDocumento["tipo"],
    numero: row.numero,
    scadenza: row.scadenza,
    allegatoNome: row.allegato_nome,
    allegatoUrl: row.allegato_url,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
