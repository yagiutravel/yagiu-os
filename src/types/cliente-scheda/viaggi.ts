/**
 * Viaggi associati al cliente.
 */

import type { ViaggioStato } from "./enums";

export type ClienteViaggio = {
  id: string;
  titolo: string;
  destinazione: string;
  dataInizio: string;
  dataFine: string;
  stato: ViaggioStato;
  clienteId: string;
};

export type ClienteViaggi = {
  attivi: ClienteViaggio[];
  storico: ClienteViaggio[];
};

export type ClienteViaggioInput = {
  titolo: string;
  destinazione: string;
  dataInizio: string;
  dataFine: string;
  stato?: ViaggioStato;
};
