/**
 * Avatar e allegati del cliente.
 */

import type { TipoAllegato } from "./enums";

export type ClienteAllegato = {
  id: string;
  nome: string;
  url: string;
  tipo: TipoAllegato;
  dimensione: number;
  mimeType: string;
  caricatoIl: string;
  clienteId: string;
};

export type ClienteMedia = {
  avatarUrl: string | null;
  allegati: ClienteAllegato[];
};

export type ClienteAllegatoInput = {
  nome: string;
  url: string;
  tipo: TipoAllegato;
  dimensione: number;
  mimeType: string;
};
