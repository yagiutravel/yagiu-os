export type DocumentoStato = "valido" | "in_scadenza" | "scaduto";

export type DocumentoTipo =
  | "passaporto"
  | "assicurazione"
  | "visto"
  | "liberatoria";

export type DocumentoViaggiatore = {
  id: string;
  tipo: DocumentoTipo;
  nome: string;
  stato: DocumentoStato;
  dataScadenza: string;
};

export type DocumentiViaggiatore = {
  documenti: DocumentoViaggiatore[];
};
