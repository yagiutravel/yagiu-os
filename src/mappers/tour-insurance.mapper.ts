import {
  mapDbStatoAssicurazioneToUi,
  mapUiStatoAssicurazioneToDb,
} from "@/lib/tour/db-enums";
import type {
  TourInsuranceInsert,
  TourInsuranceRow,
  TourInsuranceUpdate,
} from "@/types/database";
import type {
  CreateTourInsuranceInput,
  TourInsurance,
  UpdateTourInsuranceInput,
} from "@/types/tour-insurance";

function centsToEuro(cents: number): number {
  return cents / 100;
}

function euroToCents(euro: number): number {
  return Math.round(euro * 100);
}

export function mapTourInsuranceRowToInsurance(row: TourInsuranceRow): TourInsurance {
  return {
    id: row.id,
    tourId: row.tour_id,
    fornitore: row.fornitore,
    polizzaNumero: row.polizza_numero,
    copertura: row.copertura,
    premio: centsToEuro(row.premio_cents),
    dataInizio: row.data_inizio,
    dataFine: row.data_fine,
    stato: mapDbStatoAssicurazioneToUi(row.stato),
    note: row.note,
  };
}

export function mapCreateTourInsuranceInputToInsert(
  input: CreateTourInsuranceInput,
  organizationId: string,
): TourInsuranceInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    fornitore: input.fornitore.trim(),
    polizza_numero: input.polizzaNumero?.trim() ?? "",
    copertura: input.copertura?.trim() ?? "",
    premio_cents: euroToCents(input.premio ?? 0),
    data_inizio: input.dataInizio ?? null,
    data_fine: input.dataFine ?? null,
    stato: mapUiStatoAssicurazioneToDb(input.stato ?? "Da emettere"),
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdateTourInsuranceInputToUpdate(
  input: UpdateTourInsuranceInput,
): TourInsuranceUpdate {
  const payload: TourInsuranceUpdate = {};

  if (input.fornitore !== undefined) payload.fornitore = input.fornitore.trim();
  if (input.polizzaNumero !== undefined) {
    payload.polizza_numero = input.polizzaNumero.trim();
  }
  if (input.copertura !== undefined) payload.copertura = input.copertura.trim();
  if (input.premio !== undefined) payload.premio_cents = euroToCents(input.premio);
  if (input.dataInizio !== undefined) payload.data_inizio = input.dataInizio;
  if (input.dataFine !== undefined) payload.data_fine = input.dataFine;
  if (input.stato !== undefined) {
    payload.stato = mapUiStatoAssicurazioneToDb(input.stato);
  }
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}
