/**
 * Dati anagrafici del cliente.
 */

export type ClienteIndirizzo = {
  via: string;
  citta: string;
  provincia: string;
  cap: string;
  paese: string;
};

export type ClienteDatiPersonali = {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  whatsapp: string;
  dataNascita: string | null;
  nazionalita: string;
  indirizzo: ClienteIndirizzo;
};

export type ClienteDatiPersonaliInput = {
  nome: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  dataNascita?: string | null;
  nazionalita?: string;
  indirizzo?: Partial<ClienteIndirizzo>;
};
