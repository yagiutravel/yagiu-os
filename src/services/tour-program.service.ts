import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreateProgramActivityInputToInsert,
  mapCreateProgramDayInputToInsert,
  mapTourProgramActivityRowToActivity,
  mapTourProgramDayRowToDay,
  mapUpdateProgramActivityInputToUpdate,
  mapUpdateProgramDayInputToUpdate,
} from "@/mappers/tour-program.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type {
  TourProgramActivityRow,
  TourProgramDayRow,
} from "@/types/database";
import type {
  CreateProgramActivityInput,
  CreateProgramDayInput,
  TourProgramActivity,
  TourProgramDay,
  TourProgramData,
  UpdateProgramActivityInput,
  UpdateProgramDayInput,
} from "@/types/tour-program";

export class TourProgramServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourProgramServiceError";
  }
}

const DAYS_TABLE = "tour_program_days";
const ACTIVITIES_TABLE = "tour_program_activities";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourProgramServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

function enumerateTourDates(dataPartenza: string, dataRitorno: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${dataPartenza}T00:00:00`);
  const end = new Date(`${dataRitorno}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return dates;
  }

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export async function seedProgramDaysFromTour(
  tourId: string,
  dataPartenza: string,
  dataRitorno: string,
): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { count, error: countError } = await supabase
    .from(DAYS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId);

  if (countError) handleSupabaseError("seedProgramDaysFromTour", countError);
  if ((count ?? 0) > 0) return;

  const dates = enumerateTourDates(dataPartenza, dataRitorno);
  if (dates.length === 0) return;

  const rows = dates.map((data, index) =>
    mapCreateProgramDayInputToInsert(
      {
        tourId,
        giornoNumero: index + 1,
        data,
        titolo: `Giorno ${index + 1}`,
        ordine: index + 1,
      },
      organizationId,
    ),
  );

  const { error } = await supabase.from(DAYS_TABLE).insert(rows);
  if (error) handleSupabaseError("seedProgramDaysFromTour", error);

  await recordTourTimelineEvent({
    tourId,
    tipo: "programma_giorno",
    titolo: "Programma inizializzato",
    descrizione: `${dates.length} giorni creati automaticamente dall'itinerario del tour.`,
  });
}

export async function getProgramByTourId(tourId: string): Promise<TourProgramData> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const [daysResult, activitiesResult, hotelsResult] = await Promise.all([
    supabase
      .from(DAYS_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .eq("tour_id", tourId)
      .order("ordine", { ascending: true })
      .order("giorno_numero", { ascending: true }),
    supabase
      .from(ACTIVITIES_TABLE)
      .select("*")
      .eq("organization_id", organizationId)
      .eq("tour_id", tourId)
      .order("ordine", { ascending: true })
      .order("ora_inizio", { ascending: true }),
    supabase
      .from("tour_hotels")
      .select("id, nome")
      .eq("organization_id", organizationId)
      .eq("tour_id", tourId),
  ]);

  if (daysResult.error) handleSupabaseError("getProgramByTourId", daysResult.error);
  if (activitiesResult.error) {
    handleSupabaseError("getProgramByTourId", activitiesResult.error);
  }
  if (hotelsResult.error) handleSupabaseError("getProgramByTourId", hotelsResult.error);

  const hotelNames = new Map(
    (hotelsResult.data ?? []).map((hotel) => [hotel.id as string, hotel.nome as string]),
  );

  const activitiesByDay = new Map<string, TourProgramActivity[]>();
  for (const row of (activitiesResult.data ?? []) as TourProgramActivityRow[]) {
    const activity = mapTourProgramActivityRowToActivity(row);
    const bucket = activitiesByDay.get(row.day_id) ?? [];
    bucket.push(activity);
    activitiesByDay.set(row.day_id, bucket);
  }

  const giorni = ((daysResult.data ?? []) as TourProgramDayRow[]).map((row) =>
    mapTourProgramDayRowToDay(
      row,
      activitiesByDay.get(row.id) ?? [],
      row.hotel_id ? (hotelNames.get(row.hotel_id) ?? null) : null,
    ),
  );

  return { giorni };
}

export async function ensureProgramForTour(tourId: string): Promise<TourProgramData> {
  const program = await getProgramByTourId(tourId);
  if (program.giorni.length > 0) return program;

  const tour = await (async () => {
    const { getTour } = await import("@/services/tour.service");
    return getTour(tourId);
  })();
  if (!tour) return program;

  await seedProgramDaysFromTour(tourId, tour.dataPartenza, tour.dataRitorno);
  return getProgramByTourId(tourId);
}

export async function createProgramDay(
  input: CreateProgramDayInput,
): Promise<TourProgramDay> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(DAYS_TABLE)
    .insert(mapCreateProgramDayInputToInsert(input, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createProgramDay", error);

  const row = data as TourProgramDayRow;
  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "programma_giorno",
    titolo: `Giorno ${row.giorno_numero} aggiunto`,
    descrizione: row.titolo || "Nuovo giorno nel programma.",
  });

  return mapTourProgramDayRowToDay(row, []);
}

export async function updateProgramDay(
  id: string,
  input: UpdateProgramDayInput,
): Promise<TourProgramDay> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(DAYS_TABLE)
    .update(mapUpdateProgramDayInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateProgramDay", error);
  if (!data) throw new TourProgramServiceError("Giorno programma non trovato.");

  const row = data as TourProgramDayRow;
  await recordTourTimelineEvent({
    tourId: row.tour_id,
    tipo: "programma_giorno",
    titolo: `Giorno ${row.giorno_numero} aggiornato`,
    descrizione: row.titolo || "Itinerario giornaliero modificato.",
  });

  return mapTourProgramDayRowToDay(row, []);
}

export async function deleteProgramDay(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from(DAYS_TABLE)
    .select("tour_id, giorno_numero")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteProgramDay", fetchError);

  const { error } = await supabase
    .from(DAYS_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteProgramDay", error);

  if (existing) {
    await recordTourTimelineEvent({
      tourId: existing.tour_id as string,
      tipo: "programma_giorno",
      titolo: `Giorno ${existing.giorno_numero} rimosso`,
      descrizione: "Giorno eliminato dal programma.",
    });
  }
}

export async function createProgramActivity(
  input: CreateProgramActivityInput,
): Promise<TourProgramActivity> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const titolo = input.titolo.trim();
  if (!titolo) {
    throw new TourProgramServiceError("Il titolo dell'attività è obbligatorio.");
  }

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .insert(mapCreateProgramActivityInputToInsert({ ...input, titolo }, organizationId))
    .select("*")
    .single();

  if (error) handleSupabaseError("createProgramActivity", error);

  const row = data as TourProgramActivityRow;
  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "attivita",
    titolo: `Attività: ${row.titolo}`,
    descrizione: row.luogo ? `Luogo: ${row.luogo}` : "Nuova attività nel programma.",
  });

  return mapTourProgramActivityRowToActivity(row);
}

export async function updateProgramActivity(
  id: string,
  input: UpdateProgramActivityInput,
): Promise<TourProgramActivity> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .update(mapUpdateProgramActivityInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateProgramActivity", error);
  if (!data) throw new TourProgramServiceError("Attività non trovata.");

  const row = data as TourProgramActivityRow;
  await recordTourTimelineEvent({
    tourId: row.tour_id,
    tipo: "attivita",
    titolo: `Attività aggiornata: ${row.titolo}`,
    descrizione: "Dettagli attività modificati.",
  });

  return mapTourProgramActivityRowToActivity(row);
}

export async function deleteProgramActivity(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from(ACTIVITIES_TABLE)
    .select("tour_id, titolo")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deleteProgramActivity", fetchError);

  const { error } = await supabase
    .from(ACTIVITIES_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteProgramActivity", error);

  if (existing) {
    await recordTourTimelineEvent({
      tourId: existing.tour_id as string,
      tipo: "attivita",
      titolo: `Attività rimossa: ${existing.titolo}`,
      descrizione: "Attività eliminata dal programma.",
    });
  }
}
