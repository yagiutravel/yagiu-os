import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import { buildTourSlug, ensureUniqueTourSlug, slugifyTourName } from "@/lib/tour/slug";
import {
  mapCreateTourInputToInsert,
  mapTourLeaderStaffInsert,
  mapTourRowToTour,
  mapUpdateTourInputToUpdate,
  pickTourLeaderName,
} from "@/mappers/tour.mapper";
import { invalidateDashboardCache } from "@/services/dashboard.service";
import { invalidateGlobalSearchIndex } from "@/services/global-search.service";
import { seedDefaultChecklistTemplates } from "@/services/tour-checklist.service";
import { seedProgramDaysFromTour } from "@/services/tour-program.service";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import type { TourStaffRow, TourRow, TourStatsRow } from "@/types/database";
import type {
  CreateTourInput,
  Tour,
  UpdateTourInput,
} from "@/types/tour";
import type { TourDettaglio } from "@/types/tour-scheda";

export class TourServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TourServiceError";
  }
}

const TOURS_TABLE = "tours";
const TOUR_STAFF_TABLE = "tour_staff";
const TOUR_STATS_VIEW = "tour_stats";

let toursCache: Tour[] = [];

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new TourServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

function invalidateCaches(): void {
  invalidateDashboardCache();
  invalidateGlobalSearchIndex();
}

function setToursCache(tours: Tour[]): void {
  toursCache = tours;
}

async function tourSlugExists(slug: string, organizationId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .select("id")
    .eq("organization_id", organizationId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) handleSupabaseError("tourSlugExists", error);
  return Boolean(data);
}

async function fetchTourStatsMap(
  tourIds: string[],
): Promise<Map<string, TourStatsRow>> {
  const map = new Map<string, TourStatsRow>();
  if (tourIds.length === 0) return map;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TOUR_STATS_VIEW)
    .select("*")
    .in("tour_id", tourIds);

  if (error) handleSupabaseError("fetchTourStatsMap", error);

  for (const row of (data ?? []) as TourStatsRow[]) {
    map.set(row.tour_id, row);
  }

  return map;
}

async function fetchTourStaffMap(
  tourIds: string[],
): Promise<Map<string, TourStaffRow[]>> {
  const map = new Map<string, TourStaffRow[]>();
  if (tourIds.length === 0) return map;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TOUR_STAFF_TABLE)
    .select("*")
    .in("tour_id", tourIds)
    .order("ordine", { ascending: true });

  if (error) handleSupabaseError("fetchTourStaffMap", error);

  for (const row of (data ?? []) as TourStaffRow[]) {
    const list = map.get(row.tour_id) ?? [];
    list.push(row);
    map.set(row.tour_id, list);
  }

  return map;
}

async function mapTourRowsToTours(rows: TourRow[]): Promise<Tour[]> {
  const tourIds = rows.map((row) => row.id);
  const [statsMap, staffMap] = await Promise.all([
    fetchTourStatsMap(tourIds),
    fetchTourStaffMap(tourIds),
  ]);

  return rows.map((row) =>
    mapTourRowToTour(
      row,
      statsMap.get(row.id) ?? null,
      pickTourLeaderName(staffMap.get(row.id) ?? []),
    ),
  );
}

async function fetchTourRowById(id: string): Promise<TourRow | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("fetchTourRowById", error);
  return (data as TourRow | null) ?? null;
}

function toDettaglio(tour: Tour): TourDettaglio {
  return { ...tour };
}

export async function getTours(): Promise<Tour[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("data_partenza", { ascending: true });

  if (error) handleSupabaseError("getTours", error);

  const tours = await mapTourRowsToTours((data ?? []) as TourRow[]);
  setToursCache(tours);
  return tours;
}

export async function getActiveTours(): Promise<Tour[]> {
  const tours = await getTours();
  return tours.filter(
    (tour) => tour.stato !== "Terminato" && tour.stato !== "Archiviato",
  );
}

export async function getTour(id: string): Promise<Tour | null> {
  const row = await fetchTourRowById(id);
  if (!row) return null;

  const mappedTours = await mapTourRowsToTours([row]);
  const tour = mappedTours[0] ?? null;

  if (tour) {
    const index = toursCache.findIndex((item) => item.id === id);
    if (index >= 0) {
      toursCache[index] = tour;
    } else {
      toursCache.push(tour);
    }
  }

  return tour;
}

export async function getTourDettaglio(id: string): Promise<TourDettaglio | null> {
  const tour = await getTour(id);
  return tour ? toDettaglio(tour) : null;
}

export async function createTour(input: CreateTourInput): Promise<Tour> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const baseSlug = slugifyTourName(input.nomeTour);
  const slug = await ensureUniqueTourSlug(baseSlug, (candidate) =>
    tourSlugExists(candidate, organizationId),
  );

  const { tour: tourPayload, tourLeader } = mapCreateTourInputToInsert(
    input,
    organizationId,
    slug,
  );

  const { data: tourData, error: tourError } = await supabase
    .from(TOURS_TABLE)
    .insert(tourPayload)
    .select("*")
    .single();

  if (tourError) handleSupabaseError("createTour", tourError);

  const tourRow = tourData as TourRow;

  const { error: staffError } = await supabase
    .from(TOUR_STAFF_TABLE)
    .insert(mapTourLeaderStaffInsert(organizationId, tourRow.id, tourLeader));

  if (staffError) handleSupabaseError("createTourStaff", staffError);

  const [tour] = await mapTourRowsToTours([tourRow]);
  await seedDefaultChecklistTemplates(tourRow.id);
  await seedProgramDaysFromTour(
    tourRow.id,
    tourRow.data_partenza,
    tourRow.data_ritorno,
  );
  await recordTourTimelineEvent({
    tourId: tourRow.id,
    tipo: "prenotazione",
    titolo: "Tour creato",
    descrizione: `Tour "${tourRow.nome}" pubblicato su Yagiu OS.`,
  });
  invalidateCaches();
  await getTours();
  return tour;
}

export async function updateTour(
  id: string,
  input: UpdateTourInput,
): Promise<Tour> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const existing = await fetchTourRowById(id);
  if (!existing) {
    throw new TourServiceError(`Tour "${id}" non trovato.`);
  }

  const payload = mapUpdateTourInputToUpdate(input);

  if (input.nomeTour !== undefined) {
    const baseSlug = slugifyTourName(input.nomeTour);
    payload.slug = await ensureUniqueTourSlug(
      buildTourSlug(baseSlug),
      async (candidate) => {
        if (candidate === existing.slug) return false;
        return tourSlugExists(candidate, organizationId);
      },
    );
  }

  const { data, error } = await supabase
    .from(TOURS_TABLE)
    .update(payload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) handleSupabaseError("updateTour", error);

  if (input.tourLeader !== undefined) {
    const leaderName = input.tourLeader.trim();
    const { data: staffRows, error: staffFetchError } = await supabase
      .from(TOUR_STAFF_TABLE)
      .select("*")
      .eq("tour_id", id)
      .eq("ruolo", "tour_leader")
      .limit(1);

    if (staffFetchError) handleSupabaseError("updateTourStaffFetch", staffFetchError);

    const leader = (staffRows?.[0] as TourStaffRow | undefined) ?? null;

    if (leader) {
      const { error: staffUpdateError } = await supabase
        .from(TOUR_STAFF_TABLE)
        .update({ nome: leaderName })
        .eq("id", leader.id);

      if (staffUpdateError) handleSupabaseError("updateTourStaff", staffUpdateError);
    } else {
      const { error: staffInsertError } = await supabase
        .from(TOUR_STAFF_TABLE)
        .insert(mapTourLeaderStaffInsert(organizationId, id, leaderName));

      if (staffInsertError) handleSupabaseError("createTourStaff", staffInsertError);
    }
  }

  const [tour] = await mapTourRowsToTours([data as TourRow]);
  invalidateCaches();
  await getTours();
  return tour;
}

export async function archiveTour(id: string): Promise<Tour> {
  return updateTour(id, { stato: "Archiviato" });
}

export async function deleteTour(id: string): Promise<void> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(TOURS_TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deleteTour", error);

  toursCache = toursCache.filter((tour) => tour.id !== id);
  invalidateCaches();
}

/** Accesso sincrono per mapper e aggregazioni — usa cache aggiornata da getTours/getTour. */
export function getToursSync(): Tour[] {
  return toursCache;
}

export function getTourSync(id: string): Tour | null {
  return toursCache.find((tour) => tour.id === id) ?? null;
}

/** Precarica la cache tour — utile per dashboard e ricerca globale. */
export async function warmTourCache(): Promise<Tour[]> {
  return getTours();
}
