import type { StatoPreventivo } from "@/types/preventivo";

export type DbStatoPreventivo =
  | "bozza"
  | "inviato"
  | "accettato"
  | "rifiutato"
  | "scaduto"
  | "convertito";

const STATO_TO_UI: Record<DbStatoPreventivo, StatoPreventivo> = {
  bozza: "Bozza",
  inviato: "Inviato",
  accettato: "Accettato",
  rifiutato: "Rifiutato",
  scaduto: "Scaduto",
  convertito: "Convertito",
};

const STATO_TO_DB: Record<StatoPreventivo, DbStatoPreventivo> = {
  Bozza: "bozza",
  Inviato: "inviato",
  Accettato: "accettato",
  Rifiutato: "rifiutato",
  Scaduto: "scaduto",
  Convertito: "convertito",
};

export function mapDbStatoPreventivoToUi(value: string): StatoPreventivo {
  return STATO_TO_UI[value as DbStatoPreventivo] ?? "Bozza";
}

export function mapUiStatoPreventivoToDb(value: StatoPreventivo): DbStatoPreventivo {
  return STATO_TO_DB[value];
}
