import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapClienteToPartecipazioneView,
  mapPartecipazioniToTourClienteViewsWithTours,
  mapPartecipazioniToViews,
} from "@/mappers/tour-partecipazione.mapper";
import {
  mapCreatePartecipazioneInputToInsert,
  mapParticipantRowToPartecipazione,
  mapUpdatePartecipazioneInputToUpdate,
} from "@/mappers/tour-participant.mapper";
import { getClienti } from "@/services/clienti.service";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import { getTours, warmTourCache } from "@/services/tour.service";
import type { TourParticipantRow } from "@/types/database";
import type {
  CreatePartecipazioneTourInput,
  PartecipazioneTour,
  PartecipazioneTourView,
  TourClienteView,
  UpdatePartecipazioneTourInput,
} from "@/types/tour-partecipazione";

export class TourPartecipazioneServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourPartecipazioneServiceError";
  }
}

const PARTICIPANTS_TABLE = "tour_participants";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourPartecipazioneServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function fetchParticipantsByTourId(
  tourId: string,
): Promise<PartecipazioneTour[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("created_at", { ascending: true });

  if (error) handleSupabaseError("fetchParticipantsByTourId", error);

  return ((data ?? []) as TourParticipantRow[]).map(mapParticipantRowToPartecipazione);
}

export async function getPartecipazioniByTourId(
  tourId: string,
): Promise<PartecipazioneTourView[]> {
  const [clienti, partecipazioni] = await Promise.all([
    getClienti(),
    fetchParticipantsByTourId(tourId),
  ]);

  return mapPartecipazioniToViews(partecipazioni, clienti);
}

export async function listAllPartecipazioni(): Promise<PartecipazioneTour[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) handleSupabaseError("listAllPartecipazioni", error);

  return ((data ?? []) as TourParticipantRow[]).map(mapParticipantRowToPartecipazione);
}

export async function getTourByClienteId(
  clienteId: string,
): Promise<TourClienteView[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("getTourByClienteId", error);

  const partecipazioni = ((data ?? []) as TourParticipantRow[]).map(
    mapParticipantRowToPartecipazione,
  );

  await warmTourCache();
  const tours = await getTours();

  return mapPartecipazioniToTourClienteViewsWithTours(partecipazioni, tours);
}

export async function createPartecipazione(
  input: CreatePartecipazioneTourInput,
): Promise<PartecipazioneTourView> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: existsError } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("id")
    .eq("tour_id", input.tourId)
    .eq("cliente_id", input.clienteId)
    .maybeSingle();

  if (existsError) handleSupabaseError("createPartecipazioneExists", existsError);

  if (existing) {
    throw new TourPartecipazioneServiceError(
      "Questo cliente è già iscritto al tour.",
    );
  }

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .insert(mapCreatePartecipazioneInputToInsert(input, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createPartecipazione", error);

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "prenotazione",
    titolo: "Nuovo partecipante iscritto",
    descrizione: "Aggiunta iscrizione al tour.",
  });

  const clienti = await getClienti();
  return mapClienteToPartecipazioneView(
    mapParticipantRowToPartecipazione(data as TourParticipantRow),
    clienti,
  );
}

export async function updatePartecipazione(
  id: string,
  input: UpdatePartecipazioneTourInput,
): Promise<PartecipazioneTourView> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const payload = mapUpdatePartecipazioneInputToUpdate(input);

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .update(payload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updatePartecipazione", error);
  if (!data) {
    throw new TourPartecipazioneServiceError("Partecipazione non trovata.");
  }

  const clienti = await getClienti();
  return mapClienteToPartecipazioneView(
    mapParticipantRowToPartecipazione(data as TourParticipantRow),
    clienti,
  );
}

export async function deletePartecipazione(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deletePartecipazione", error);
}

export async function getPartecipazioneById(
  id: string,
): Promise<PartecipazioneTourView | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(PARTICIPANTS_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getPartecipazioneById", error);
  if (!data) return null;

  const clienti = await getClienti();
  return mapClienteToPartecipazioneView(
    mapParticipantRowToPartecipazione(data as TourParticipantRow),
    clienti,
  );
}
