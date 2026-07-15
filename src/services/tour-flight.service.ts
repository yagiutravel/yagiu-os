import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateTourFlightInputToInsert,
  mapTourFlightRowToFlight,
  mapUpdateTourFlightInputToUpdate,
} from "@/mappers/tour-flight.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type { TourFlightRow } from "@/types/database";
import type {
  CreateTourFlightInput,
  TourFlight,
  UpdateTourFlightInput,
} from "@/types/tour-flight";

export class TourFlightServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourFlightServiceError";
  }
}

const TABLE = "tour_flights";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourFlightServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getFlightsByTourId(tourId: string): Promise<TourFlight[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("data_partenza", { ascending: true })
    .order("ora_partenza", { ascending: true });

  if (error) handleSupabaseError("getFlightsByTourId", error);

  return ((data ?? []) as TourFlightRow[]).map(mapTourFlightRowToFlight);
}

export async function createFlight(input: CreateTourFlightInput): Promise<TourFlight> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const numeroVolo = input.numeroVolo.trim();
  if (!numeroVolo) {
    throw new TourFlightServiceError("Il numero volo è obbligatorio.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapCreateTourFlightInputToInsert({ ...input, numeroVolo }, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createFlight", error);

  const flight = mapTourFlightRowToFlight(data as TourFlightRow);
  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "volo",
    titolo: `Volo ${flight.numeroVolo} (${flight.direzione})`,
    descrizione: `${flight.aeroportoPartenza} → ${flight.aeroportoArrivo}`,
  });

  return flight;
}

export async function updateFlight(
  id: string,
  input: UpdateTourFlightInput,
): Promise<TourFlight> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(mapUpdateTourFlightInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateFlight", error);
  if (!data) throw new TourFlightServiceError("Volo non trovato.");

  const flight = mapTourFlightRowToFlight(data as TourFlightRow);
  await recordTourTimelineEvent({
    tourId: flight.tourId,
    tipo: "volo",
    titolo: `Volo aggiornato: ${flight.numeroVolo}`,
    descrizione: `${flight.aeroportoPartenza} → ${flight.aeroportoArrivo}`,
  });

  return flight;
}

export async function deleteFlight(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select("tour_id, numero_volo")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteFlight", fetchError);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteFlight", error);

  if (existing) {
    await recordTourTimelineEvent({
      tourId: existing.tour_id as string,
      tipo: "volo",
      titolo: `Volo rimosso: ${existing.numero_volo}`,
      descrizione: "Volo eliminato dal programma logistica.",
    });
  }
}
