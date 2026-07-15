import type { TourFlight } from "@/types/tour-flight";
import type { TourInsurance } from "@/types/tour-insurance";
import type { TourProgramData } from "@/types/tour-program";
import type { TourTransfer } from "@/types/tour-transfer";

export type TourLogisticaData = {
  programma: TourProgramData;
  voli: TourFlight[];
  transfers: TourTransfer[];
  assicurazioni: TourInsurance[];
};
