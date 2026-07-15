import type { PreventivoSortField, StatoPreventivoFilter } from "@/types/preventivo";

export const PREVENTIVO_STATO_FILTER_OPTIONS: {
  value: StatoPreventivoFilter;
  label: string;
}[] = [
  { value: "tutti", label: "Tutti" },
  { value: "bozza", label: "Bozza" },
  { value: "inviato", label: "Inviato" },
  { value: "accettato", label: "Accettato" },
  { value: "rifiutato", label: "Rifiutato" },
  { value: "scaduto", label: "Scaduto" },
  { value: "convertito", label: "Convertito" },
];

export const PREVENTIVO_SORT_OPTIONS: {
  value: PreventivoSortField;
  label: string;
}[] = [
  { value: "data", label: "Data" },
  { value: "totale", label: "Totale" },
  { value: "numero", label: "Numero" },
  { value: "cliente", label: "Cliente" },
];

export const PREVENTIVO_STATO_OPTIONS = [
  "Bozza",
  "Inviato",
  "Accettato",
  "Rifiutato",
  "Scaduto",
  "Convertito",
] as const;
