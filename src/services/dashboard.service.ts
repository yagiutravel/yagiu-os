import {
  buildSearchIndex,
  mapDashboardData,
  searchDashboardIndex,
} from "@/mappers/dashboard.mapper";
import { getCamereByTourId } from "@/services/camera.service";
import { getClienti } from "@/services/clienti.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { getTours } from "@/services/tour.service";
import type { CameraView } from "@/types/camera";
import type {
  DashboardData,
  DashboardSearchIndex,
  DashboardSearchResult,
} from "@/types/dashboard";
import type { PartecipazioneTourView } from "@/types/tour-partecipazione";

let cachedSearchIndex: DashboardSearchIndex | null = null;

async function loadAggregationData() {
  const [clienti, tours] = await Promise.all([getClienti(), getTours()]);

  const activeTours = tours.filter(
    (tour) =>
      tour.stato !== "Terminato" && tour.stato !== "Archiviato",
  );
  const partecipazioniByTour = new Map<string, PartecipazioneTourView[]>();
  const camereByTour = new Map<string, CameraView[]>();

  await Promise.all(
    activeTours.map(async (tour) => {
      const [partecipazioni, camere] = await Promise.all([
        getPartecipazioniByTourId(tour.id),
        getCamereByTourId(tour.id),
      ]);
      partecipazioniByTour.set(tour.id, partecipazioni);
      camereByTour.set(tour.id, camere);
    }),
  );

  return { clienti, tours, partecipazioniByTour, camereByTour };
}

export async function getDashboardData(): Promise<DashboardData> {
  const data = await loadAggregationData();
  const now = new Date();
  cachedSearchIndex = buildSearchIndex(
    data.clienti,
    data.tours,
    data.partecipazioniByTour,
  );
  return mapDashboardData({ ...data, now });
}

export async function searchDashboard(
  query: string,
): Promise<DashboardSearchResult[]> {
  if (!cachedSearchIndex) {
    await getDashboardData();
  }

  if (!cachedSearchIndex) return [];
  return searchDashboardIndex(cachedSearchIndex, query);
}

export function invalidateDashboardCache(): void {
  cachedSearchIndex = null;
}
