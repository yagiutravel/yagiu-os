import type { DomainSnapshot } from "@/domain/types/snapshot";
import type {
  DashboardDomainSummary,
  TourOccupancyStats,
  TourStatistics,
} from "@/domain/types/analytics";
import { DOMAIN_TOUR_DEPARTING_SOON_DAYS } from "@/domain/constants";
import { getTourFillPercent } from "@/domain/helpers/tour";
import { getRoomingTotals } from "./camera.selectors";
import {
  getDocumentCounts,
  getOutstandingPaymentTotals,
} from "./partecipazione.selectors";
import {
  getInactiveClients,
} from "./cliente.selectors";
import { getUpcomingTours } from "./tour.selectors";
import {
  getCamereByTour,
  getAssegnazioniByTour,
} from "./camera.selectors";
import {
  getCameraCapienza,
  getCameraOccupazione,
  isCameraComplete,
  isCameraIncomplete,
} from "@/domain/helpers/camera";

export function getTourOccupancy(snapshot: DomainSnapshot): TourOccupancyStats[] {
  return snapshot.activeTours.map((tour) => ({
    tourId: tour.id,
    nomeTour: tour.nomeTour,
    partecipanti: tour.numeroPartecipanti,
    capienzaMassima: tour.capienzaMassima,
    percentualeRiempimento: getTourFillPercent(tour),
    postiDisponibili: Math.max(
      tour.capienzaMassima - tour.numeroPartecipanti,
      0,
    ),
    quasiCompleto: getTourFillPercent(tour) >= 85,
  }));
}

export function getTourStatistics(
  snapshot: DomainSnapshot,
  tourId: string,
): TourStatistics | null {
  const tour = snapshot.toursById.get(tourId);
  if (!tour) return null;

  const camere = getCamereByTour(snapshot, tourId);
  const assegnazioni = getAssegnazioniByTour(snapshot, tourId);

  let camereComplete = 0;
  let camereIncomplete = 0;
  let postiCameraOccupati = 0;
  let postiCameraTotali = 0;

  for (const camera of camere) {
    const cameraAssegnazioni = assegnazioni.filter(
      (item) => item.cameraId === camera.id,
    );
    const capienza = getCameraCapienza(camera);
    const occupazione = getCameraOccupazione(camera, cameraAssegnazioni);

    postiCameraTotali += capienza;
    postiCameraOccupati += occupazione;

    if (isCameraComplete(camera, cameraAssegnazioni)) camereComplete += 1;
    if (isCameraIncomplete(camera, cameraAssegnazioni)) camereIncomplete += 1;
  }

  return {
    tourId: tour.id,
    nomeTour: tour.nomeTour,
    stato: tour.stato,
    partecipanti: tour.numeroPartecipanti,
    capienzaMassima: tour.capienzaMassima,
    camere: camere.length,
    camereComplete,
    camereIncomplete,
    postiCameraOccupati,
    postiCameraTotali,
  };
}

export function getDashboardSummary(
  snapshot: DomainSnapshot,
  now = new Date(),
): DashboardDomainSummary {
  const pagamenti = getOutstandingPaymentTotals(snapshot);
  const documenti = getDocumentCounts(snapshot);
  const rooming = getRoomingTotals(snapshot);
  const tourInPartenza = getUpcomingTours(
    snapshot,
    DOMAIN_TOUR_DEPARTING_SOON_DAYS,
    now,
  ).length;

  const attivitaRichiedonoAttenzione =
    pagamenti.accontiMancanti +
    pagamenti.saldiMancanti +
    documenti.passaportiMancanti +
    documenti.questionariMancanti +
    rooming.camereIncomplete +
    tourInPartenza;

  return {
    tourInPartenza,
    accontiMancanti: pagamenti.accontiMancanti,
    saldiMancanti: pagamenti.saldiMancanti,
    documentiMancanti:
      documenti.passaportiMancanti +
      documenti.questionariMancanti +
      documenti.assicurazioniMancanti +
      documenti.liberatorieMancanti,
    camereIncomplete: rooming.camereIncomplete,
    clientiInattivi: getInactiveClients(snapshot).length,
    attivitaRichiedonoAttenzione,
  };
}
