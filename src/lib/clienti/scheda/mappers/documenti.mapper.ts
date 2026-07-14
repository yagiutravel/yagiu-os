import type { ClienteDocumento, ClienteDocumenti } from "@/types/cliente-scheda/documenti";
import { StatoDocumento, TipoDocumento } from "@/types/cliente-scheda/enums";
import { EMPTY_DOCUMENTI } from "@/models/cliente-scheda/defaults";

function findDocumentoByTipo(
  documenti: ClienteDocumento[],
  tipo: TipoDocumento,
): ClienteDocumento | null {
  return documenti.find((doc) => doc.tipo === tipo) ?? null;
}

export function mapDocumentiToClienteDocumenti(
  documenti: ClienteDocumento[] = [],
): ClienteDocumenti {
  if (documenti.length === 0) return EMPTY_DOCUMENTI;

  const principali = new Set<TipoDocumento>([
    TipoDocumento.Passaporto,
    TipoDocumento.CartaIdentita,
    TipoDocumento.Assicurazione,
  ]);

  const altri = documenti.filter((doc) => !principali.has(doc.tipo));

  return {
    passaporto: findDocumentoByTipo(documenti, TipoDocumento.Passaporto),
    cartaIdentita: findDocumentoByTipo(documenti, TipoDocumento.CartaIdentita),
    assicurazione: findDocumentoByTipo(documenti, TipoDocumento.Assicurazione),
    altri,
  };
}

export function calcolaStatoDocumento(dataScadenza: string | null): StatoDocumento {
  if (!dataScadenza) return StatoDocumento.Mancante;

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const scadenza = new Date(dataScadenza);
  scadenza.setHours(0, 0, 0, 0);

  if (scadenza < oggi) return StatoDocumento.Scaduto;

  const soglia = new Date(oggi);
  soglia.setMonth(soglia.getMonth() + 6);

  if (scadenza <= soglia) return StatoDocumento.InScadenza;

  return StatoDocumento.Valido;
}

export function countDocumentiScaduti(documenti: ClienteDocumenti): number {
  const tutti = [
    documenti.passaporto,
    documenti.cartaIdentita,
    documenti.assicurazione,
    ...documenti.altri,
  ].filter((doc): doc is ClienteDocumento => doc !== null);

  return tutti.filter((doc) => doc.stato === StatoDocumento.Scaduto).length;
}

export function countDocumentiInScadenza(documenti: ClienteDocumenti): number {
  const tutti = [
    documenti.passaporto,
    documenti.cartaIdentita,
    documenti.assicurazione,
    ...documenti.altri,
  ].filter((doc): doc is ClienteDocumento => doc !== null);

  return tutti.filter((doc) => doc.stato === StatoDocumento.InScadenza).length;
}
