import type {
  Comunicazione,
  ComunicazioneClienteTimeline,
  ComunicazioneEventoTimeline,
  ComunicazioneEventoTipo,
  ComunicazioneStato,
  ComunicazioniStatoRiepilogo,
} from "@/types/comunicazione";

export const COMUNICAZIONE_EVENTI_ORDINE: ComunicazioneEventoTipo[] = [
  "conferma_prenotazione_inviata",
  "acconto_richiesto",
  "acconto_ricevuto",
  "saldo_richiesto",
  "saldo_ricevuto",
  "documenti_richiesti",
  "documenti_ricevuti",
  "reminder_partenza",
  "bentornato",
];

export const COMUNICAZIONE_EVENTO_LABELS: Record<ComunicazioneEventoTipo, string> = {
  conferma_prenotazione_inviata: "Conferma prenotazione inviata",
  acconto_richiesto: "Acconto richiesto",
  acconto_ricevuto: "Acconto ricevuto",
  saldo_richiesto: "Saldo richiesto",
  saldo_ricevuto: "Saldo ricevuto",
  documenti_richiesti: "Documenti richiesti",
  documenti_ricevuti: "Documenti ricevuti",
  reminder_partenza: "Reminder partenza",
  bentornato: "Bentornato",
};

export function createComunicazioneId(): string {
  return `comm-${crypto.randomUUID()}`;
}

export function createComunicazioneEventoId(): string {
  return `cevt-${crypto.randomUUID()}`;
}

export function createComunicazione(
  data: Omit<Comunicazione, "id" | "creatoIl" | "aggiornatoIl">,
): Comunicazione {
  const now = new Date().toISOString();

  return {
    id: createComunicazioneId(),
    ...data,
    creatoIl: now,
    aggiornatoIl: now,
  };
}

export function createComunicazioneEvento(
  data: Omit<ComunicazioneEventoTimeline, "id">,
): ComunicazioneEventoTimeline {
  return {
    id: createComunicazioneEventoId(),
    ...data,
  };
}

export function formatComunicazioneStatoLabel(stato: ComunicazioneStato): string {
  const labels: Record<ComunicazioneStato, string> = {
    in_coda: "In coda",
    inviata: "Inviata",
    consegnata: "Consegnata",
    letta: "Letta",
    fallita: "Fallita",
    programmata: "Programmata",
  };
  return labels[stato];
}

export function buildStatoRiepilogo(
  comunicazioni: Comunicazione[],
): ComunicazioniStatoRiepilogo {
  const riepilogo: ComunicazioniStatoRiepilogo = {
    inviate: 0,
    inCoda: 0,
    fallite: 0,
    programmate: 0,
    totale: comunicazioni.length,
  };

  for (const item of comunicazioni) {
    switch (item.stato) {
      case "inviata":
      case "consegnata":
      case "letta":
        riepilogo.inviate += 1;
        break;
      case "in_coda":
        riepilogo.inCoda += 1;
        break;
      case "fallita":
        riepilogo.fallite += 1;
        break;
      case "programmata":
        riepilogo.programmate += 1;
        break;
    }
  }

  return riepilogo;
}

export function buildClienteTimeline(
  clienteId: string,
  clienteNome: string,
  eventi: ComunicazioneEventoTimeline[],
): ComunicazioneClienteTimeline {
  const completati = eventi.filter((evento) => evento.completato).length;

  return {
    clienteId,
    clienteNome,
    eventi,
    completati,
    totali: eventi.length,
  };
}

export function formatComunicazioneData(isoDate: string | null): string {
  if (!isoDate) return "—";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
