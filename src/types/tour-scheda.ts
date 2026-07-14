import type { Tour } from "./tour";

export type TourDettaglio = Tour & {
  prezzo: string;
  descrizione: string;
};

export type TourSchedaSezioneId =
  | "timeline"
  | "partecipanti"
  | "camere"
  | "pagamenti"
  | "documenti"
  | "programma"
  | "checklist";

export type TourSchedaSezione = {
  id: TourSchedaSezioneId;
  label: string;
  description: string;
};
