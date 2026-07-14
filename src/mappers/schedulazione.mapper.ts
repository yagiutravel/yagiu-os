import {
  formatSchedulazioneDataOra,
  sortSchedulazioni,
} from "@/models/schedulazione";
import type {
  Schedulazione,
  SchedulazioneRow,
  SchedulazioneView,
} from "@/types/schedulazione";

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
  return {
    id: row.id,
    titolo: row.titolo,
    clienteId: row.cliente_id,
    clienteNome: row.cliente_nome,
    tourId: row.tour_id,
    tourNome: row.tour_nome,
    tipo: row.tipo,
    data: row.data,
    ora: row.ora,
    stato: row.stato,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
