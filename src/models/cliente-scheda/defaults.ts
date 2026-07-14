/**
 * Valori di default per i modelli della scheda cliente.
 */

import {
  PipelineStato,
  StatoDocumento,
  TipoDocumento,
  ViaggioStato,
} from "@/types/cliente-scheda/enums";
import type { ClienteAzienda } from "@/types/cliente-scheda/azienda";
import type { ClienteCommerciale } from "@/types/cliente-scheda/commerciale";
import type { ClienteCrm } from "@/types/cliente-scheda/crm";
import type { ClienteDocumenti } from "@/types/cliente-scheda/documenti";
import type { ClienteMedia } from "@/types/cliente-scheda/media";
import type { ClienteIndirizzo, ClienteDatiPersonali } from "@/types/cliente-scheda/personali";
import type { ClienteViaggi } from "@/types/cliente-scheda/viaggi";

export const EMPTY_DISPLAY = "—";

export const EMPTY_INDIRIZZO: ClienteIndirizzo = {
  via: "",
  citta: "",
  provincia: "",
  cap: "",
  paese: "",
};

export const EMPTY_DATI_PERSONALI: ClienteDatiPersonali = {
  nome: "",
  cognome: "",
  email: "",
  telefono: "",
  whatsapp: "",
  dataNascita: null,
  nazionalita: "",
  indirizzo: { ...EMPTY_INDIRIZZO },
};

export const EMPTY_AZIENDA: ClienteAzienda = {
  nome: "",
  ruolo: "",
};

export const EMPTY_COMMERCIALE: ClienteCommerciale = {
  statoPipeline: PipelineStato.Lead,
  valoreCliente: null,
  provenienzaLead: null,
  referente: "",
};

export const EMPTY_VIAGGI: ClienteViaggi = {
  attivi: [],
  storico: [],
};

export const EMPTY_DOCUMENTI: ClienteDocumenti = {
  passaporto: null,
  cartaIdentita: null,
  assicurazione: null,
  altri: [],
};

export const EMPTY_CRM: ClienteCrm = {
  note: [],
  attivita: [],
  timeline: [],
  tag: [],
};

export const EMPTY_MEDIA: ClienteMedia = {
  avatarUrl: null,
  allegati: [],
};

export const DOCUMENTO_PLACEHOLDER_STATO = StatoDocumento.Mancante;

export const VIAGGIO_STATI_ATTIVI: ViaggioStato[] = [
  ViaggioStato.Pianificato,
  ViaggioStato.Confermato,
  ViaggioStato.InCorso,
];

export const VIAGGIO_STATI_STORICO: ViaggioStato[] = [
  ViaggioStato.Completato,
  ViaggioStato.Annullato,
];

export const DOCUMENTI_PRINCIPALI: TipoDocumento[] = [
  TipoDocumento.Passaporto,
  TipoDocumento.CartaIdentita,
  TipoDocumento.Assicurazione,
];
