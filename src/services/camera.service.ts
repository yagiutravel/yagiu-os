import {
  mapCameraToView,
  mapCamereToViews,
  computeRoomingRiepilogo,
} from "@/mappers/camera.mapper";
import {
  countAssegnazioniByCameraIdMock,
  deleteAssegnazioneByPartecipazioneIdMock,
  deleteAssegnazioneMock,
  deleteCameraMock,
  existsCameraNumeroMock,
  findAssegnazioneByPartecipazioneIdMock,
  findCameraByIdMock,
  insertAssegnazioneMock,
  insertCameraMock,
  listAssegnazioniByTourIdMock,
  listCamereByTourIdMock,
  seedCamereMock,
  updateCameraMock,
} from "@/mock/camere";
import {
  getCapienzaFromTipologia,
} from "@/models/camera";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { listPartecipazioniMock } from "@/mock/tour-partecipazioni";
import type {
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

async function ensureCamereSeeded(tourId: string) {
  await getPartecipazioniByTourId(tourId);
  seedCamereMock(listPartecipazioniMock());
}

export async function getCamereByTourId(tourId: string): Promise<CameraView[]> {
  await ensureCamereSeeded(tourId);

  const partecipazioni = await getPartecipazioniByTourId(tourId);
  const camere = listCamereByTourIdMock(tourId);
  const assegnazioni = listAssegnazioniByTourIdMock(tourId);

  return mapCamereToViews(camere, assegnazioni, partecipazioni);
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

export async function createCamera(
  input: CreateCameraInput,
): Promise<CameraView> {
  await ensureCamereSeeded(input.tourId);

  const numero = input.numero.trim();
  if (!numero) {
    throw new CameraServiceError("Inserisci il numero camera.");
  }

  if (existsCameraNumeroMock(input.tourId, numero)) {
    throw new CameraServiceError("Esiste già una camera con questo numero.");
  }

  const camera = insertCameraMock({ ...input, numero });
  const partecipazioni = await getPartecipazioniByTourId(input.tourId);
  const assegnazioni = listAssegnazioniByTourIdMock(input.tourId);

  return mapCameraToView(camera, assegnazioni, partecipazioni);
}

export async function updateCamera(
  id: string,
  input: UpdateCameraInput,
): Promise<CameraView> {
  const current = findCameraByIdMock(id);
  if (!current) {
    throw new CameraServiceError("Camera non trovata.");
  }

  await ensureCamereSeeded(current.tourId);

  if (input.numero !== undefined) {
    const numero = input.numero.trim();
    if (!numero) {
      throw new CameraServiceError("Inserisci il numero camera.");
    }
    if (existsCameraNumeroMock(current.tourId, numero, id)) {
      throw new CameraServiceError("Esiste già una camera con questo numero.");
    }
  }

  const tipologia = input.tipologia ?? current.tipologia;
  const occupazione = countAssegnazioniByCameraIdMock(id);
  const capienza = getCapienzaFromTipologia(tipologia);

  if (occupazione > capienza) {
    throw new CameraServiceError(
      `La tipologia selezionata ammette al massimo ${capienza} ${
        capienza === 1 ? "posto" : "posti"
      }. Rimuovi prima alcuni partecipanti.`,
    );
  }

  const updated = updateCameraMock(id, input);
  if (!updated) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const partecipazioni = await getPartecipazioniByTourId(current.tourId);
  const assegnazioni = listAssegnazioniByTourIdMock(current.tourId);

  return mapCameraToView(updated, assegnazioni, partecipazioni);
}

export async function deleteCamera(id: string): Promise<void> {
  const current = findCameraByIdMock(id);
  if (!current) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const deleted = deleteCameraMock(id);
  if (!deleted) {
    throw new CameraServiceError("Camera non trovata.");
  }
}

function assertCameraHasCapacity(cameraId: string): void {
  const camera = findCameraByIdMock(cameraId);
  if (!camera) {
    throw new CameraServiceError("Camera non trovata.");
  }

  const occupazione = countAssegnazioniByCameraIdMock(cameraId);
  const capienza = getCapienzaFromTipologia(camera.tipologia);

  if (occupazione >= capienza) {
    throw new CameraServiceError(
      `La camera ${camera.numero} è al completo (${occupazione}/${capienza}).`,
    );
  }
}

export async function assignPartecipanteToCamera(
  cameraId: string,
  partecipazioneId: string,
): Promise<CameraView> {
  const camera = findCameraByIdMock(cameraId);
  if (!camera) {
    throw new CameraServiceError("Camera non trovata.");
  }

  await ensureCamereSeeded(camera.tourId);

  const partecipazioni = await getPartecipazioniByTourId(camera.tourId);
  const partecipazione = partecipazioni.find(
    (item) => item.id === partecipazioneId,
  );

  if (!partecipazione) {
    throw new CameraServiceError("Partecipante non trovato nel tour.");
  }

  const existing = findAssegnazioneByPartecipazioneIdMock(partecipazioneId);
  if (existing) {
    throw new CameraServiceError(
      "Questo partecipante è già assegnato a una camera.",
    );
  }

  assertCameraHasCapacity(cameraId);
  insertAssegnazioneMock(cameraId, partecipazioneId);

  const assegnazioni = listAssegnazioniByTourIdMock(camera.tourId);
  return mapCameraToView(camera, assegnazioni, partecipazioni);
}

export async function removePartecipanteFromCamera(
  partecipazioneId: string,
): Promise<void> {
  const assegnazione = findAssegnazioneByPartecipazioneIdMock(partecipazioneId);
  if (!assegnazione) {
    throw new CameraServiceError("Assegnazione non trovata.");
  }

  const deleted = deleteAssegnazioneByPartecipazioneIdMock(partecipazioneId);
  if (!deleted) {
    throw new CameraServiceError("Assegnazione non trovata.");
  }
}

export async function movePartecipanteToCamera(
  partecipazioneId: string,
  targetCameraId: string,
): Promise<CameraView> {
  const assegnazione = findAssegnazioneByPartecipazioneIdMock(partecipazioneId);
  if (!assegnazione) {
    throw new CameraServiceError("Il partecipante non è assegnato a nessuna camera.");
  }

  if (assegnazione.cameraId === targetCameraId) {
    throw new CameraServiceError("Il partecipante è già in questa camera.");
  }

  const targetCamera = findCameraByIdMock(targetCameraId);
  if (!targetCamera) {
    throw new CameraServiceError("Camera di destinazione non trovata.");
  }

  const sourceCamera = findCameraByIdMock(assegnazione.cameraId);
  if (!sourceCamera || sourceCamera.tourId !== targetCamera.tourId) {
    throw new CameraServiceError("Le camere devono appartenere allo stesso tour.");
  }

  assertCameraHasCapacity(targetCameraId);

  deleteAssegnazioneMock(assegnazione.id);
  insertAssegnazioneMock(targetCameraId, partecipazioneId);

  const partecipazioni = await getPartecipazioniByTourId(targetCamera.tourId);
  const assegnazioni = listAssegnazioniByTourIdMock(targetCamera.tourId);

  return mapCameraToView(targetCamera, assegnazioni, partecipazioni);
}
