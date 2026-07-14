import {
  mapPartecipazioniToTourClienteViews,
  mapPartecipazioniToViews,
  mapClienteToPartecipazioneView,
} from "@/mappers/tour-partecipazione.mapper";
import {
  deletePartecipazioneMock,
  existsPartecipazioneMock,
  findPartecipazioneByIdMock,
  insertPartecipazioneMock,
  listPartecipazioniByClienteIdMock,
  listPartecipazioniByTourIdMock,
  seedPartecipazioniMock,
  updatePartecipazioneMock,
} from "@/mock/tour-partecipazioni";
import { getClienti } from "@/services/clienti.service";
import type {
  CreatePartecipazioneTourInput,
  PartecipazioneTourView,
  TourClienteView,
  UpdatePartecipazioneTourInput,
} from "@/types/tour-partecipazione";

export class TourPartecipazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourPartecipazioneServiceError";
  }
}

async function getClientiForEnrichment() {
  const clienti = await getClienti();
  seedPartecipazioniMock(clienti);
  return clienti;
}

export async function getPartecipazioniByTourId(
  tourId: string,
): Promise<PartecipazioneTourView[]> {
  const clienti = await getClientiForEnrichment();
  const partecipazioni = listPartecipazioniByTourIdMock(tourId);
  return mapPartecipazioniToViews(partecipazioni, clienti);
}

export async function getTourByClienteId(
  clienteId: string,
): Promise<TourClienteView[]> {
  await getClientiForEnrichment();
  const partecipazioni = listPartecipazioniByClienteIdMock(clienteId);
  return mapPartecipazioniToTourClienteViews(partecipazioni);
}

export async function createPartecipazione(
  input: CreatePartecipazioneTourInput,
): Promise<PartecipazioneTourView> {
  const clienti = await getClientiForEnrichment();

  if (existsPartecipazioneMock(input.tourId, input.clienteId)) {
    throw new TourPartecipazioneServiceError(
      "Questo cliente è già iscritto al tour.",
    );
  }

  const partecipazione = insertPartecipazioneMock(input);
  return mapClienteToPartecipazioneView(partecipazione, clienti);
}

export async function updatePartecipazione(
  id: string,
  input: UpdatePartecipazioneTourInput,
): Promise<PartecipazioneTourView> {
  const clienti = await getClientiForEnrichment();
  const updated = updatePartecipazioneMock(id, input);

  if (!updated) {
    throw new TourPartecipazioneServiceError("Partecipazione non trovata.");
  }

  return mapClienteToPartecipazioneView(updated, clienti);
}

export async function deletePartecipazione(id: string): Promise<void> {
  const deleted = deletePartecipazioneMock(id);

  if (!deleted) {
    throw new TourPartecipazioneServiceError("Partecipazione non trovata.");
  }
}

export async function getPartecipazioneById(
  id: string,
): Promise<PartecipazioneTourView | null> {
  const clienti = await getClientiForEnrichment();
  const partecipazione = findPartecipazioneByIdMock(id);
  if (!partecipazione) return null;
  return mapClienteToPartecipazioneView(partecipazione, clienti);
}
