/**
 * Dati commerciali e pipeline del cliente.
 */

import type { PipelineStato, ProvenienzaLead, ValoreCliente } from "./enums";

export type ClienteCommerciale = {
  statoPipeline: PipelineStato;
  valoreCliente: ValoreCliente | null;
  provenienzaLead: ProvenienzaLead | null;
  referente: string;
};

export type ClienteCommercialeInput = {
  statoPipeline?: PipelineStato;
  valoreCliente?: ValoreCliente | null;
  provenienzaLead?: ProvenienzaLead | null;
  referente?: string;
};
