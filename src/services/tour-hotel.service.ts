import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateTourHotelInputToInsert,
  mapTourHotelRowToTourHotel,
  mapUpdateTourHotelInputToUpdate,
} from "@/mappers/tour-hotel.mapper";
import type { TourHotelRow } from "@/types/database";
import type {
  CreateTourHotelInput,
  TourHotel,
  UpdateTourHotelInput,
} from "@/types/tour-hotel";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";

export class TourHotelServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourHotelServiceError";
  }
}

const HOTELS_TABLE = "tour_hotels";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourHotelServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getHotelsByTourId(tourId: string): Promise<TourHotel[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(HOTELS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("ordine", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) handleSupabaseError("getHotelsByTourId", error);

  return ((data ?? []) as TourHotelRow[]).map(mapTourHotelRowToTourHotel);
}

export async function getHotelById(id: string): Promise<TourHotel | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(HOTELS_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getHotelById", error);
  if (!data) return null;

  return mapTourHotelRowToTourHotel(data as TourHotelRow);
}

export async function createHotel(input: CreateTourHotelInput): Promise<TourHotel> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const nome = input.nome.trim();
  if (!nome) {
    throw new TourHotelServiceError("Il nome dell'hotel è obbligatorio.");
  }

  const { data, error } = await supabase
    .from(HOTELS_TABLE)
    .insert(mapCreateTourHotelInputToInsert({ ...input, nome }, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createHotel", error);

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "nota_interna",
    titolo: `Hotel aggiunto: ${nome}`,
    descrizione: "Soggiorno registrato nella scheda tour.",
  });

  return mapTourHotelRowToTourHotel(data as TourHotelRow);
}

export async function updateHotel(
  id: string,
  input: UpdateTourHotelInput,
): Promise<TourHotel> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const payload = mapUpdateTourHotelInputToUpdate(input);

  const { data, error } = await supabase
    .from(HOTELS_TABLE)
    .update(payload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateHotel", error);
  if (!data) {
    throw new TourHotelServiceError("Hotel non trovato.");
  }

  return mapTourHotelRowToTourHotel(data as TourHotelRow);
}

export async function deleteHotel(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(HOTELS_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteHotel", error);
}
