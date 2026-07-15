import {
  mapDbTipologiaToUi,
  mapUiTipologiaToDb,
} from "@/lib/tour/db-enums";
import { getCapienzaFromTipologia } from "@/models/camera";
import type {
  RoomAssignmentRow,
  TourRoomInsert,
  TourRoomRow,
  TourRoomUpdate,
} from "@/types/database";
import type {
  Camera,
  CameraAssegnazione,
  CreateCameraInput,
  UpdateCameraInput,
} from "@/types/camera";

export function mapTourRoomRowToCamera(
  row: TourRoomRow,
  hotelNome: string | null = null,
): Camera {
  return {
    id: row.id,
    tourId: row.tour_id,
    hotelId: row.hotel_id,
    hotelNome,
    numero: row.numero,
    tipologia: mapDbTipologiaToUi(row.tipologia),
    note: row.note,
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapRoomAssignmentRowToAssegnazione(
  row: RoomAssignmentRow,
): CameraAssegnazione {
  return {
    id: row.id,
    cameraId: row.room_id,
    partecipazioneId: row.participant_id,
    creatoIl: row.created_at,
  };
}

export function mapCreateCameraInputToInsert(
  input: CreateCameraInput,
  organizationId: string,
): TourRoomInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    hotel_id: input.hotelId ?? null,
    numero: input.numero.trim(),
    tipologia: mapUiTipologiaToDb(input.tipologia),
    capienza: getCapienzaFromTipologia(input.tipologia),
    note: input.note?.trim() ?? "",
  };
}

export function mapUpdateCameraInputToUpdate(
  input: UpdateCameraInput,
): TourRoomUpdate {
  const payload: TourRoomUpdate = {};

  if (input.hotelId !== undefined) payload.hotel_id = input.hotelId;
  if (input.numero !== undefined) payload.numero = input.numero.trim();
  if (input.tipologia !== undefined) {
    payload.tipologia = mapUiTipologiaToDb(input.tipologia);
    payload.capienza = getCapienzaFromTipologia(input.tipologia);
  }
  if (input.note !== undefined) payload.note = input.note.trim();

  return payload;
}
