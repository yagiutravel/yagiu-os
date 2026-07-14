export type ClienteDocumentoTipo =
  | "passaporto"
  | "carta_identita"
  | "visto"
  | "assicurazione";

export type ClienteDocumentoStato = "valido" | "in_scadenza" | "scaduto";

/** Record documento — pronto per tabella Supabase `cliente_documenti`. */
export type ClienteDocumento = {
  id: string;
  clienteId: string;
  tipo: ClienteDocumentoTipo;
  numero: string;
  scadenza: string;
  allegatoNome: string | null;
  allegatoUrl: string | null;
  creatoIl: string;
  aggiornatoIl: string;
};

export type ClienteDocumentoView = ClienteDocumento & {
  stato: ClienteDocumentoStato;
};

export type ClienteDocumentiData = {
  documenti: ClienteDocumentoView[];
};

/** Shape prevista per Supabase — non collegata ancora. */
export type ClienteDocumentoRow = {
  id: string;
  cliente_id: string;
  tipo: ClienteDocumentoTipo;
  numero: string;
  scadenza: string;
  allegato_nome: string | null;
  allegato_url: string | null;
  creato_il: string;
  aggiornato_il: string;
};
