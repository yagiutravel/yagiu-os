import type { Tour } from "@/types/tour";
import { isDateInFuture, isDateInPast } from "./date";

export function isTourActive(tour: Tour): boolean {
  return tour.stato !== "Terminato" && tour.stato !== "Archiviato";
}

export function isTourCompleted(tour: Tour): boolean {
  return tour.stato === "Terminato";
}

export function isTourFuture(tour: Tour, now = new Date()): boolean {
  return isTourActive(tour) && isDateInFuture(tour.dataPartenza, now);
}

export function isTourPast(tour: Tour, now = new Date()): boolean {
  return isTourCompleted(tour) || isDateInPast(tour.dataRitorno, now);
}

export function getTourFillPercent(tour: Tour): number {
  if (tour.capienzaMassima <= 0) return 0;
  return Math.round((tour.numeroPartecipanti / tour.capienzaMassima) * 100);
}

export function isTourNearlyFull(tour: Tour, threshold = 85): boolean {
  return getTourFillPercent(tour) >= threshold;
}

export function sortToursByDeparture(tours: Tour[]): Tour[] {
  return [...tours].sort((a, b) =>
    a.dataPartenza.localeCompare(b.dataPartenza),
  );
}
