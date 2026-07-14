import {
  createTourSeedRecord,
  deleteTourMock,
  findTourByIdMock,
  insertTourMock,
  listToursMock,
  updateTourMock,
} from "@/mock/tours";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { invalidateGlobalSearchIndex } from "@/services/global-search.service";
import type {
  CreateTourInput,
  Tour,
  UpdateTourInput,
} from "@/types/tour";
import type { TourDettaglio } from "@/types/tour-scheda";

export class TourServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourServiceError";
  }
}

function invalidateCaches(): void {
  invalidateDashboardCache();
  invalidateGlobalSearchIndex();
}

function toDettaglio(tour: Tour): TourDettaglio {
  return { ...tour };
}

export async function getTours(): Promise<Tour[]> {
  return listToursMock();
}

export async function getActiveTours(): Promise<Tour[]> {
  return listToursMock().filter(
    (tour) => tour.stato !== "Terminato" && tour.stato !== "Archiviato",
  );
}

export async function getTour(id: string): Promise<Tour | null> {
  return findTourByIdMock(id);
}

export async function getTourDettaglio(id: string): Promise<TourDettaglio | null> {
  const tour = findTourByIdMock(id);
  return tour ? toDettaglio(tour) : null;
}

export async function createTour(input: CreateTourInput): Promise<Tour> {
  const tour = createTourSeedRecord(input);
  insertTourMock(tour);
  invalidateCaches();
  return { ...tour };
}

export async function updateTour(
  id: string,
  input: UpdateTourInput,
): Promise<Tour> {
  const existing = findTourByIdMock(id);
  if (!existing) {
    throw new TourServiceError(`Tour "${id}" non trovato.`);
  }

  const updated = updateTourMock(id, input);
  if (!updated) {
    throw new TourServiceError(`Tour "${id}" non trovato.`);
  }

  invalidateCaches();
  return updated;
}

export async function archiveTour(id: string): Promise<Tour> {
  return updateTour(id, { stato: "Archiviato" });
}

export async function deleteTour(id: string): Promise<void> {
  const deleted = deleteTourMock(id);
  if (!deleted) {
    throw new TourServiceError(`Tour "${id}" non trovato.`);
  }
  invalidateCaches();
}

/** Accesso sincrono per mapper e aggregazioni in-memory. */
export function getToursSync(): Tour[] {
  return listToursMock();
}

export function getTourSync(id: string): Tour | null {
  return findTourByIdMock(id);
}
