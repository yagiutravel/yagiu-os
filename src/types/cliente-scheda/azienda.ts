/**
 * Informazioni aziendali del cliente.
 */

export type ClienteAzienda = {
  nome: string;
  ruolo: string;
};

export type ClienteAziendaInput = {
  nome?: string;
  ruolo?: string;
};
