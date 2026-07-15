export type StatoPreventivo =
  | "Bozza"
  | "Inviato"
  | "Accettato"
  | "Rifiutato"
  | "Scaduto"
  | "Convertito";

export type StatoPreventivoFilter =
  | "tutti"
  | "bozza"
  | "inviato"
  | "accettato"
  | "rifiutato"
  | "scaduto"
  | "convertito";

export type PreventivoSortField = "data" | "totale" | "numero" | "cliente";
export type PreventivoSortDirection = "asc" | "desc";

export type PreventivoRiga = {
  id: string;
  preventivoId: string;
  descrizione: string;
  quantita: number;
  prezzoUnitario: number;
  ordine: number;
};

export type Preventivo = {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  tourId: string | null;
  tourNome: string | null;
  titolo: string;
  stato: StatoPreventivo;
  subtotale: number;
  tassePercentuale: number;
  tasse: number;
  totale: number;
  validoFino: string | null;
  note: string;
  partecipanteId: string | null;
  righe: PreventivoRiga[];
  creatoIl: string;
  aggiornatoIl: string;
};

export type PreventivoListItem = Omit<Preventivo, "righe" | "note">;

export type PreventivoRigaInput = {
  id?: string;
  descrizione: string;
  quantita: number;
  prezzoUnitario: number;
  ordine?: number;
};

export type CreatePreventivoInput = {
  clienteId: string;
  tourId?: string | null;
  titolo?: string;
  stato?: StatoPreventivo;
  tassePercentuale?: number;
  validoFino?: string | null;
  note?: string;
  righe: PreventivoRigaInput[];
};

export type UpdatePreventivoInput = Partial<
  Omit<CreatePreventivoInput, "clienteId">
> & {
  clienteId?: string;
  stato?: StatoPreventivo;
};

export type PreventivoTotals = {
  subtotale: number;
  tasse: number;
  totale: number;
  subtotaleCents: number;
  tasseCents: number;
  totaleCents: number;
};

export type PreventiviProcessOptions = {
  search?: string;
  stato?: StatoPreventivoFilter;
  sortField?: PreventivoSortField;
  sortDirection?: PreventivoSortDirection;
  page?: number;
  pageSize?: number;
};

export type PreventiviProcessResult = {
  items: PreventivoListItem[];
  totalItems: number;
  totalPages: number;
  page: number;
};
