export type TipoAttivitaProgramma =
  | "Visita"
  | "Pasto"
  | "Trasferimento"
  | "Libero"
  | "Altro";

export type TourProgramActivity = {
  id: string;
  tourId: string;
  dayId: string;
  titolo: string;
  descrizione: string;
  oraInizio: string | null;
  oraFine: string | null;
  luogo: string;
  tipo: TipoAttivitaProgramma;
  ordine: number;
};

export type TourProgramDay = {
  id: string;
  tourId: string;
  giornoNumero: number;
  data: string | null;
  titolo: string;
  descrizione: string;
  hotelId: string | null;
  hotelNome: string | null;
  ordine: number;
  attivita: TourProgramActivity[];
};

export type CreateProgramDayInput = {
  tourId: string;
  giornoNumero: number;
  data?: string | null;
  titolo?: string;
  descrizione?: string;
  hotelId?: string | null;
  ordine?: number;
};

export type UpdateProgramDayInput = Partial<
  Omit<CreateProgramDayInput, "tourId" | "giornoNumero">
>;

export type CreateProgramActivityInput = {
  tourId: string;
  dayId: string;
  titolo: string;
  descrizione?: string;
  oraInizio?: string | null;
  oraFine?: string | null;
  luogo?: string;
  tipo?: TipoAttivitaProgramma;
  ordine?: number;
};

export type UpdateProgramActivityInput = Partial<
  Omit<CreateProgramActivityInput, "tourId" | "dayId">
>;

export type TourProgramData = {
  giorni: TourProgramDay[];
};
