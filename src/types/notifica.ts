export type NotificaTipo =
  | "saldo_mancante"
  | "documento_scadenza"
  | "tour_partenza"
  | "camera_incompleta"
  | "pagamento_ricevuto"
  | "cliente_nuovo";

export type NotificaStatoFiltro = "tutte" | "lette" | "non_lette";

/** Record notifica — pronto per tabella Supabase `notifiche`. */
export type Notifica = {
  id: string;
  tipo: NotificaTipo;
  titolo: string;
  messaggio: string;
  href: string | null;
  letta: boolean;
  data: string;
  creatoIl: string;
};

export type NotificaView = Notifica & {
  dataFormattata: string;
  oraFormattata: string;
};

/** Shape prevista per Supabase — non collegata ancora. */
export type NotificaRow = {
  id: string;
  tipo: NotificaTipo;
  titolo: string;
  messaggio: string;
  href: string | null;
  letta: boolean;
  data: string;
  creato_il: string;
};
