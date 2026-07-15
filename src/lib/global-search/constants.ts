import type { GlobalSearchCategoria } from "@/types/global-search";

export const GLOBAL_SEARCH_CATEGORIA_ORDER: GlobalSearchCategoria[] = [
  "clienti",
  "tour",
  "preventivi",
  "pagamenti",
  "camere",
  "documenti",
  "questionari",
  "timeline",
  "dashboard",
];

export const GLOBAL_SEARCH_CATEGORIA_LABELS: Record<
  GlobalSearchCategoria,
  string
> = {
  clienti: "Clienti",
  tour: "Tour",
  preventivi: "Preventivi",
  pagamenti: "Pagamenti",
  camere: "Camere",
  documenti: "Documenti",
  questionari: "Questionari",
  timeline: "Timeline",
  dashboard: "Dashboard",
};
