import type { TourHotelRow, TourHotelInsert, TourHotelUpdate } from "@/types/database";
import type {
  CreateTourHotelInput,
  TourHotel,
  UpdateTourHotelInput,
} from "@/types/tour-hotel";

export function mapTourHotelRowToTourHotel(row: TourHotelRow): TourHotel {
  return {
    id: row.id,
    tourId: row.tour_id,
    nome: row.nome,
    indirizzo: row.indirizzo,
    citta: row.citta,
    paese: row.paese,
    checkIn: row.check_in,
    checkOut: row.check_out,
    telefono: row.telefono,
    note: row.note,
    ordine: row.ordine,
    creatoIl: row.created_at,
    aggiornatoIl: row.updated_at,
  };
}

export function mapCreateTourHotelInputToInsert(
  input: CreateTourHotelInput,
  organizationId: string,
): TourHotelInsert {
  return {
    organization_id: organizationId,
    tour_id: input.tourId,
    nome: input.nome.trim(),
    indirizzo: input.indirizzo?.trim() ?? "",
    citta: input.citta?.trim() ?? "",
    paese: input.paese?.trim() ?? "",
    check_in: input.checkIn ?? null,
    check_out: input.checkOut ?? null,
    telefono: input.telefono?.trim() ?? null,
    note: input.note?.trim() ?? "",
    ordine: input.ordine ?? 0,
  };
}

export function mapUpdateTourHotelInputToUpdate(
  input: UpdateTourHotelInput,
): TourHotelUpdate {
  const payload: TourHotelUpdate = {};

  if (input.nome !== undefined) payload.nome = input.nome.trim();
  if (input.indirizzo !== undefined) payload.indirizzo = input.indirizzo.trim();
  if (input.citta !== undefined) payload.citta = input.citta.trim();
  if (input.paese !== undefined) payload.paese = input.paese.trim();
  if (input.checkIn !== undefined) payload.check_in = input.checkIn;
  if (input.checkOut !== undefined) payload.check_out = input.checkOut;
  if (input.telefono !== undefined) payload.telefono = input.telefono?.trim() ?? null;
  if (input.note !== undefined) payload.note = input.note.trim();
  if (input.ordine !== undefined) payload.ordine = input.ordine;

  return payload;
}
