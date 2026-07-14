import type {
  AutomazioneAzione,
  AutomazioneStato,
  AutomazioneTrigger,
} from "@/types/automazione";

export const AUTOMAZIONE_STATO_FILTRI: Array<{
  value: AutomazioneStato | "tutti";
  label: string;
}> = [
  { value: "tutti", label: "Tutti" },
  { value: "attivo", label: "Attivi" },
  { value: "inattivo", label: "Inattivi" },
  { value: "bozza", label: "Bozze" },
];

export const AUTOMAZIONE_TRIGGER_OPTIONS: Array<{
  value: AutomazioneTrigger;
  label: string;
}> = [
  { value: "saldo_mancante", label: "Quando manca il saldo" },
  { value: "passaporto_scadenza", label: "Quando il passaporto scade" },
  { value: "una_settimana_mancante", label: "Quando manca una settimana" },
  { value: "tour_terminato", label: "Quando il tour termina" },
];

export const AUTOMAZIONE_AZIONE_OPTIONS: Array<{
  value: AutomazioneAzione;
  label: string;
}> = [
  { value: "invia_reminder", label: "Invia reminder" },
  { value: "crea_notifica", label: "Crea notifica" },
  { value: "invia_email", label: "Invia email" },
  { value: "invia_richiesta_recensione", label: "Invia richiesta recensione" },
];

export const AUTOMAZIONE_TRIGGER_LABELS: Record<AutomazioneTrigger, string> = {
  saldo_mancante: "Quando manca il saldo",
  passaporto_scadenza: "Quando il passaporto scade",
  una_settimana_mancante: "Quando manca una settimana",
  tour_terminato: "Quando il tour termina",
};

export const AUTOMAZIONE_AZIONE_LABELS: Record<AutomazioneAzione, string> = {
  invia_reminder: "Invia reminder",
  crea_notifica: "Crea notifica",
  invia_email: "Invia email",
  invia_richiesta_recensione: "Invia richiesta recensione",
};

export const AUTOMAZIONE_STATO_LABELS: Record<AutomazioneStato, string> = {
  attivo: "Attivo",
  inattivo: "Inattivo",
  bozza: "Bozza",
};

/** Mapping trigger → azione suggerita per il form. */
export const AUTOMAZIONE_TRIGGER_AZIONE_DEFAULT: Record<
  AutomazioneTrigger,
  AutomazioneAzione
> = {
  saldo_mancante: "invia_reminder",
  passaporto_scadenza: "crea_notifica",
  una_settimana_mancante: "invia_email",
  tour_terminato: "invia_richiesta_recensione",
};
