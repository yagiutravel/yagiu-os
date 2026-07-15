import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateTourTransferInputToInsert,
  mapTourTransferRowToTransfer,
  mapUpdateTourTransferInputToUpdate,
} from "@/mappers/tour-transfer.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type { TourTransferRow } from "@/types/database";
import type {
  CreateTourTransferInput,
  TourTransfer,
  UpdateTourTransferInput,
} from "@/types/tour-transfer";

export class TourTransferServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourTransferServiceError";
  }
}

const TABLE = "tour_transfers";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourTransferServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export async function getTransfersByTourId(tourId: string): Promise<TourTransfer[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("data", { ascending: true })
    .order("ora", { ascending: true });

  if (error) handleSupabaseError("getTransfersByTourId", error);

  return ((data ?? []) as TourTransferRow[]).map(mapTourTransferRowToTransfer);
}

export async function createTransfer(input: CreateTourTransferInput): Promise<TourTransfer> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const partenza = input.partenza.trim();
  const destinazione = input.destinazione.trim();
  if (!partenza || !destinazione) {
    throw new TourTransferServiceError("Partenza e destinazione sono obbligatorie.");
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(
      mapCreateTourTransferInputToInsert(
        { ...input, partenza, destinazione },
        organizationId,
      ),
    )
    .select("*")
    .single();

  if (error) handleSupabaseError("createTransfer", error);

  const transfer = mapTourTransferRowToTransfer(data as TourTransferRow);
  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "transfer",
    titolo: `Transfer ${transfer.tipo}`,
    descrizione: `${transfer.partenza} → ${transfer.destinazione}`,
  });

  return transfer;
}

export async function updateTransfer(
  id: string,
  input: UpdateTourTransferInput,
): Promise<TourTransfer> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update(mapUpdateTourTransferInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateTransfer", error);
  if (!data) throw new TourTransferServiceError("Transfer non trovato.");

  const transfer = mapTourTransferRowToTransfer(data as TourTransferRow);
  await recordTourTimelineEvent({
    tourId: transfer.tourId,
    tipo: "transfer",
    titolo: `Transfer aggiornato (${transfer.tipo})`,
    descrizione: `${transfer.partenza} → ${transfer.destinazione}`,
  });

  return transfer;
}

export async function deleteTransfer(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from(TABLE)
    .select("tour_id, partenza, destinazione")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteTransfer", fetchError);

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteTransfer", error);

  if (existing) {
    await recordTourTimelineEvent({
      tourId: existing.tour_id as string,
      tipo: "transfer",
      titolo: "Transfer rimosso",
      descrizione: `${existing.partenza} → ${existing.destinazione}`,
    });
  }
}
