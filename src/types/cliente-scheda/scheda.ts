/**
 * Modello aggregato della scheda cliente.
 * Punto di ingresso unico per la futura UI di dettaglio.
 */

import type { ClienteAzienda } from "./azienda";
import type { ClienteCommerciale } from "./commerciale";
import type { ClienteCrm } from "./crm";
import type { ClienteDocumenti } from "./documenti";
import type { ClienteMedia } from "./media";
import type { ClienteDatiPersonali } from "./personali";
import type { ClienteViaggi } from "./viaggi";

export type ClienteScheda = {
  id: string;
  personali: ClienteDatiPersonali;
  azienda: ClienteAzienda;
  commerciale: ClienteCommerciale;
  viaggi: ClienteViaggi;
  documenti: ClienteDocumenti;
  crm: ClienteCrm;
  media: ClienteMedia;
  creatoIl: string;
  aggiornatoIl: string;
  creatoDa: string | null;
};

/**
 * Contesto sorgente per il mapping verso ClienteScheda.
 * Consente di arricchire la scheda con dati relazionali futuri
 * senza modificare la firma del mapper principale.
 */
export type ClienteSchedaSource = {
  viaggi?: ClienteViaggi;
  documenti?: ClienteDocumenti;
  crm?: Partial<ClienteCrm>;
  media?: Partial<ClienteMedia>;
  azienda?: Partial<ClienteAzienda>;
  commerciale?: Partial<ClienteCommerciale>;
  personali?: Partial<ClienteDatiPersonali>;
};

export type ClienteSchedaSezione =
  | "personali"
  | "azienda"
  | "commerciale"
  | "viaggi"
  | "documenti"
  | "crm"
  | "media";

export type UpdateClienteSchedaInput = {
  personali?: Partial<ClienteDatiPersonali>;
  azienda?: Partial<ClienteAzienda>;
  commerciale?: Partial<ClienteCommerciale>;
};
