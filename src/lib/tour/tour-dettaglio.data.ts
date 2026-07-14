import { getTourSync } from "@/services/tour.service";
import type { TourDettaglio } from "@/types/tour-scheda";

export function getTourDettaglioById(id: string): TourDettaglio | null {
  const tour = getTourSync(id);
  return tour ? { ...tour } : null;
}
