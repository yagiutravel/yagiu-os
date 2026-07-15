import type { RuoloPartecipante } from "@/types/tour-partecipazione";

export type TipologiaCamera = "Singola" | "Doppia" | "Tripla" | "Quadrupla";

export type StatoOccupazioneCamera = "Completa" | "Parziale" | "Vuota";

export type Camera = {
  id: string;
  tourId: string;
  hotelId: string | null;
  hotelNome: string | null;
  numero: string;
  tipologia: TipologiaCamera;
  note: string;
  creatoIl: string;
  aggiornatoIl: string;
};

export type CameraAssegnazione = {
  id: string;
  cameraId: string;
  partecipazioneId: string;
  creatoIl: string;
};

export type CreateCameraInput = {
  tourId: string;
  hotelId?: string | null;
  numero: string;
  tipologia: TipologiaCamera;
  note?: string;
};

export type UpdateCameraInput = Partial<
  Omit<CreateCameraInput, "tourId">
>;

export type CameraPartecipanteView = {
  assegnazioneId: string;
  partecipazioneId: string;
  clienteId: string;
  clienteNome: string;
  ruolo: RuoloPartecipante;
};

export type CameraView = Camera & {
  capienza: number;
  occupazione: number;
  statoOccupazione: StatoOccupazioneCamera;
  partecipanti: CameraPartecipanteView[];
};

export type CameraForm = {
  hotelId: string;
  numero: string;
  tipologia: TipologiaCamera;
  note: string;
};

export type RoomingRiepilogo = {
  camere: number;
  partecipanti: number;
  postiOccupati: number;
  postiLiberi: number;
  camereComplete: number;
  camereIncomplete: number;
};
