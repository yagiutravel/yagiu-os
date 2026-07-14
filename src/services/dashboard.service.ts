import { mapCamereToViews } from "@/mappers/camera.mapper";
import {
  buildSearchIndex,
  mapDashboardData,
  searchDashboardIndex,
} from "@/mappers/dashboard.mapper";
import { mapPartecipazioniToViews } from "@/mappers/tour-partecipazione.mapper";
import {
  listAssegnazioniByTourIdMock,
  listCamereByTourIdMock,
  seedCamereMock,
} from "@/mock/camere";
import {
  listPartecipazioniByTourIdMock,
  listPartecipazioniMock,
  seedPartecipazioniMock,
} from "@/mock/tour-partecipazioni";
import { getClienti } from "@/services/clienti.service";
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

  seedPartecipazioniMock(clienti);
  seedCamereMock(listPartecipazioniMock());

  const activeTours = tours.filter(
    (tour) =>
      tour.stato !== "Terminato" && tour.stato !== "Archiviato",
  );
  const partecipazioniByTour = new Map<string, PartecipazioneTourView[]>();
  const camereByTour = new Map<string, CameraView[]>();

  for (const tour of activeTours) {
    const partecipazioni = mapPartecipazioniToViews(
      listPartecipazioniByTourIdMock(tour.id),
      clienti,
    );
    partecipazioniByTour.set(tour.id, partecipazioni);

    camereByTour.set(
      tour.id,
      mapCamereToViews(
        listCamereByTourIdMock(tour.id),
        listAssegnazioniByTourIdMock(tour.id),
        partecipazioni,
      ),
    );
  }

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
