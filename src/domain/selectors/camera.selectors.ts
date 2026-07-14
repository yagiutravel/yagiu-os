import type { DomainSnapshot } from "@/domain/types/snapshot";
import type { RoomAvailability } from "@/domain/types/analytics";
import {
  getCameraCapienza,
  getCameraOccupazione,
  getCameraPostiLiberi,
  isCameraComplete,
  isCameraIncomplete,
  sortCamereByNumero,
} from "@/domain/helpers/camera";
import type { Camera } from "@/types/camera";
import type { CameraAssegnazione } from "@/types/camera";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";

export function getCamereByTour(
  snapshot: DomainSnapshot,
  tourId: string,
): Camera[] {
  return snapshot.camereByTourId.get(tourId) ?? [];
}

export function getAllCamere(snapshot: DomainSnapshot): Camera[] {
  return snapshot.allCamere;
}

export function getAssegnazioniByTour(
  snapshot: DomainSnapshot,
  tourId: string,
): CameraAssegnazione[] {
  return snapshot.assegnazioniByTourId.get(tourId) ?? [];
}

export function getParticipantsByCamera(
  snapshot: DomainSnapshot,
  cameraId: string,
): PartecipazioneTour[] {
  const assegnazioni = snapshot.assegnazioniByCameraId.get(cameraId) ?? [];
  const partecipazioneIds = new Set(
    assegnazioni.map((item) => item.partecipazioneId),
  );

  return snapshot.allPartecipazioni.filter((item) =>
    partecipazioneIds.has(item.id),
  );
}

export function getUnassignedPartecipantiByTour(
  snapshot: DomainSnapshot,
  tourId: string,
): PartecipazioneTour[] {
  const partecipazioni = snapshot.partecipazioniByTourId.get(tourId) ?? [];
  const assegnazioni = getAssegnazioniByTour(snapshot, tourId);
  const assignedIds = new Set(assegnazioni.map((item) => item.partecipazioneId));

  return partecipazioni.filter((item) => !assignedIds.has(item.id));
}

export function getRoomAvailability(
  snapshot: DomainSnapshot,
  tourId?: string,
): RoomAvailability[] {
  const camere = tourId
    ? getCamereByTour(snapshot, tourId)
    : snapshot.allCamere;

  return sortCamereByNumero(camere).map((camera) => {
    const assegnazioni =
      snapshot.assegnazioniByCameraId.get(camera.id) ?? [];
    const capienza = getCameraCapienza(camera);
    const occupazione = getCameraOccupazione(camera, assegnazioni);

    return {
      tourId: camera.tourId,
      cameraId: camera.id,
      numero: camera.numero,
      tipologia: camera.tipologia,
      capienza,
      occupazione,
      postiLiberi: getCameraPostiLiberi(camera, assegnazioni),
      completa: isCameraComplete(camera, assegnazioni),
    };
  });
}

export function getIncompleteCamere(snapshot: DomainSnapshot): Camera[] {
  return snapshot.allCamere.filter((camera) => {
    const assegnazioni =
      snapshot.assegnazioniByCameraId.get(camera.id) ?? [];
    return isCameraIncomplete(camera, assegnazioni);
  });
}

export function getCompleteCamere(snapshot: DomainSnapshot): Camera[] {
  return snapshot.allCamere.filter((camera) => {
    const assegnazioni =
      snapshot.assegnazioniByCameraId.get(camera.id) ?? [];
    return isCameraComplete(camera, assegnazioni);
  });
}

export function getRoomingTotals(snapshot: DomainSnapshot) {
  const availability = getRoomAvailability(snapshot);
  const postiTotali = availability.reduce((sum, item) => sum + item.capienza, 0);
  const postiOccupati = availability.reduce(
    (sum, item) => sum + item.occupazione,
    0,
  );

  return {
    camere: availability.length,
    camereComplete: availability.filter((item) => item.completa).length,
    camereIncomplete: availability.filter((item) => !item.completa).length,
    postiDisponibili: Math.max(postiTotali - postiOccupati, 0),
    postiOccupati,
    overbooking: availability.reduce(
      (sum, item) => sum + Math.max(item.occupazione - item.capienza, 0),
      0,
    ),
  };
}

export function getTourWithMostIncompleteRooms(
  snapshot: DomainSnapshot,
): string | null {
  let tourId: string | null = null;
  let maxIncomplete = 0;

  for (const tour of snapshot.activeTours) {
    const camere = getCamereByTour(snapshot, tour.id);
    const incomplete = camere.filter((camera) => {
      const assegnazioni =
        snapshot.assegnazioniByCameraId.get(camera.id) ?? [];
      return isCameraIncomplete(camera, assegnazioni);
    }).length;

    if (incomplete > maxIncomplete) {
      maxIncomplete = incomplete;
      tourId = tour.id;
    }
  }

  return tourId;
}
