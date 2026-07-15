export type TimelineEventoTipo =
  | "prenotazione"
  | "pagamento"
  | "documento_caricato"
  | "tour_completato"
  | "email_inviata"
  | "nota_interna"
  | "telefonata"
  | "programma_giorno"
  | "attivita"
  | "volo"
  | "transfer"
  | "assicurazione";

export type TimelineEvento = {
  id: string;
  tipo: TimelineEventoTipo;
  titolo: string;
  descrizione: string;
  data: string;
};
