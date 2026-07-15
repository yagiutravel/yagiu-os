import type { Camera, CameraAssegnazione } from "@/types/camera";
import type { Cliente } from "@/types/cliente";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";
import type { Tour } from "@/types/tour";
import type { DomainSnapshot } from "@/domain/types/snapshot";
import { isTourActive } from "@/domain/helpers/tour";
import {
  listAllRoomAssignments,
  listAllRooms,
} from "@/services/camera.service";
import { getClienti } from "@/services/clienti.service";
import { listAllPartecipazioni } from "@/services/tour-partecipazione.service";
import { getTours } from "@/services/tour.service";

function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function groupPartecipazioniByTour(
  partecipazioni: PartecipazioneTour[],
): Map<string, PartecipazioneTour[]> {
  const map = new Map<string, PartecipazioneTour[]>();
  for (const item of partecipazioni) {
    const list = map.get(item.tourId) ?? [];
    list.push(item);
    map.set(item.tourId, list);
  }
  return map;
}

function groupPartecipazioniByCliente(
  partecipazioni: PartecipazioneTour[],
): Map<string, PartecipazioneTour[]> {
  const map = new Map<string, PartecipazioneTour[]>();
  for (const item of partecipazioni) {
    const list = map.get(item.clienteId) ?? [];
    list.push(item);
    map.set(item.clienteId, list);
  }
  return map;
}

function groupCamereByTour(camere: Camera[]): Map<string, Camera[]> {
  const map = new Map<string, Camera[]>();
  for (const item of camere) {
    const list = map.get(item.tourId) ?? [];
    list.push(item);
    map.set(item.tourId, list);
  }
  return map;
}

function groupAssegnazioniByTour(
  camere: Camera[],
  assegnazioni: CameraAssegnazione[],
): Map<string, CameraAssegnazione[]> {
  const cameraTour = new Map(camere.map((item) => [item.id, item.tourId]));
  const map = new Map<string, CameraAssegnazione[]>();

  for (const item of assegnazioni) {
    const tourId = cameraTour.get(item.cameraId);
    if (!tourId) continue;
    const list = map.get(tourId) ?? [];
    list.push(item);
    map.set(tourId, list);
  }

  return map;
}

function groupAssegnazioniByCamera(
  assegnazioni: CameraAssegnazione[],
): Map<string, CameraAssegnazione[]> {
  const map = new Map<string, CameraAssegnazione[]>();
  for (const item of assegnazioni) {
    const list = map.get(item.cameraId) ?? [];
    list.push(item);
    map.set(item.cameraId, list);
  }
  return map;
}

/** Costruisce uno snapshot di dominio da entità grezze. */
export function buildDomainSnapshot(input: {
  clienti: Cliente[];
  tours: Tour[];
  partecipazioni: PartecipazioneTour[];
  camere: Camera[];
  assegnazioni: CameraAssegnazione[];
  loadedAt?: string;
}): DomainSnapshot {
  const activeTours = input.tours.filter(isTourActive);
  const partecipazioniByTourId = groupPartecipazioniByTour(input.partecipazioni);
  const camereByTourId = groupCamereByTour(input.camere);

  return {
    clienti: input.clienti,
    clientiById: indexById(input.clienti),
    tours: input.tours,
    toursById: indexById(input.tours),
    activeTours,
    partecipazioniByTourId,
    partecipazioniByClienteId: groupPartecipazioniByCliente(
      input.partecipazioni,
    ),
    allPartecipazioni: input.partecipazioni,
    camereByTourId,
    camereById: indexById(input.camere),
    assegnazioniByTourId: groupAssegnazioniByTour(
      input.camere,
      input.assegnazioni,
    ),
    assegnazioniByCameraId: groupAssegnazioniByCamera(input.assegnazioni),
    allCamere: input.camere,
    allAssegnazioni: input.assegnazioni,
    loadedAt: input.loadedAt ?? new Date().toISOString(),
  };
}

/** Carica uno snapshot di dominio dai servizi esistenti (read-only). */
export async function loadDomainSnapshot(): Promise<DomainSnapshot> {
  const [clienti, tours, partecipazioni, camere, assegnazioni] =
    await Promise.all([
      getClienti(),
      getTours(),
      listAllPartecipazioni(),
      listAllRooms(),
      listAllRoomAssignments(),
    ]);

  return buildDomainSnapshot({
    clienti,
    tours,
    partecipazioni,
    camere,
    assegnazioni,
  });
}
