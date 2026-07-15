import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateTourInsuranceInputToInsert,
  mapTourInsuranceRowToInsurance,
  mapUpdateTourInsuranceInputToUpdate,
} from "@/mappers/tour-insurance.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type { TourInsuranceRow } from "@/types/database";
import type {
  CreateTourInsuranceInput,
  TourInsurance,
  UpdateTourInsuranceInput,
} from "@/types/tour-insurance";

export class TourInsuranceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourInsuranceServiceError";
  }
}

const TABLE = "tour_insurances";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourInsuranceServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getInsurancesByTourId(tourId: string): Promise<TourInsurance[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("data_inizio", { ascending: true });

  if (error) handleSupabaseError("getInsurancesByTourId", error);

  return ((data ?? []) as TourInsuranceRow[]).map(mapTourInsuranceRowToInsurance);
}

export async function countAssicurazioniDaEmettere(): Promise<number> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("stato", "da_emettere");

  if (error) handleSupabaseError("countAssicurazioniDaEmettere", error);
  return count ?? 0;
}

export async function createInsurance(
  input: CreateTourInsuranceInput,
): Promise<TourInsurance> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const fornitore = input.fornitore.trim();
  if (!fornitore) {
    throw new TourInsuranceServiceError("Il fornitore assicurativo è obbligatorio.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(mapCreateTourInsuranceInputToInsert({ ...input, fornitore }, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createInsurance", error);

  const insurance = mapTourInsuranceRowToInsurance(data as TourInsuranceRow);
  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "assicurazione",
    titolo: `Assicurazione: ${insurance.fornitore}`,
    descrizione: `Stato: ${insurance.stato}`,
  });

  return insurance;
}

export async function updateInsurance(
  id: string,
  input: UpdateTourInsuranceInput,
): Promise<TourInsurance> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(mapUpdateTourInsuranceInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateInsurance", error);
  if (!data) throw new TourInsuranceServiceError("Assicurazione non trovata.");

  const insurance = mapTourInsuranceRowToInsurance(data as TourInsuranceRow);
  await recordTourTimelineEvent({
    tourId: insurance.tourId,
    tipo: "assicurazione",
    titolo: `Assicurazione aggiornata: ${insurance.fornitore}`,
    descrizione: `Stato: ${insurance.stato}`,
  });

  return insurance;
}

export async function deleteInsurance(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select("tour_id, fornitore")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteInsurance", fetchError);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteInsurance", error);

  if (existing) {
    await recordTourTimelineEvent({
      tourId: existing.tour_id as string,
      tipo: "assicurazione",
      titolo: `Assicurazione rimossa: ${existing.fornitore}`,
      descrizione: "Polizza eliminata dal tour.",
    });
  }
}
