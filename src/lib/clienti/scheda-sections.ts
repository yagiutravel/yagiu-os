export type ClienteSchedaSezioneId =
  | "panoramica"
  | "timeline"
  | "viaggi"
  | "pagamenti"
  | "documenti"
  | "questionario"
  | "note";

export type ClienteSchedaSezione = {
  id: ClienteSchedaSezioneId;
  label: string;
  description: string;
};

export const CLIENTE_SCHEDA_SEZIONI: ClienteSchedaSezione[] = [
  {
    id: "panoramica",
    label: "Panoramica",
    description: "Profilo viaggiatore, esperienza Yagiu e preferenze.",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Cronologia attività e interazioni.",
  },
  {
    id: "viaggi",
    label: "Viaggi",
    description: "Viaggi associati e storico.",
  },
  {
    id: "pagamenti",
    label: "Pagamenti",
    description: "Storico pagamenti e saldi.",
  },
  {
    id: "documenti",
    label: "Documenti",
    description: "Passaporto, carta d'identità, visto e assicurazione.",
  },
  {
    id: "questionario",
    label: "Questionario",
    description: "Allergie, preferenze alimentari e dati logistici.",
  },
  {
    id: "note",
    label: "Note",
    description: "Note interne e annotazioni del team staff.",
  },
];

export const CLIENTE_SCHEDA_SEZIONE_DEFAULT: ClienteSchedaSezioneId = "panoramica";
