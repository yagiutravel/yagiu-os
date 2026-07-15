import {
  mapDbDirezioneVoloToUi,
  mapUiDirezioneVoloToDb,
} from "@/lib/tour/db-enums";
import type {
  TourFlightInsert,
  TourFlightRow,
  TourFlightUpdate,
} from "@/types/database";
import type {
  CreateTourFlightInput,
  TourFlight,
  UpdateTourFlightInput,
} from "@/types/tour-flight";

export function mapTourFlightRowToFlight(row: TourFlightRow): TourFlight {
  return {
    id: row.id,
    tourId: row.tour_id,
    dayId: row.day_id,
    direzione: mapDbDirezioneVoloToUi(row.direzione),
    compagnia: row.compagnia,
    numeroVolo: row.numero_volo,
    aeroportoPartenza: row.aeroporto_partenza,
    aeroportoArrivo: row.aeroporto_arrivo,
    dataPartenza: row.data_partenza,
    oraPartenza: row.ora_partenza,
    dataArrivo: row.data_arrivo,
    oraArrivo: row.ora_arrivo,
    note: row.note,
  };
}

export function mapCreateTourFlightInputToInsert(
  input: CreateTourFlightInput,
  organizationId: string,
): TourFlightInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    day_id: input.dayId ?? null,
    direzione: mapUiDirezioneVoloToDb(input.direzione),
    compagnia: input.compagnia?.trim() ?? "",
    numero_volo: input.numeroVolo.trim(),
    aeroporto_partenza: input.aeroportoPartenza.trim(),
    aeroporto_arrivo: input.aeroportoArrivo.trim(),
    data_partenza: input.dataPartenza,
    ora_partenza: input.oraPartenza ?? null,
    data_arrivo: input.dataArrivo ?? null,
    ora_arrivo: input.oraArrivo ?? null,
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdateTourFlightInputToUpdate(
  input: UpdateTourFlightInput,
): TourFlightUpdate {
  const payload: TourFlightUpdate = {};

  if (input.dayId !== undefined) payload.day_id = input.dayId;
  if (input.direzione !== undefined) {
    payload.direzione = mapUiDirezioneVoloToDb(input.direzione);
  }
  if (input.compagnia !== undefined) payload.compagnia = input.compagnia.trim();
  if (input.numeroVolo !== undefined) payload.numero_volo = input.numeroVolo.trim();
  if (input.aeroportoPartenza !== undefined) {
    payload.aeroporto_partenza = input.aeroportoPartenza.trim();
  }
  if (input.aeroportoArrivo !== undefined) {
    payload.aeroporto_arrivo = input.aeroportoArrivo.trim();
  }
  if (input.dataPartenza !== undefined) payload.data_partenza = input.dataPartenza;
  if (input.oraPartenza !== undefined) payload.ora_partenza = input.oraPartenza;
  if (input.dataArrivo !== undefined) payload.data_arrivo = input.dataArrivo;
  if (input.oraArrivo !== undefined) payload.ora_arrivo = input.oraArrivo;
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}
