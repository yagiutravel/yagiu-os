import type { ClienteRow } from "@/types/database";
import type { ClienteCommerciale } from "@/types/cliente-scheda/commerciale";
import {
  PipelineStato,
  ProvenienzaLead,
  ValoreCliente,
} from "@/types/cliente-scheda/enums";
import { EMPTY_COMMERCIALE } from "@/models/cliente-scheda/defaults";

function toPipelineStato(value: string | null | undefined): PipelineStato {
  const candidates = Object.values(PipelineStato);
  if (value && candidates.includes(value as PipelineStato)) {
    return value as PipelineStato;
  }
  return EMPTY_COMMERCIALE.statoPipeline;
}

function toValoreCliente(value: string | null | undefined): ValoreCliente | null {
  const candidates = Object.values(ValoreCliente);
  if (value && candidates.includes(value as ValoreCliente)) {
    return value as ValoreCliente;
  }
  return null;
}

function toProvenienzaLead(value: string | null | undefined): ProvenienzaLead | null {
  const candidates = Object.values(ProvenienzaLead);
  if (value && candidates.includes(value as ProvenienzaLead)) {
    return value as ProvenienzaLead;
  }
  return null;
}

/**
 * Mappa i campi commerciali disponibili oggi nel record clienti.
 * `stato` DB (Attivo/Inattivo/Prospect) viene usato come fallback pipeline Lead/Cliente.
 */
export function mapRowToCommerciale(row: ClienteRow): ClienteCommerciale {
  const statoPipeline =
    row.stato === "Attivo"
      ? PipelineStato.Cliente
      : row.stato === "Prospect"
        ? PipelineStato.Lead
        : EMPTY_COMMERCIALE.statoPipeline;

  return {
    statoPipeline,
    valoreCliente: null,
    provenienzaLead: null,
    referente: "",
  };
}

export function mapCommercialeOverrides(
  overrides: Partial<ClienteCommerciale>,
): ClienteCommerciale {
  return {
    statoPipeline: overrides.statoPipeline ?? EMPTY_COMMERCIALE.statoPipeline,
    valoreCliente: overrides.valoreCliente ?? null,
    provenienzaLead: overrides.provenienzaLead ?? null,
    referente: overrides.referente?.trim() ?? "",
  };
}

export function mapCommercialeToRowStato(
  commerciale: Partial<ClienteCommerciale>,
): Partial<Pick<ClienteRow, "stato">> {
  if (commerciale.statoPipeline === PipelineStato.Cliente) {
    return { stato: "Attivo" };
  }
  if (commerciale.statoPipeline === PipelineStato.Lead) {
    return { stato: "Prospect" };
  }
  if (commerciale.statoPipeline === PipelineStato.Perso) {
    return { stato: "Inattivo" };
  }
  return {};
}

export { toPipelineStato, toValoreCliente, toProvenienzaLead };
