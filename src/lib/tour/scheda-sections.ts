import type { TourSchedaSezione, TourSchedaSezioneId } from "@/types/tour-scheda";

export const TOUR_SCHEDA_SEZIONI: TourSchedaSezione[] = [
  {
    id: "timeline",
    label: "Timeline",
    description: "Cronologia eventi e attività del tour.",
  },
  {
    id: "partecipanti",
    label: "Partecipanti",
    description: "Viaggiatori iscritti e stato operativo del gruppo.",
  },
  {
    id: "camere",
    label: "Camere",
    description: "Rooming list e assegnazione partecipanti alle camere.",
  },
  {
    id: "pagamenti",
    label: "Pagamenti",
    description: "Situazione economica e incassi dei partecipanti.",
  },
  {
    id: "documenti",
    label: "Documenti",
    description: "Contratti, assicurazioni e documentazione operativa.",
  },
  {
    id: "programma",
    label: "Programma",
    description: "Itinerario giorno per giorno del tour.",
  },
  {
    id: "checklist",
    label: "Checklist",
    description: "Attività operative e verifiche pre-partenza.",
  },
];

export const TOUR_SCHEDA_SEZIONE_DEFAULT: TourSchedaSezioneId = "timeline";
