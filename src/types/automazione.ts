export type AutomazioneTrigger =
  | "saldo_mancante"
  | "passaporto_scadenza"
  | "una_settimana_mancante"
  | "tour_terminato";

export type AutomazioneAzione =
  | "invia_reminder"
  | "crea_notifica"
  | "invia_email"
  | "invia_richiesta_recensione";

export type AutomazioneStato = "attivo" | "inattivo" | "bozza";

/** Record workflow — pronto per tabella Supabase `automazioni`. */
export type Automazione = {
  id: string;
  nome: string;
  trigger: AutomazioneTrigger;
  azione: AutomazioneAzione;
  stato: AutomazioneStato;
  ultimaEsecuzione: string | null;
  creatoIl: string;
  aggiornatoIl: string;
};

export type AutomazioneView = Automazione & {
  triggerLabel: string;
  azioneLabel: string;
  ultimaEsecuzioneFormattata: string;
};

export type CreateAutomazioneInput = {
  nome: string;
  trigger: AutomazioneTrigger;
  azione: AutomazioneAzione;
  stato: AutomazioneStato;
};

export type AutomazioneForm = {
  nome: string;
  trigger: AutomazioneTrigger | "";
  azione: AutomazioneAzione | "";
  stato: AutomazioneStato;
};

export type AutomazioneFormErrors = Partial<
  Record<keyof AutomazioneForm, string>
>;

/** Shape prevista per Supabase — non collegata ancora. */
export type AutomazioneRow = {
  id: string;
  nome: string;
  trigger: AutomazioneTrigger;
  azione: AutomazioneAzione;
  stato: AutomazioneStato;
  ultima_esecuzione: string | null;
  creato_il: string;
  aggiornato_il: string;
};
