import type { ClienteRow } from "@/types/database";
import type {
  ClienteAttivita,
  ClienteCrm,
  ClienteNota,
  ClienteTimelineEvento,
} from "@/types/cliente-scheda/crm";
import { TipoTimelineEvento } from "@/types/cliente-scheda/enums";
import { EMPTY_CRM } from "@/models/cliente-scheda/defaults";
import { generateLocalId, toPlainString } from "../mapper-utils";

function mapRowNoteToNota(row: ClienteRow): ClienteNota[] {
  const contenuto = toPlainString(row.note);
  if (!contenuto) return [];

  return [
    {
      id: generateLocalId("nota"),
      contenuto,
      creatoIl: row.created_at,
      aggiornatoIl: row.updated_at,
      creatoDa: row.created_by,
      clienteId: row.id,
    },
  ];
}

export function mapRowToCrm(
  row: ClienteRow,
  overrides?: Partial<ClienteCrm>,
): ClienteCrm {
  const noteFromRow = mapRowNoteToNota(row);

  return {
    note: overrides?.note ?? noteFromRow,
    attivita: overrides?.attivita ?? EMPTY_CRM.attivita,
    timeline: overrides?.timeline ?? buildTimelineFromNota(noteFromRow),
    tag: overrides?.tag ?? EMPTY_CRM.tag,
  };
}

export function buildTimelineFromNota(note: ClienteNota[]): ClienteTimelineEvento[] {
  return note.map((nota) => ({
    id: generateLocalId("timeline"),
    tipo: TipoTimelineEvento.Nota,
    titolo: "Nota aggiunta",
    descrizione: nota.contenuto,
    data: nota.creatoIl,
    riferimentoId: nota.id,
    metadata: {},
    clienteId: nota.clienteId,
  }));
}

export function buildTimelineFromAttivita(
  attivita: ClienteAttivita[],
): ClienteTimelineEvento[] {
  return attivita.map((item) => ({
    id: generateLocalId("timeline"),
    tipo: TipoTimelineEvento.Attivita,
    titolo: item.titolo,
    descrizione: item.descrizione,
    data: item.creatoIl,
    riferimentoId: item.id,
    metadata: {
      tipoAttivita: item.tipo,
      completata: String(item.completata),
    },
    clienteId: item.clienteId,
  }));
}

export function mergeTimelineEvents(
  ...events: ClienteTimelineEvento[][]
): ClienteTimelineEvento[] {
  return events
    .flat()
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function countAttivitaAperte(crm: ClienteCrm): number {
  return crm.attivita.filter((item) => !item.completata).length;
}

export function countNote(crm: ClienteCrm): number {
  return crm.note.length;
}

export function mapNotaToRowField(nota: ClienteNota): Pick<ClienteRow, "note"> {
  return { note: nota.contenuto.trim() || null };
}
