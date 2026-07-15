export type ClienteTimelineEventoTipo =
  | "cliente_creato"
  | "iscritto_tour"
  | "pagamento"
  | "documento_caricato"
  | "camera_assegnata"
  | "email_inviata"
  | "whatsapp_inviato"
  | "checklist_completata"
  | "tour_concluso"
  | "preventivo_creato"
  | "preventivo_inviato"
  | "preventivo_accettato"
  | "preventivo_convertito";

/** Record evento timeline — pronto per tabella Supabase `cliente_timeline_eventi`. */
export type ClienteTimelineEvento = {
  id: string;
  clienteId: string;
  tipo: ClienteTimelineEventoTipo;
  titolo: string;
  descrizione: string;
  data: string;
  utente: string;
  creatoIl: string;
};

export type ClienteTimelineData = {
  eventi: ClienteTimelineEvento[];
};

/** Shape prevista per Supabase — non collegata ancora. */
export type ClienteTimelineEventoRow = {
  id: string;
  cliente_id: string;
  tipo: ClienteTimelineEventoTipo;
  titolo: string;
  descrizione: string;
  data: string;
  utente: string;
  creato_il: string;
};
