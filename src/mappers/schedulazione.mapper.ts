import {
  formatSchedulazioneDataOra,
  sortSchedulazioni,
} from "@/models/schedulazione";
import type {
  Schedulazione,
  SchedulazioneStato,
  SchedulazioneTipo,
  SchedulazioneView,
} from "@/types/schedulazione";
import type { SchedulazioneRow } from "@/types/database";

export function mapSchedulazioneToView(
  item: Schedulazione,
): SchedulazioneView {
  return {
    ...item,
    dataOraFormattata: formatSchedulazioneDataOra(item.data, item.ora),
  };
}

export function mapSchedulazioniToViews(
  items: Schedulazione[],
): SchedulazioneView[] {
  return sortSchedulazioni(items).map(mapSchedulazioneToView);
}

export function mapSchedulazioneRowToSchedulazione(
  row: SchedulazioneRow,
): Schedulazione {
  const ora =
    row.ora.length > 5 ? row.ora.slice(0, 5) : row.ora;

  return {
    id: row.id,
    titolo: row.titolo,
    clienteId: row.cliente_id,
    clienteNome: row.cliente_nome,
    tourId: row.tour_id,
    tourNome: row.tour_nome,
    tipo: row.tipo as SchedulazioneTipo,
    data: row.data,
    ora,
    stato: row.stato as SchedulazioneStato,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
