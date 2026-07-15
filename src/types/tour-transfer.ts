export type TipoTransfer = "Bus" | "Van" | "Treno" | "Barca" | "Privato" | "Altro";

export type TourTransfer = {
  id: string;
  tourId: string;
  dayId: string | null;
  tipo: TipoTransfer;
  partenza: string;
  destinazione: string;
  data: string;
  ora: string | null;
  fornitore: string;
  note: string;
};

export type CreateTourTransferInput = {
  tourId: string;
  dayId?: string | null;
  tipo?: TipoTransfer;
  partenza: string;
  destinazione: string;
  data: string;
  ora?: string | null;
  fornitore?: string;
  note?: string;
};

export type UpdateTourTransferInput = Partial<Omit<CreateTourTransferInput, "tourId">>;
