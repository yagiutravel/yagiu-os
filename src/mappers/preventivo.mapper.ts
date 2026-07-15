import {
  centsToEuro,
  euroToCents,
} from "@/models/preventivo";
import {
  mapDbStatoPreventivoToUi,
  mapUiStatoPreventivoToDb,
} from "@/lib/preventivi/db-enums";
import type {
  PreventivoInsert,
  PreventivoRigaRow,
  PreventivoRow,
  PreventivoUpdate,
} from "@/types/database";
import type {
  CreatePreventivoInput,
  Preventivo,
  PreventivoListItem,
  PreventivoRiga,
  PreventivoRigaInput,
  UpdatePreventivoInput,
} from "@/types/preventivo";

export function mapPreventivoRigaRowToRiga(row: PreventivoRigaRow): PreventivoRiga {
  return {
    id: row.id,
    preventivoId: row.preventivo_id,
    descrizione: row.descrizione,
    quantita: Number(row.quantita),
    prezzoUnitario: centsToEuro(row.prezzo_unitario_cents),
    ordine: row.ordine,
  };
}

type PreventivoContext = {
  clienteNome: string;
  tourNome: string | null;
  righe?: PreventivoRiga[];
};

export function mapPreventivoRowToPreventivo(
  row: PreventivoRow,
  context: PreventivoContext,
): Preventivo {
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id,
    clienteNome: context.clienteNome,
    tourId: row.tour_id,
    tourNome: context.tourNome,
    titolo: row.titolo,
    stato: mapDbStatoPreventivoToUi(row.stato),
    subtotale: centsToEuro(row.subtotale_cents),
    tassePercentuale: Number(row.tasse_percentuale),
    tasse: centsToEuro(row.tasse_cents),
    totale: centsToEuro(row.totale_cents),
    validoFino: row.valido_fino,
    note: row.note,
    partecipanteId: row.partecipante_id,
    righe: context.righe ?? [],
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapPreventivoRowToListItem(
  row: PreventivoRow,
  context: Omit<PreventivoContext, "righe">,
): PreventivoListItem {
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id,
    clienteNome: context.clienteNome,
    tourId: row.tour_id,
    tourNome: context.tourNome,
    titolo: row.titolo,
    stato: mapDbStatoPreventivoToUi(row.stato),
    subtotale: centsToEuro(row.subtotale_cents),
    tassePercentuale: Number(row.tasse_percentuale),
    tasse: centsToEuro(row.tasse_cents),
    totale: centsToEuro(row.totale_cents),
    validoFino: row.valido_fino,
    partecipanteId: row.partecipante_id,
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapCreatePreventivoInputToInsert(
  input: CreatePreventivoInput,
  organizationId: string,
  numero: string,
  totals: { subtotaleCents: number; tasseCents: number; totaleCents: number },
): PreventivoInsert {
  return {
    organization_id: organizationId,
    numero,
    cliente_id: input.clienteId,
    tour_id: input.tourId ?? null,
    titolo: input.titolo?.trim() ?? "",
    stato: mapUiStatoPreventivoToDb(input.stato ?? "Bozza"),
    subtotale_cents: totals.subtotaleCents,
    tasse_percentuale: input.tassePercentuale ?? 22,
    tasse_cents: totals.tasseCents,
    totale_cents: totals.totaleCents,
    valido_fino: input.validoFino ?? null,
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdatePreventivoInputToUpdate(
  input: UpdatePreventivoInput,
  totals?: { subtotaleCents: number; tasseCents: number; totaleCents: number },
): PreventivoUpdate {
  const payload: PreventivoUpdate = {};

  if (input.clienteId !== undefined) payload.cliente_id = input.clienteId;
  if (input.tourId !== undefined) payload.tour_id = input.tourId;
  if (input.titolo !== undefined) payload.titolo = input.titolo.trim();
  if (input.stato !== undefined) payload.stato = mapUiStatoPreventivoToDb(input.stato);
  if (input.tassePercentuale !== undefined) {
    payload.tasse_percentuale = input.tassePercentuale;
  }
  if (input.validoFino !== undefined) payload.valido_fino = input.validoFino;
  if (input.note !== undefined) payload.note = input.note.trim();
  if (totals) {
    payload.subtotale_cents = totals.subtotaleCents;
    payload.tasse_cents = totals.tasseCents;
    payload.totale_cents = totals.totaleCents;
  }

  return payload;
}

export function mapRigaInputToInsert(
  preventivoId: string,
  input: PreventivoRigaInput,
  organizationId: string,
  ordine: number,
) {
  return {
    organization_id: organizationId,
    preventivo_id: preventivoId,
    descrizione: input.descrizione.trim(),
    quantita: input.quantita,
    prezzo_unitario_cents: euroToCents(input.prezzoUnitario),
    ordine,
  };
}
