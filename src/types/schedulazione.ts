export type SchedulazioneTipo = "email" | "whatsapp" | "reminder";

export type SchedulazioneStato =
  | "programmata"
  | "inviata"
  | "fallita"
  | "bozza";

/** Record schedulazione — pronto per tabella Supabase `schedulazioni`. */
export type Schedulazione = {
  id: string;
  titolo: string;
  clienteId: string;
  clienteNome: string;
  tourId: string | null;
  tourNome: string | null;
  tipo: SchedulazioneTipo;
  data: string;
  ora: string;
  stato: SchedulazioneStato;
  creatoIl: string;
  aggiornatoIl: string;
};

export type SchedulazioneView = Schedulazione & {
  dataOraFormattata: string;
};

export type CreateSchedulazioneInput = {
  titolo: string;
  clienteId: string;
  clienteNome: string;
  tourId: string | null;
  tourNome: string | null;
  tipo: SchedulazioneTipo;
  data: string;
  ora: string;
  stato: SchedulazioneStato;
};

export type SchedulazioneForm = {
  titolo: string;
  clienteId: string;
  tourId: string;
  tipo: SchedulazioneTipo;
  data: string;
  ora: string;
  stato: SchedulazioneStato;
};

export type SchedulazioneFormErrors = Partial<
  Record<keyof SchedulazioneForm, string>
>;

/** Shape prevista per Supabase — non collegata ancora. */
export type SchedulazioneRow = {
  id: string;
  titolo: string;
  cliente_id: string;
  cliente_nome: string;
  tour_id: string | null;
  tour_nome: string | null;
  tipo: SchedulazioneTipo;
  data: string;
  ora: string;
  stato: SchedulazioneStato;
  creato_il: string;
  aggiornato_il: string;
};
