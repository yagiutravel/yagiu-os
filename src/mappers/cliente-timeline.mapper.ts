import { sortTimelineEventi } from "@/models/cliente-timeline";
import type {
  ClienteTimelineEvento,
  ClienteTimelineEventoRow,
  ClienteTimelineData,
} from "@/types/cliente-timeline";

export function mapClienteTimelineEventoRowToEvento(
  row: ClienteTimelineEventoRow,
): ClienteTimelineEvento {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    tipo: row.tipo,
    titolo: row.titolo,
    descrizione: row.descrizione,
    data: row.data,
    utente: row.utente,
    creatoIl: row.creato_il,
  };
}

export function mapClienteTimelineToData(
  eventi: ClienteTimelineEvento[],
): ClienteTimelineData {
  return {
    eventi: sortTimelineEventi(eventi),
  };
}
