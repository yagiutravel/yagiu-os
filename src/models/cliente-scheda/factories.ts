/**
 * Factory per costruire modelli della scheda cliente.
 */

import type { ClienteRow } from "@/types/database";
import type { ClienteScheda, ClienteSchedaSource } from "@/types/cliente-scheda/scheda";
import {
  EMPTY_AZIENDA,
  EMPTY_COMMERCIALE,
  EMPTY_CRM,
  EMPTY_DATI_PERSONALI,
  EMPTY_DOCUMENTI,
  EMPTY_MEDIA,
  EMPTY_VIAGGI,
} from "./defaults";

export function createEmptyClienteScheda(
  id: string,
  overrides?: Partial<ClienteScheda>,
): ClienteScheda {
  const now = new Date().toISOString();

  return {
    id,
    personali: { ...EMPTY_DATI_PERSONALI, indirizzo: { ...EMPTY_DATI_PERSONALI.indirizzo } },
    azienda: { ...EMPTY_AZIENDA },
    commerciale: { ...EMPTY_COMMERCIALE },
    viaggi: { attivi: [], storico: [] },
    documenti: {
      passaporto: null,
      cartaIdentita: null,
      assicurazione: null,
      altri: [],
    },
    crm: {
      note: [],
      attivita: [],
      timeline: [],
      tag: [],
    },
    media: { avatarUrl: null, allegati: [] },
    creatoIl: now,
    aggiornatoIl: now,
    creatoDa: null,
    ...overrides,
  };
}

export function createClienteSchedaFromRow(
  row: ClienteRow,
  source?: ClienteSchedaSource,
): ClienteScheda {
  return createEmptyClienteScheda(row.id, {
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
    creatoDa: row.created_by,
    personali: source?.personali
      ? { ...EMPTY_DATI_PERSONALI, ...source.personali, indirizzo: { ...EMPTY_DATI_PERSONALI.indirizzo, ...source.personali.indirizzo } }
      : undefined,
    azienda: source?.azienda ? { ...EMPTY_AZIENDA, ...source.azienda } : undefined,
    commerciale: source?.commerciale
      ? { ...EMPTY_COMMERCIALE, ...source.commerciale }
      : undefined,
    viaggi: source?.viaggi ?? EMPTY_VIAGGI,
    documenti: source?.documenti ?? EMPTY_DOCUMENTI,
    crm: source?.crm
      ? {
          note: source.crm.note ?? EMPTY_CRM.note,
          attivita: source.crm.attivita ?? EMPTY_CRM.attivita,
          timeline: source.crm.timeline ?? EMPTY_CRM.timeline,
          tag: source.crm.tag ?? EMPTY_CRM.tag,
        }
      : EMPTY_CRM,
    media: source?.media
      ? {
          avatarUrl: source.media.avatarUrl ?? EMPTY_MEDIA.avatarUrl,
          allegati: source.media.allegati ?? EMPTY_MEDIA.allegati,
        }
      : EMPTY_MEDIA,
  });
}

export function mergeClienteScheda(
  base: ClienteScheda,
  patch: Partial<ClienteScheda>,
): ClienteScheda {
  return {
    ...base,
    ...patch,
    personali: patch.personali
      ? {
          ...base.personali,
          ...patch.personali,
          indirizzo: { ...base.personali.indirizzo, ...patch.personali.indirizzo },
        }
      : base.personali,
    azienda: patch.azienda ? { ...base.azienda, ...patch.azienda } : base.azienda,
    commerciale: patch.commerciale
      ? { ...base.commerciale, ...patch.commerciale }
      : base.commerciale,
    viaggi: patch.viaggi
      ? {
          attivi: patch.viaggi.attivi ?? base.viaggi.attivi,
          storico: patch.viaggi.storico ?? base.viaggi.storico,
        }
      : base.viaggi,
    documenti: patch.documenti
      ? {
          passaporto: patch.documenti.passaporto ?? base.documenti.passaporto,
          cartaIdentita: patch.documenti.cartaIdentita ?? base.documenti.cartaIdentita,
          assicurazione: patch.documenti.assicurazione ?? base.documenti.assicurazione,
          altri: patch.documenti.altri ?? base.documenti.altri,
        }
      : base.documenti,
    crm: patch.crm
      ? {
          note: patch.crm.note ?? base.crm.note,
          attivita: patch.crm.attivita ?? base.crm.attivita,
          timeline: patch.crm.timeline ?? base.crm.timeline,
          tag: patch.crm.tag ?? base.crm.tag,
        }
      : base.crm,
    media: patch.media
      ? {
          avatarUrl: patch.media.avatarUrl ?? base.media.avatarUrl,
          allegati: patch.media.allegati ?? base.media.allegati,
        }
      : base.media,
    aggiornatoIl: patch.aggiornatoIl ?? base.aggiornatoIl,
  };
}
