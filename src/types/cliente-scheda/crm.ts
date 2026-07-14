/**
 * Note, attività, timeline e tag CRM del cliente.
 */

import type { TipoAttivita, TipoTimelineEvento } from "./enums";

export type ClienteNota = {
  id: string;
  contenuto: string;
  creatoIl: string;
  aggiornatoIl: string;
  creatoDa: string | null;
  clienteId: string;
};

export type ClienteAttivita = {
  id: string;
  tipo: TipoAttivita;
  titolo: string;
  descrizione: string;
  scadenza: string | null;
  completata: boolean;
  completataIl: string | null;
  creatoIl: string;
  assegnatoA: string | null;
  clienteId: string;
};

export type ClienteTimelineEvento = {
  id: string;
  tipo: TipoTimelineEvento;
  titolo: string;
  descrizione: string;
  data: string;
  riferimentoId: string | null;
  metadata: Record<string, string>;
  clienteId: string;
};

export type ClienteTag = {
  id: string;
  label: string;
  colore: string;
};

export type ClienteCrm = {
  note: ClienteNota[];
  attivita: ClienteAttivita[];
  timeline: ClienteTimelineEvento[];
  tag: ClienteTag[];
};

export type ClienteNotaInput = {
  contenuto: string;
};

export type ClienteAttivitaInput = {
  tipo: TipoAttivita;
  titolo: string;
  descrizione?: string;
  scadenza?: string | null;
  assegnatoA?: string | null;
};

export type ClienteTagInput = {
  label: string;
  colore?: string;
};
