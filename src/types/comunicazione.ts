export type ComunicazioneCanale = "email" | "whatsapp" | "reminder" | "sistema";

export type ComunicazioneEventoTipo =
  | "conferma_prenotazione_inviata"
  | "acconto_richiesto"
  | "acconto_ricevuto"
  | "saldo_richiesto"
  | "saldo_ricevuto"
  | "documenti_richiesti"
  | "documenti_ricevuti"
  | "reminder_partenza"
  | "bentornato";

export type ComunicazioneStato =
  | "in_coda"
  | "inviata"
  | "consegnata"
  | "letta"
  | "fallita"
  | "programmata";

/** Record comunicazione — pronto per tabella Supabase `comunicazioni`. */
export type Comunicazione = {
  id: string;
  clienteId: string;
  canale: ComunicazioneCanale;
  tipo: ComunicazioneEventoTipo;
  stato: ComunicazioneStato;
  oggetto: string;
  anteprima: string;
  programmataIl: string | null;
  inviataIl: string | null;
  creatoIl: string;
  aggiornatoIl: string;
};

export type ComunicazioneView = Comunicazione & {
  clienteNome: string;
};

export type ComunicazioneEventoTimeline = {
  id: string;
  clienteId: string;
  tipo: ComunicazioneEventoTipo;
  titolo: string;
  descrizione: string;
  completato: boolean;
  data: string | null;
};

export type ComunicazioneClienteTimeline = {
  clienteId: string;
  clienteNome: string;
  eventi: ComunicazioneEventoTimeline[];
  completati: number;
  totali: number;
};

export type ComunicazioniStatoRiepilogo = {
  inviate: number;
  inCoda: number;
  fallite: number;
  programmate: number;
  totale: number;
};

export type ComunicazioniDashboardData = {
  emailDaInviare: ComunicazioneView[];
  reminderAutomatici: ComunicazioneView[];
  messaggiWhatsApp: ComunicazioneView[];
  statoComunicazioni: ComunicazioniStatoRiepilogo;
  timelineClienti: ComunicazioneClienteTimeline[];
};

/** Shape prevista per Supabase — non collegata ancora. */
export type ComunicazioneRow = {
  id: string;
  cliente_id: string;
  canale: ComunicazioneCanale;
  tipo: ComunicazioneEventoTipo;
  stato: ComunicazioneStato;
  oggetto: string;
  anteprima: string;
  programmata_il: string | null;
  inviata_il: string | null;
  creato_il: string;
  aggiornato_il: string;
};

/** Evento milestone timeline — pronto per tabella Supabase `comunicazione_eventi`. */
export type ComunicazioneEventoRow = {
  id: string;
  cliente_id: string;
  tipo: ComunicazioneEventoTipo;
  titolo: string;
  descrizione: string;
  completato: boolean;
  data: string | null;
  creato_il: string;
  aggiornato_il: string;
};
