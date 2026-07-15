import {
  mapDbTipoAttivitaToUi,
  mapUiTipoAttivitaToDb,
} from "@/lib/tour/db-enums";
import type {
  TourProgramActivityInsert,
  TourProgramActivityRow,
  TourProgramActivityUpdate,
  TourProgramDayInsert,
  TourProgramDayRow,
  TourProgramDayUpdate,
} from "@/types/database";
import type {
  CreateProgramActivityInput,
  CreateProgramDayInput,
  TourProgramActivity,
  TourProgramDay,
  UpdateProgramActivityInput,
  UpdateProgramDayInput,
} from "@/types/tour-program";

export function mapTourProgramActivityRowToActivity(
  row: TourProgramActivityRow,
): TourProgramActivity {
  return {
    id: row.id,
    tourId: row.tour_id,
    dayId: row.day_id,
    titolo: row.titolo,
    descrizione: row.descrizione,
    oraInizio: row.ora_inizio,
    oraFine: row.ora_fine,
    luogo: row.luogo,
    tipo: mapDbTipoAttivitaToUi(row.tipo),
    ordine: row.ordine,
  };
}

export function mapTourProgramDayRowToDay(
  row: TourProgramDayRow,
  attivita: TourProgramActivity[] = [],
  hotelNome: string | null = null,
): TourProgramDay {
  return {
    id: row.id,
    tourId: row.tour_id,
    giornoNumero: row.giorno_numero,
    data: row.data,
    titolo: row.titolo,
    descrizione: row.descrizione,
    hotelId: row.hotel_id,
    hotelNome,
    ordine: row.ordine,
    attivita,
  };
}

export function mapCreateProgramDayInputToInsert(
  input: CreateProgramDayInput,
  organizationId: string,
): TourProgramDayInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    giorno_numero: input.giornoNumero,
    data: input.data ?? null,
    titolo: input.titolo?.trim() ?? "",
    descrizione: input.descrizione?.trim() ?? "",
    hotel_id: input.hotelId ?? null,
    ordine: input.ordine ?? input.giornoNumero,
  };
}

export function mapUpdateProgramDayInputToUpdate(
  input: UpdateProgramDayInput,
): TourProgramDayUpdate {
  const payload: TourProgramDayUpdate = {};

  if (input.data !== undefined) payload.data = input.data;
  if (input.titolo !== undefined) payload.titolo = input.titolo.trim();
  if (input.descrizione !== undefined) payload.descrizione = input.descrizione.trim();
  if (input.hotelId !== undefined) payload.hotel_id = input.hotelId;
  if (input.ordine !== undefined) payload.ordine = input.ordine;

  return payload;
}

export function mapCreateProgramActivityInputToInsert(
  input: CreateProgramActivityInput,
  organizationId: string,
): TourProgramActivityInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    day_id: input.dayId,
    titolo: input.titolo.trim(),
    descrizione: input.descrizione?.trim() ?? "",
    ora_inizio: input.oraInizio ?? null,
    ora_fine: input.oraFine ?? null,
    luogo: input.luogo?.trim() ?? "",
    tipo: mapUiTipoAttivitaToDb(input.tipo ?? "Visita"),
    ordine: input.ordine ?? 0,
  };
}

export function mapUpdateProgramActivityInputToUpdate(
  input: UpdateProgramActivityInput,
): TourProgramActivityUpdate {
  const payload: TourProgramActivityUpdate = {};

  if (input.titolo !== undefined) payload.titolo = input.titolo.trim();
  if (input.descrizione !== undefined) payload.descrizione = input.descrizione.trim();
  if (input.oraInizio !== undefined) payload.ora_inizio = input.oraInizio;
  if (input.oraFine !== undefined) payload.ora_fine = input.oraFine;
  if (input.luogo !== undefined) payload.luogo = input.luogo.trim();
  if (input.tipo !== undefined) payload.tipo = mapUiTipoAttivitaToDb(input.tipo);
  if (input.ordine !== undefined) payload.ordine = input.ordine;

  return payload;
}
