import type { ClienteRow } from "@/types/database";
import type { ClienteAzienda } from "@/types/cliente-scheda/azienda";
import { toDisplayValue, toPlainString } from "../mapper-utils";

export function mapRowToAzienda(row: ClienteRow): ClienteAzienda {
  return {
    nome: toDisplayValue(row.azienda),
    ruolo: "",
  };
}

export function mapAziendaToRowFields(
  azienda: Partial<ClienteAzienda>,
): Pick<ClienteRow, "azienda"> {
  return {
    azienda: azienda.nome?.trim() || null,
  };
}

export function mapAziendaRuolo(ruolo: string | null | undefined): string {
  return toPlainString(ruolo);
}
