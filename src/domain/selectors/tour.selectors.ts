import type { DomainSnapshot } from "@/domain/types/snapshot";
import type { UpcomingDeparture } from "@/domain/types/analytics";
import {
  DOMAIN_TOUR_NEARLY_FULL_THRESHOLD,
  DOMAIN_UPCOMING_DEPARTURE_DAYS,
} from "@/domain/constants";
import { daysUntil } from "@/domain/helpers/date";
import {
  isTourActive,
  isTourNearlyFull,
  sortToursByDeparture,
} from "@/domain/helpers/tour";
import type { Tour } from "@/types/tour";

export function getActiveTours(snapshot: DomainSnapshot): Tour[] {
  return snapshot.activeTours;
}

export function getUpcomingTours(
  snapshot: DomainSnapshot,
  withinDays = DOMAIN_UPCOMING_DEPARTURE_DAYS,
  now = new Date(),
): Tour[] {
  return sortToursByDeparture(
    snapshot.tours.filter((tour) => {
      if (!isTourActive(tour)) return false;
      const giorni = daysUntil(tour.dataPartenza, now);
      return giorni >= 0 && giorni <= withinDays;
    }),
  );
}

export function getUpcomingDepartures(
  snapshot: DomainSnapshot,
  limit = 10,
  now = new Date(),
): UpcomingDeparture[] {
  return getUpcomingTours(snapshot, DOMAIN_UPCOMING_DEPARTURE_DAYS, now)
    .slice(0, limit)
    .map((tour) => ({
      tourId: tour.id,
      nomeTour: tour.nomeTour,
      destinazione: tour.destinazione,
      dataPartenza: tour.dataPartenza,
      giorniMancanti: daysUntil(tour.dataPartenza, now),
      stato: tour.stato,
    }));
}

export function getToursNearlyComplete(
  snapshot: DomainSnapshot,
  threshold = DOMAIN_TOUR_NEARLY_FULL_THRESHOLD,
): Tour[] {
  return snapshot.activeTours.filter((tour) =>
    isTourNearlyFull(tour, threshold),
  );
}

export function getTourById(
  snapshot: DomainSnapshot,
  tourId: string,
): Tour | undefined {
  return snapshot.toursById.get(tourId);
}

export function getPartecipazioniByTour(
  snapshot: DomainSnapshot,
  tourId: string,
) {
  return snapshot.partecipazioniByTourId.get(tourId) ?? [];
}
