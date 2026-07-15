import {
  mapDbTipoTransferToUi,
  mapUiTipoTransferToDb,
} from "@/lib/tour/db-enums";
import type {
  TourTransferInsert,
  TourTransferRow,
  TourTransferUpdate,
} from "@/types/database";
import type {
  CreateTourTransferInput,
  TourTransfer,
  UpdateTourTransferInput,
} from "@/types/tour-transfer";

export function mapTourTransferRowToTransfer(row: TourTransferRow): TourTransfer {
  return {
    id: row.id,
    tourId: row.tour_id,
    dayId: row.day_id,
    tipo: mapDbTipoTransferToUi(row.tipo),
    partenza: row.partenza,
    destinazione: row.destinazione,
    data: row.data,
    ora: row.ora,
    fornitore: row.fornitore,
    note: row.note,
  };
}

export function mapCreateTourTransferInputToInsert(
  input: CreateTourTransferInput,
  organizationId: string,
): TourTransferInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    day_id: input.dayId ?? null,
    tipo: mapUiTipoTransferToDb(input.tipo ?? "Bus"),
    partenza: input.partenza.trim(),
    destinazione: input.destinazione.trim(),
    data: input.data,
    ora: input.ora ?? null,
    fornitore: input.fornitore?.trim() ?? "",
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdateTourTransferInputToUpdate(
  input: UpdateTourTransferInput,
): TourTransferUpdate {
  const payload: TourTransferUpdate = {};

  if (input.dayId !== undefined) payload.day_id = input.dayId;
  if (input.tipo !== undefined) payload.tipo = mapUiTipoTransferToDb(input.tipo);
  if (input.partenza !== undefined) payload.partenza = input.partenza.trim();
  if (input.destinazione !== undefined) {
    payload.destinazione = input.destinazione.trim();
  }
  if (input.data !== undefined) payload.data = input.data;
  if (input.ora !== undefined) payload.ora = input.ora;
  if (input.fornitore !== undefined) payload.fornitore = input.fornitore.trim();
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}
