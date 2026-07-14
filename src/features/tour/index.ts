/** Modulo Tour — API pubblica del dominio tour, partecipazioni e camere. */
export * from "@/types/tour";
export * from "@/types/tour-scheda";
export * from "@/types/tour-partecipazione";
export * from "@/types/camera";

export {
  getTours,
  getActiveTours,
  getTour,
  getTourDettaglio,
  createTour,
  updateTour,
  archiveTour,
  deleteTour,
} from "@/services/tour.service";

export {
  getPartecipazioniByTourId,
  getTourByClienteId,
  createPartecipazione,
  updatePartecipazione,
  deletePartecipazione,
  getPartecipazioneById,
} from "@/services/tour-partecipazione.service";

export {
  getCamereByTourId,
  getRoomingRiepilogoByTourId,
  createCamera,
  updateCamera,
  deleteCamera,
} from "@/services/camera.service";
