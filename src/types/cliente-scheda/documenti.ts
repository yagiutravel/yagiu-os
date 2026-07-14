/**
 * Documenti di identità e assicurazione del cliente.
 */

import type { StatoDocumento, TipoDocumento } from "./enums";

export type ClienteDocumento = {
  id: string;
  tipo: TipoDocumento;
  numero: string;
  dataEmissione: string | null;
  dataScadenza: string | null;
  stato: StatoDocumento;
  note: string;
  clienteId: string;
};

export type ClienteDocumenti = {
  passaporto: ClienteDocumento | null;
  cartaIdentita: ClienteDocumento | null;
  assicurazione: ClienteDocumento | null;
  altri: ClienteDocumento[];
};

export type ClienteDocumentoInput = {
  tipo: TipoDocumento;
  numero?: string;
  dataEmissione?: string | null;
  dataScadenza?: string | null;
  note?: string;
};
