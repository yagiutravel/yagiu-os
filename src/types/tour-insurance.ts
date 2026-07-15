export type StatoAssicurazioneTour =
  | "Da emettere"
  | "Attiva"
  | "Scaduta"
  | "Annullata";

export type TourInsurance = {
  id: string;
  tourId: string;
  fornitore: string;
  polizzaNumero: string;
  copertura: string;
  premio: number;
  dataInizio: string | null;
  dataFine: string | null;
  stato: StatoAssicurazioneTour;
  note: string;
};

export type CreateTourInsuranceInput = {
  tourId: string;
  fornitore: string;
  polizzaNumero?: string;
  copertura?: string;
  premio?: number;
  dataInizio?: string | null;
  dataFine?: string | null;
  stato?: StatoAssicurazioneTour;
  note?: string;
};

export type UpdateTourInsuranceInput = Partial<
  Omit<CreateTourInsuranceInput, "tourId">
>;
