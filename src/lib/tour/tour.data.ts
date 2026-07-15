import { getTours } from "@/services/tour.service";
import type { Tour } from "@/types/tour";

/** @deprecated Usa getTours() da tour.service */
export async function getTourPlaceholderData(): Promise<Tour[]> {
  return getTours();
}
