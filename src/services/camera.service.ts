import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCameraToView,
  mapCamereToViews,
  computeRoomingRiepilogo,
} from "@/mappers/camera.mapper";
import {
  mapCreateCameraInputToInsert,
  mapRoomAssignmentRowToAssegnazione,
  mapTourRoomRowToCamera,
  mapUpdateCameraInputToUpdate,
} from "@/mappers/tour-room.mapper";
import { getCapienzaFromTipologia } from "@/models/camera";
import { recordAuditLog } from "@/services/audit-log-record.service";
import { getHotelsByTourId } from "@/services/tour-hotel.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type {
  RoomAssignmentRow,
  TourRoomRow,
} from "@/types/database";
import type {
  Camera,
  CameraAssegnazione,
  CameraView,
  CreateCameraInput,
  RoomingRiepilogo,
  UpdateCameraInput,
} from "@/types/camera";

export class CameraServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CameraServiceError";
  }
}

const ROOMS_TABLE = "tour_rooms";
const ASSIGNMENTS_TABLE = "room_assignments";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new CameraServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function fetchRoomsByTourId(tourId: string): Promise<Camera[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const [hotels, { data, error }] = await Promise.all([
    getHotelsByTourId(tourId),
    supabase
      .from(ROOMS_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .eq("tour_id", tourId)
      .order("numero", { ascending: true }),
  ]);

  if (error) handleSupabaseError("fetchRoomsByTourId", error);

  const hotelsById = new Map(hotels.map((hotel) => [hotel.id, hotel.nome]));

  return ((data ?? []) as TourRoomRow[]).map((row) =>
    mapTourRoomRowToCamera(row, row.hotel_id ? hotelsById.get(row.hotel_id) ?? null : null),
  );
}

async function fetchAssignmentsByTourId(
  tourId: string,
): Promise<CameraAssegnazione[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: rooms, error: roomsError } = await supabase
    .from(ROOMS_TABLE)
    .select("id")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId);

  if (roomsError) handleSupabaseError("fetchAssignmentsRooms", roomsError);

  const roomIds = (rooms ?? []).map((room) => room.id);
  if (roomIds.length === 0) return [];

  const { data, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .in("room_id", roomIds);

  if (error) handleSupabaseError("fetchAssignmentsByTourId", error);

  return ((data ?? []) as RoomAssignmentRow[]).map(mapRoomAssignmentRowToAssegnazione);
}

export async function listAllRooms(): Promise<Camera[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(ROOMS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("numero", { ascending: true });

  if (error) handleSupabaseError("listAllRooms", error);

  return ((data ?? []) as TourRoomRow[]).map((row) => mapTourRoomRowToCamera(row));
}

export async function listAllRoomAssignments(): Promise<CameraAssegnazione[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("listAllRoomAssignments", error);

  return ((data ?? []) as RoomAssignmentRow[]).map(mapRoomAssignmentRowToAssegnazione);
}

async function buildCameraViews(tourId: string): Promise<CameraView[]> {
  const [camere, assegnazioni, partecipazioni] = await Promise.all([
    fetchRoomsByTourId(tourId),
    fetchAssignmentsByTourId(tourId),
    getPartecipazioniByTourId(tourId),
  ]);

  return mapCamereToViews(camere, assegnazioni, partecipazioni);
}

export async function getCamereByTourId(tourId: string): Promise<CameraView[]> {
  return buildCameraViews(tourId);
}

export async function getRoomingRiepilogoByTourId(
  tourId: string,
): Promise<RoomingRiepilogo> {
  const [camere, partecipazioni] = await Promise.all([
    getCamereByTourId(tourId),
    getPartecipazioniByTourId(tourId),
  ]);

  return computeRoomingRiepilogo(camere, partecipazioni.length);
}

async function findRoomById(id: string): Promise<Camera | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(ROOMS_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("findRoomById", error);
  if (!data) return null;

  const row = data as TourRoomRow;
  let hotelNome: string | null = null;

  if (row.hotel_id) {
    const hotels = await getHotelsByTourId(row.tour_id);
    hotelNome = hotels.find((hotel) => hotel.id === row.hotel_id)?.nome ?? null;
  }

  return mapTourRoomRowToCamera(row, hotelNome);
}

async function roomNumeroExists(
  tourId: string,
  numero: string,
  excludeId?: string,
): Promise<boolean> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  let query = supabase
    .from(ROOMS_TABLE)
    .select("id")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .eq("numero", numero);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) handleSupabaseError("roomNumeroExists", error);
  return Boolean(data);
}

export async function createCamera(
  input: CreateCameraInput,
): Promise<CameraView> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const numero = input.numero.trim();
  if (!numero) {
    throw new CameraServiceError("Inserisci il numero camera.");
  }

  if (await roomNumeroExists(input.tourId, numero)) {
    throw new CameraServiceError("Esiste già una camera con questo numero.");
  }

  const { data, error } = await supabase
    .from(ROOMS_TABLE)
    .insert(mapCreateCameraInputToInsert(input, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createCamera", error);

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "nota_interna",
    titolo: `Camera ${numero} creata`,
    descrizione: `Tipologia ${input.tipologia}.`,
  });

  const camera = mapTourRoomRowToCamera(data as TourRoomRow);

  await recordAuditLog({
    azione: `Camera ${numero} creata`,
    tipo: "camera",
    azioneTipo: "creato",
    entitaId: camera.id,
    entitaLabel: `Camera ${numero}`,
  });

  const partecipazioni = await getPartecipazioniByTourId(input.tourId);

  return mapCameraToView(camera, [], partecipazioni);
}

export async function updateCamera(
  id: string,
  input: UpdateCameraInput,
): Promise<CameraView> {
  const current = await findRoomById(id);
  if (!current) {
    throw new CameraServiceError("Camera non trovata.");
  }

  if (input.numero !== undefined) {
    const numero = input.numero.trim();
    if (!numero) {
      throw new CameraServiceError("Inserisci il numero camera.");
    }
    if (await roomNumeroExists(current.tourId, numero, id)) {
      throw new CameraServiceError("Esiste già una camera con questo numero.");
    }
  }

  const tipologia = input.tipologia ?? current.tipologia;
  const capienza = getCapienzaFromTipologia(tipologia);
  const views = await buildCameraViews(current.tourId);
  const currentView = views.find((item) => item.id === id);
  const occupazione = currentView?.occupazione ?? 0;

  if (occupazione > capienza) {
    throw new CameraServiceError(
      `La tipologia selezionata ammette al massimo ${capienza} ${
        capienza === 1 ? "posto" : "posti"
      }. Rimuovi prima alcuni partecipanti.`,
    );
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(ROOMS_TABLE)
    .update(mapUpdateCameraInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateCamera", error);

  await recordAuditLog({
    azione: "Camera cambiata",
    tipo: "camera",
    azioneTipo: "cambiato",
    entitaId: id,
    entitaLabel: `Camera ${current.numero}`,
  });

  return (await buildCameraViews(current.tourId)).find((item) => item.id === id)!;
}

export async function deleteCamera(id: string): Promise<void> {
  const current = await findRoomById(id);
  if (!current) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(ROOMS_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteCamera", error);

  await recordAuditLog({
    azione: "Camera eliminata",
    tipo: "camera",
    azioneTipo: "eliminato",
    entitaId: id,
    entitaLabel: `Camera ${current.numero}`,
  });
}

async function countAssignmentsByRoomId(roomId: string): Promise<number> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("room_id", roomId);

  if (error) handleSupabaseError("countAssignmentsByRoomId", error);
  return count ?? 0;
}

async function findAssignmentByParticipantId(
  participantId: string,
): Promise<CameraAssegnazione | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("participant_id", participantId)
    .maybeSingle();

  if (error) handleSupabaseError("findAssignmentByParticipantId", error);
  if (!data) return null;

  return mapRoomAssignmentRowToAssegnazione(data as RoomAssignmentRow);
}

async function assertRoomHasCapacity(roomId: string): Promise<void> {
  const room = await findRoomById(roomId);
  if (!room) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const occupazione = await countAssignmentsByRoomId(roomId);
  const capienza = getCapienzaFromTipologia(room.tipologia);

  if (occupazione >= capienza) {
    throw new CameraServiceError(
      `La camera ${room.numero} è al completo (${occupazione}/${capienza}).`,
    );
  }
}

export async function assignPartecipanteToCamera(
  cameraId: string,
  partecipazioneId: string,
): Promise<CameraView> {
  const camera = await findRoomById(cameraId);
  if (!camera) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const partecipazioni = await getPartecipazioniByTourId(camera.tourId);
  const partecipazione = partecipazioni.find(
    (item) => item.id === partecipazioneId,
  );

  if (!partecipazione) {
    throw new CameraServiceError("Partecipante non trovato nel tour.");
  }

  const existing = await findAssignmentByParticipantId(partecipazioneId);
  if (existing) {
    throw new CameraServiceError(
      "Questo partecipante è già assegnato a una camera.",
    );
  }

  await assertRoomHasCapacity(cameraId);

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(ASSIGNMENTS_TABLE).insert({
    organization_id: organizationId,
    room_id: cameraId,
    participant_id: partecipazioneId,
  });

  if (error) handleSupabaseError("assignPartecipanteToCamera", error);

  await recordTourTimelineEvent({
    tourId: camera.tourId,
    tipo: "nota_interna",
    titolo: `Rooming: camera ${camera.numero}`,
    descrizione: `${partecipazione.clienteNome} assegnato alla camera.`,
  });

  return (await buildCameraViews(camera.tourId)).find((item) => item.id === cameraId)!;
}

export async function removePartecipanteFromCamera(
  partecipazioneId: string,
): Promise<void> {
  const assegnazione = await findAssignmentByParticipantId(partecipazioneId);
  if (!assegnazione) {
    throw new CameraServiceError("Assegnazione non trovata.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .delete()
    .eq("id", assegnazione.id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("removePartecipanteFromCamera", error);
}

export async function movePartecipanteToCamera(
  partecipazioneId: string,
  targetCameraId: string,
): Promise<CameraView> {
  const assegnazione = await findAssignmentByParticipantId(partecipazioneId);
  if (!assegnazione) {
    throw new CameraServiceError("Il partecipante non è assegnato a nessuna camera.");
  }

  if (assegnazione.cameraId === targetCameraId) {
    throw new CameraServiceError("Il partecipante è già in questa camera.");
  }

  const targetCamera = await findRoomById(targetCameraId);
  const sourceCamera = await findRoomById(assegnazione.cameraId);

  if (!targetCamera || !sourceCamera || sourceCamera.tourId !== targetCamera.tourId) {
    throw new CameraServiceError("Le camere devono appartenere allo stesso tour.");
  }

  await assertRoomHasCapacity(targetCameraId);

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error: deleteError } = await supabase
    .from(ASSIGNMENTS_TABLE)
    .delete()
    .eq("id", assegnazione.id)
    .eq("organization_id", organizationId);

  if (deleteError) handleSupabaseError("movePartecipanteDelete", deleteError);

  const { error: insertError } = await supabase.from(ASSIGNMENTS_TABLE).insert({
    organization_id: organizationId,
    room_id: targetCameraId,
    participant_id: partecipazioneId,
  });

  if (insertError) handleSupabaseError("movePartecipanteInsert", insertError);

  return (await buildCameraViews(targetCamera.tourId)).find(
    (item) => item.id === targetCameraId,
  )!;
}
