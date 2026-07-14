export type TourStato =
  | "In vendita"
  | "Completo"
  | "In corso"
  | "Terminato"
  | "Archiviato";

export type TourStatoFilter = TourStato | "tutti";

export type Tour = {
  id: string;
  nomeTour: string;
  destinazione: string;
  dataPartenza: string;
  dataRitorno: string;
  stato: TourStato;
  numeroPartecipanti: number;
  capienzaMassima: number;
  tourLeader: string;
  prezzo: string;
  descrizione: string;
  creatoIl: string;
  aggiornatoIl: string;
};

export type TourFilters = {
  search: string;
  stato: TourStatoFilter;
  page: number;
};

export type CreateTourInput = {
  nomeTour: string;
  destinazione: string;
  dataPartenza: string;
  dataRitorno: string;
  stato: TourStato;
  capienzaMassima: number;
  tourLeader: string;
  prezzo: string;
  descrizione: string;
};

export type UpdateTourInput = Partial<CreateTourInput>;

export type TourForm = {
  nomeTour: string;
  destinazione: string;
  dataPartenza: string;
  dataRitorno: string;
  stato: TourStato;
  capienzaMassima: string;
  tourLeader: string;
  prezzo: string;
  descrizione: string;
};

export type TourFormErrors = Partial<Record<keyof TourForm, string>>;
