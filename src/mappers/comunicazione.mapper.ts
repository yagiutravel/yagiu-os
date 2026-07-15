import type {
  Comunicazione,
  ComunicazioneClienteTimeline,
  ComunicazioneCanale,
  ComunicazioneEventoTimeline,
  ComunicazioneEventoTipo,
  ComunicazioneStato,
  ComunicazioneView,
  ComunicazioniDashboardData,
} from "@/types/comunicazione";
import type {
  ComunicazioneEventoRow,
  ComunicazioneRow,
} from "@/types/database";
import {
  buildClienteTimeline,
  buildStatoRiepilogo,
  COMUNICAZIONE_EVENTI_ORDINE,
} from "@/models/comunicazione";

export function mapComunicazioneToView(
  comunicazione: Comunicazione,
  clienteNome: string,
): ComunicazioneView {
  return {
    ...comunicazione,
    clienteNome,
  };
}

export function mapComunicazioniDashboardData(input: {
  comunicazioni: Comunicazione[];
  eventi: ComunicazioneEventoTimeline[];
  clientiMap: Map<string, string>;
}): ComunicazioniDashboardData {
  const { comunicazioni, eventi, clientiMap } = input;

  const withNome = comunicazioni.map((item) =>
    mapComunicazioneToView(
      item,
      clientiMap.get(item.clienteId) ?? "Cliente sconosciuto",
    ),
  );

  const emailDaInviare = withNome.filter(
    (item) => item.canale === "email" && item.stato === "in_coda",
  );
  const reminderAutomatici = withNome.filter(
    (item) => item.canale === "reminder",
  );
  const messaggiWhatsApp = withNome.filter(
    (item) => item.canale === "whatsapp",
  );

  const clienteIds = [...new Set(eventi.map((evento) => evento.clienteId))];
  const timelineClienti: ComunicazioneClienteTimeline[] = clienteIds.map(
    (clienteId) => {
      const clienteEventi = eventi
        .filter((evento) => evento.clienteId === clienteId)
        .sort(
          (a, b) =>
            COMUNICAZIONE_EVENTI_ORDINE.indexOf(a.tipo) -
            COMUNICAZIONE_EVENTI_ORDINE.indexOf(b.tipo),
        );

      return buildClienteTimeline(
        clienteId,
        clientiMap.get(clienteId) ?? "Cliente sconosciuto",
        clienteEventi,
      );
    },
  );

  timelineClienti.sort((a, b) => b.completati - a.completati);

  return {
    emailDaInviare,
    reminderAutomatici,
    messaggiWhatsApp,
    statoComunicazioni: buildStatoRiepilogo(comunicazioni),
    timelineClienti,
  };
}

/** Mapper Supabase — pronto per integrazione futura. */
export function mapComunicazioneRowToComunicazione(
  row: ComunicazioneRow,
): Comunicazione {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    canale: row.canale as ComunicazioneCanale,
    tipo: row.tipo as ComunicazioneEventoTipo,
    stato: row.stato as ComunicazioneStato,
    oggetto: row.oggetto,
    anteprima: row.anteprima,
    programmataIl: row.programmata_il,
    inviataIl: row.inviata_il,
    creatoIl: row.creato_il,
    aggiornatoIl: row.aggiornato_il,
  };
}

export function mapComunicazioneEventoRowToEvento(
  row: ComunicazioneEventoRow,
): ComunicazioneEventoTimeline {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    tipo: row.tipo as ComunicazioneEventoTipo,
    titolo: row.titolo,
    descrizione: row.descrizione,
    completato: row.completato,
    data: row.data,
  };
}
