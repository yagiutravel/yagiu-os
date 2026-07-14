import type { ClienteStato } from "@/types/cliente";
import type { DocumentiViaggiatore } from "@/types/documenti-viaggiatore";
import type { PreferenzeViaggiatore } from "@/types/preferenze-viaggiatore";

export type { DocumentiViaggiatore, PreferenzeViaggiatore };

export type ProfiloViaggiatoreAnagrafica = {
  nome: string;
  cognome: string;
  nomeCompleto: string;
  email: string;
  telefono: string;
  whatsapp: string;
  nazionalita: string;
  dataNascita: string;
  cittaPaese: string;
};

export type EsperienzaYagiu = {
  tourLeaderAssegnato: string;
  guidaLocale: string;
  viaggioAttuale: string;
  numeroViaggiEffettuati: string;
  clienteAbituale: boolean;
};

export type ProfiloViaggiatore = {
  id: string;
  stato: ClienteStato;
  creatoIl: string;
  profilo: ProfiloViaggiatoreAnagrafica;
  esperienzaYagiu: EsperienzaYagiu;
  preferenze: PreferenzeViaggiatore;
  documenti: DocumentiViaggiatore;
};
