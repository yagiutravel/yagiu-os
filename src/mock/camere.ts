import {
  createCamera,
  createCameraAssegnazione,
} from "@/models/camera";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";
import type {
  Camera,
  CameraAssegnazione,
  CreateCameraInput,
  UpdateCameraInput,
} from "@/types/camera";

const camereStore: Camera[] = [];
const assegnazioniStore: CameraAssegnazione[] = [];
let seeded = false;

export function seedCamereMock(partecipazioni: PartecipazioneTour[]): void {
  if (seeded) return;

  const tour1Partecipazioni = partecipazioni.filter(
    (item) => item.tourId === "tour-1",
  );

  if (tour1Partecipazioni.length === 0) {
    seeded = true;
    return;
  }

  const cameraDoppia = createCamera({
    tourId: "tour-1",
    numero: "101",
    tipologia: "Doppia",
    note: "Vista mare, piano alto.",
  });

  const cameraSingola = createCamera({
    tourId: "tour-1",
    numero: "102",
    tipologia: "Singola",
    note: "",
  });

  camereStore.push(cameraDoppia, cameraSingola);

  if (tour1Partecipazioni[0]) {
    assegnazioniStore.push(
      createCameraAssegnazione(cameraDoppia.id, tour1Partecipazioni[0].id),
    );
  }

  if (tour1Partecipazioni[1]) {
    assegnazioniStore.push(
      createCameraAssegnazione(cameraDoppia.id, tour1Partecipazioni[1].id),
    );
  } else if (tour1Partecipazioni[0]) {
    assegnazioniStore.push(
      createCameraAssegnazione(cameraSingola.id, tour1Partecipazioni[0].id),
    );
  }

  seeded = true;
}

export function listCamereMock(): Camera[] {
  return [...camereStore];
}

export function listCamereByTourIdMock(tourId: string): Camera[] {
  return camereStore.filter((item) => item.tourId === tourId);
}

export function findCameraByIdMock(id: string): Camera | undefined {
  return camereStore.find((item) => item.id === id);
}

export function existsCameraNumeroMock(
  tourId: string,
  numero: string,
  excludeId?: string,
): boolean {
  const normalized = numero.trim().toLowerCase();
  return camereStore.some(
    (item) =>
      item.tourId === tourId &&
      item.numero.trim().toLowerCase() === normalized &&
      item.id !== excludeId,
  );
}

export function insertCameraMock(input: CreateCameraInput): Camera {
  const camera = createCamera(input);
  camereStore.push(camera);
  return camera;
}

export function updateCameraMock(
  id: string,
  input: UpdateCameraInput,
): Camera | null {
  const index = camereStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = camereStore[index];
  const updated: Camera = {
    ...current,
    ...input,
    numero: input.numero !== undefined ? input.numero.trim() : current.numero,
    note: input.note !== undefined ? input.note.trim() : current.note,
    aggiornatoIl: new Date().toISOString(),
  };

  camereStore[index] = updated;
  return updated;
}

export function deleteCameraMock(id: string): boolean {
  const index = camereStore.findIndex((item) => item.id === id);
  if (index === -1) return false;

  camereStore.splice(index, 1);

  for (let i = assegnazioniStore.length - 1; i >= 0; i -= 1) {
    if (assegnazioniStore[i].cameraId === id) {
      assegnazioniStore.splice(i, 1);
    }
  }

  return true;
}

export function listAssegnazioniMock(): CameraAssegnazione[] {
  return [...assegnazioniStore];
}

export function listAssegnazioniByCameraIdMock(
  cameraId: string,
): CameraAssegnazione[] {
  return assegnazioniStore.filter((item) => item.cameraId === cameraId);
}

export function listAssegnazioniByTourIdMock(tourId: string): CameraAssegnazione[] {
  const cameraIds = new Set(
    camereStore.filter((item) => item.tourId === tourId).map((item) => item.id),
  );
  return assegnazioniStore.filter((item) => cameraIds.has(item.cameraId));
}

export function findAssegnazioneByPartecipazioneIdMock(
  partecipazioneId: string,
): CameraAssegnazione | undefined {
  return assegnazioniStore.find(
    (item) => item.partecipazioneId === partecipazioneId,
  );
}

export function countAssegnazioniByCameraIdMock(cameraId: string): number {
  return assegnazioniStore.filter((item) => item.cameraId === cameraId).length;
}

export function insertAssegnazioneMock(
  cameraId: string,
  partecipazioneId: string,
): CameraAssegnazione {
  const assegnazione = createCameraAssegnazione(cameraId, partecipazioneId);
  assegnazioniStore.push(assegnazione);
  return assegnazione;
}

export function deleteAssegnazioneMock(id: string): boolean {
  const index = assegnazioniStore.findIndex((item) => item.id === id);
  if (index === -1) return false;
  assegnazioniStore.splice(index, 1);
  return true;
}

export function deleteAssegnazioneByPartecipazioneIdMock(
  partecipazioneId: string,
): boolean {
  const index = assegnazioniStore.findIndex(
    (item) => item.partecipazioneId === partecipazioneId,
  );
  if (index === -1) return false;
  assegnazioniStore.splice(index, 1);
  return true;
}

export function resetCamereMockForTests(): void {
  camereStore.length = 0;
  assegnazioniStore.length = 0;
  seeded = false;
}
