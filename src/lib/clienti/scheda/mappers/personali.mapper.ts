import type { ClienteRow } from "@/types/database";
import type { ClienteDatiPersonali } from "@/types/cliente-scheda/personali";
import { EMPTY_DISPLAY, EMPTY_INDIRIZZO } from "@/models/cliente-scheda/defaults";
import { toDisplayValue, toIsoDate, toPlainString } from "../mapper-utils";

export function mapRowToDatiPersonali(row: ClienteRow): ClienteDatiPersonali {
  return {
    nome: row.nome,
    cognome: toPlainString(row.cognome),
    email: toDisplayValue(row.email),
    telefono: toDisplayValue(row.telefono),
    whatsapp: EMPTY_DISPLAY,
    dataNascita: toIsoDate(row.data_nascita),
    nazionalita: toPlainString(row.paese),
    indirizzo: {
      via: toPlainString(row.indirizzo),
      citta: toPlainString(row.citta),
      provincia: toPlainString(row.provincia),
      cap: toPlainString(row.cap),
      paese: toPlainString(row.paese),
    },
  };
}

export function mapDatiPersonaliToRowFields(
  personali: Partial<ClienteDatiPersonali>,
): Pick<
  ClienteRow,
  "nome" | "cognome" | "email" | "telefono" | "data_nascita" | "indirizzo" | "citta" | "provincia" | "cap" | "paese"
> {
  const indirizzo = personali.indirizzo ?? EMPTY_INDIRIZZO;

  return {
    nome: personali.nome?.trim() ?? "",
    cognome: personali.cognome?.trim() || null,
    email: personali.email?.trim().toLowerCase() || null,
    telefono: personali.telefono?.trim() || null,
    data_nascita: personali.dataNascita ?? null,
    indirizzo: indirizzo.via.trim() || null,
    citta: indirizzo.citta.trim() || null,
    provincia: indirizzo.provincia.trim() || null,
    cap: indirizzo.cap.trim() || null,
    paese: indirizzo.paese.trim() || null,
  };
}
