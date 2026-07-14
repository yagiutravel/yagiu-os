import { listToursMock } from "@/mock/tours";
import type { Tour } from "@/types/tour";

/** @deprecated Usa getTours() da tour.service */
export function getTourPlaceholderData(): Tour[] {
  return listToursMock();
}

export { listToursMock as TOUR_PLACEHOLDER_DATA } from "@/mock/tours";
