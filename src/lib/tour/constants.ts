import type { TourStato, TourStatoFilter } from "@/types/tour";

export const TOUR_PAGE_SIZE = 5;

export const TOUR_STATO_FILTER_OPTIONS: { value: TourStatoFilter; label: string }[] = [
  { value: "tutti", label: "Tutti" },
  { value: "In vendita", label: "In vendita" },
  { value: "Completo", label: "Completo" },
  { value: "In corso", label: "In corso" },
  { value: "Terminato", label: "Terminato" },
  { value: "Archiviato", label: "Archiviato" },
];

export const TOUR_STATO_OPTIONS: { value: TourStato; label: string }[] =
  TOUR_STATO_FILTER_OPTIONS.filter(
    (option): option is { value: TourStato; label: string } =>
      option.value !== "tutti",
  );
