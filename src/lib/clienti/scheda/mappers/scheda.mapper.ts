import type { ClienteRow } from "@/types/database";
import type { Cliente } from "@/types/cliente";
import type { ClienteScheda, ClienteSchedaSource } from "@/types/cliente-scheda/scheda";
import { createClienteSchedaFromRow } from "@/models/cliente-scheda/factories";
import { mapRowToDatiPersonali } from "./personali.mapper";
import { mapRowToAzienda } from "./azienda.mapper";
import { mapRowToCommerciale } from "./commerciale.mapper";
import { mapViaggiToClienteViaggi } from "./viaggi.mapper";
import { mapDocumentiToClienteDocumenti } from "./documenti.mapper";
import { mapRowToCrm } from "./crm.mapper";
import { mapMediaOverrides } from "./media.mapper";
import { displayToPlain } from "../mapper-utils";

export function mapRowToClienteScheda(
  row: ClienteRow,
  source: ClienteSchedaSource = {},
): ClienteScheda {
  const personali = {
    ...mapRowToDatiPersonali(row),
    ...source.personali,
    indirizzo: {
      ...mapRowToDatiPersonali(row).indirizzo,
      ...source.personali?.indirizzo,
    },
  };

  const azienda = {
    ...mapRowToAzienda(row),
    ...source.azienda,
  };

  const commerciale = {
    ...mapRowToCommerciale(row),
    ...source.commerciale,
  };

  const viaggi = source.viaggi ?? mapViaggiToClienteViaggi();
  const documenti = source.documenti ?? mapDocumentiToClienteDocumenti();
  const crm = mapRowToCrm(row, source.crm);
  const media = mapMediaOverrides(source.media);

  return createClienteSchedaFromRow(row, {
    personali,
    azienda,
    commerciale,
    viaggi,
    documenti,
    crm,
    media,
  });
}

export function mapClienteToClienteScheda(
  cliente: Cliente,
  source: ClienteSchedaSource = {},
): ClienteScheda {
  const syntheticRow: ClienteRow = {
    id: cliente.id,
    created_at: `${cliente.creatoIl}T00:00:00.000Z`,
    updated_at: `${cliente.creatoIl}T00:00:00.000Z`,
    nome: cliente.nome,
    cognome: null,
    email: displayToPlain(cliente.email) || null,
    telefono: displayToPlain(cliente.telefono) || null,
    azienda: displayToPlain(cliente.azienda) || null,
    stato: cliente.stato,
    data_nascita: null,
    indirizzo: null,
    citta: null,
    provincia: null,
    cap: null,
    paese: null,
    note: null,
    created_by: null,
  };

  return mapRowToClienteScheda(syntheticRow, source);
}

export function mapClienteSchedaToCliente(scheda: ClienteScheda): Cliente {
  const { personali, azienda, commerciale } = scheda;

  const stato =
    commerciale.statoPipeline === "Cliente"
      ? "Attivo"
      : commerciale.statoPipeline === "Lead"
        ? "Prospect"
        : commerciale.statoPipeline === "Perso"
          ? "Inattivo"
          : "Prospect";

  return {
    id: scheda.id,
    nome: personali.nome,
    email: personali.email,
    telefono: personali.telefono,
    azienda: azienda.nome,
    stato,
    creatoIl: scheda.creatoIl.split("T")[0],
  };
}

export function mapRowsToClienteSchede(
  rows: ClienteRow[],
  sourceById?: Record<string, ClienteSchedaSource>,
): ClienteScheda[] {
  return rows.map((row) => mapRowToClienteScheda(row, sourceById?.[row.id]));
}
