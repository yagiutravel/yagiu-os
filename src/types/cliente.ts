export type ClienteStato = "Attivo" | "Inattivo" | "Prospect";

export type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  azienda: string;
  stato: ClienteStato;
  creatoIl: string;
};

export type ClienteForm = {
  nome: string;
  email: string;
  telefono: string;
  azienda: string;
  stato: ClienteStato;
};

export type CreateClienteInput = {
  nome: string;
  email: string;
  telefono?: string;
  azienda?: string;
  stato: ClienteStato;
};

export type UpdateClienteInput = Partial<CreateClienteInput>;

export type ClienteFormErrors = Partial<Record<keyof ClienteForm, string>>;

export type SortField = "nome" | "creatoIl";
export type SortDirection = "asc" | "desc";

export type ClienteFilters = {
  search: string;
  stato: ClienteStato | "tutti";
  sortField: SortField;
  sortDirection: SortDirection;
  page: number;
};
