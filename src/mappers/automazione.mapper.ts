import {
  AUTOMAZIONE_AZIONE_LABELS,
  AUTOMAZIONE_TRIGGER_LABELS,
} from "@/lib/automazione/constants";
import {
  formatAutomazioneUltimaEsecuzione,
  sortAutomazioni,
} from "@/models/automazione";
import type {
  Automazione,
  AutomazioneAzione,
  AutomazioneStato,
  AutomazioneTrigger,
  AutomazioneView,
} from "@/types/automazione";
import type { AutomazioneRow } from "@/types/database";

export function mapAutomazioneToView(item: Automazione): AutomazioneView {
  return {
    ...item,
    triggerLabel: AUTOMAZIONE_TRIGGER_LABELS[item.trigger],
    azioneLabel: AUTOMAZIONE_AZIONE_LABELS[item.azione],
    ultimaEsecuzioneFormattata: formatAutomazioneUltimaEsecuzione(
      item.ultimaEsecuzione,
    ),
  };
}

export function mapAutomazioniToViews(
  items: Automazione[],
): AutomazioneView[] {
  return sortAutomazioni(items).map(mapAutomazioneToView);
}

export function mapAutomazioneRowToAutomazione(
  row: AutomazioneRow,
): Automazione {
  return {
    id: row.id,
    nome: row.nome,
    trigger: row.trigger as AutomazioneTrigger,
    azione: row.azione as AutomazioneAzione,
    stato: row.stato as AutomazioneStato,
    ultimaEsecuzione: row.ultima_esecuzione,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}
