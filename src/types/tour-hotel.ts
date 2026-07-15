export type TourHotel = {
  id: string;
  tourId: string;
  nome: string;
  indirizzo: string;
  citta: string;
  paese: string;
  checkIn: string | null;
  checkOut: string | null;
  telefono: string | null;
  note: string;
  ordine: number;
  creatoIl: string;
  aggiornatoIl: string;
};

export type CreateTourHotelInput = {
  tourId: string;
  nome: string;
  indirizzo?: string;
  citta?: string;
  paese?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  telefono?: string | null;
  note?: string;
  ordine?: number;
};

export type UpdateTourHotelInput = Partial<
  Omit<CreateTourHotelInput, "tourId">
>;

export type TourHotelForm = {
  nome: string;
  indirizzo: string;
  citta: string;
  paese: string;
  checkIn: string;
  checkOut: string;
  telefono: string;
  note: string;
};
