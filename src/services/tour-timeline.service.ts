import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import type { TimelineEventoTipo } from "@/types/timeline-viaggiatore";

export class TourTimelineServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourTimelineServiceError";
  }
}

const TABLE = "tour_timeline_events";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourTimelineServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

export type RecordTourTimelineInput = {
  tourId: string;
  tipo: TimelineEventoTipo;
  titolo: string;
  descrizione?: string;
};

export async function recordTourTimelineEvent(
  input: RecordTourTimelineInput,
): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase.from(TABLE).insert({
    organization_id: organizationId,
    tour_id: input.tourId,
    tipo: input.tipo,
    titolo: input.titolo,
    descrizione: input.descrizione?.trim() ?? "",
  });

  if (error) handleSupabaseError("recordTourTimelineEvent", error);
}

export async function getTourTimelineEvents(tourId: string) {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError("getTourTimelineEvents", error);
  return data ?? [];
}
