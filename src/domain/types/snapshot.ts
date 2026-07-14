import type { Camera, CameraAssegnazione } from "@/types/camera";
import type { Cliente } from "@/types/cliente";
import type { PartecipazioneTour } from "@/types/tour-partecipazione";
import type { Tour } from "@/types/tour";

/** Aggregato di dominio — entità grezze e indici, senza DTO UI. */
export type DomainSnapshot = {
  clienti: Cliente[];
  clientiById: Map<string, Cliente>;
  tours: Tour[];
  toursById: Map<string, Tour>;
  activeTours: Tour[];
  partecipazioniByTourId: Map<string, PartecipazioneTour[]>;
  partecipazioniByClienteId: Map<string, PartecipazioneTour[]>;
  allPartecipazioni: PartecipazioneTour[];
  camereByTourId: Map<string, Camera[]>;
  camereById: Map<string, Camera>;
  assegnazioniByTourId: Map<string, CameraAssegnazione[]>;
  assegnazioniByCameraId: Map<string, CameraAssegnazione[]>;
  allCamere: Camera[];
  allAssegnazioni: CameraAssegnazione[];
  loadedAt: string;
};

export type DomainSnapshotOptions = {
  now?: Date;
};
