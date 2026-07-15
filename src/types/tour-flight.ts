export type DirezioneVolo = "Andata" | "Ritorno" | "Interno";

export type TourFlight = {
  id: string;
  tourId: string;
  dayId: string | null;
  direzione: DirezioneVolo;
  compagnia: string;
  numeroVolo: string;
  aeroportoPartenza: string;
  aeroportoArrivo: string;
  dataPartenza: string;
  oraPartenza: string | null;
  dataArrivo: string | null;
  oraArrivo: string | null;
  note: string;
};

export type CreateTourFlightInput = {
  tourId: string;
  dayId?: string | null;
  direzione: DirezioneVolo;
  compagnia?: string;
  numeroVolo: string;
  aeroportoPartenza: string;
  aeroportoArrivo: string;
  dataPartenza: string;
  oraPartenza?: string | null;
  dataArrivo?: string | null;
  oraArrivo?: string | null;
  note?: string;
};

export type UpdateTourFlightInput = Partial<Omit<CreateTourFlightInput, "tourId">>;
