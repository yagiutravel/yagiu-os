import { getFlightsByTourId } from "@/services/tour-flight.service";
import { getInsurancesByTourId } from "@/services/tour-insurance.service";
import { ensureProgramForTour } from "@/services/tour-program.service";
import { getTransfersByTourId } from "@/services/tour-transfer.service";
import type { TourLogisticaData } from "@/types/tour-logistica";

export async function getTourLogistica(tourId: string): Promise<TourLogisticaData> {
  const [programma, voli, transfers, assicurazioni] = await Promise.all([
    ensureProgramForTour(tourId),
    getFlightsByTourId(tourId),
    getTransfersByTourId(tourId),
    getInsurancesByTourId(tourId),
  ]);

  return { programma, voli, transfers, assicurazioni };
}
