import { getSupabaseClient } from "@/config/supabase";
import { getOrganizationId } from "@/config/organization";
import {
  mapCreatePagamentoInputToInsert,
  mapTourPaymentRowToPagamento,
  mapUpdatePagamentoInputToUpdate,
} from "@/mappers/tour-payment.mapper";
import {
  mapTourPagamentiData,
} from "@/mappers/pagamento.mapper";
import { recordTourTimelineEvent } from "@/services/tour-timeline.service";
import { getPartecipazioniByTourId } from "@/services/tour-partecipazione.service";
import { getActiveTours, getTour } from "@/services/tour.service";
import type { TourPaymentRow } from "@/types/database";
import type { TourStato } from "@/types/tour";
import type {
  CreatePagamentoInput,
  Pagamento,
  TourPagamentiData,
  TourPagamentiRiepilogo,
  UpdatePagamentoInput,
} from "@/types/pagamento";

export class PagamentoServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PagamentoServiceError";
  }
}

const TABLE = "tour_payments";

function handleSupabaseError(operation: string, error: { message: string; code?: string }) {
  throw new PagamentoServiceError(
    `[${operation}] ${error.message}${error.code ? ` (${error.code})` : ""}`,
  );
}

async function fetchPagamentiByTourId(tourId: string): Promise<Pagamento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("tour_id", tourId)
    .order("data", { ascending: false });

  if (error) handleSupabaseError("fetchPagamentiByTourId", error);

  return ((data ?? []) as TourPaymentRow[]).map(mapTourPaymentRowToPagamento);
}

async function buildTourPagamentiData(tourId: string): Promise<TourPagamentiData> {
  const [partecipazioni, pagamenti, tour] = await Promise.all([
    getPartecipazioniByTourId(tourId),
    fetchPagamentiByTourId(tourId),
    getTour(tourId),
  ]);

  return mapTourPagamentiData(
    partecipazioni,
    pagamenti,
    tour?.prezzo ?? "€ 0",
  );
}

export async function getPagamentiByTourId(
  tourId: string,
): Promise<TourPagamentiData> {
  return buildTourPagamentiData(tourId);
}

export async function listAllPagamenti(): Promise<Pagamento[]> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("organization_id", organizationId)
    .order("data", { ascending: false });

  if (error) handleSupabaseError("listAllPagamenti", error);

  return ((data ?? []) as TourPaymentRow[]).map(mapTourPaymentRowToPagamento);
}

export async function createPagamento(
  input: CreatePagamentoInput,
): Promise<TourPagamentiData> {
  if (!input.importo || input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  if (!input.data) {
    throw new PagamentoServiceError("Inserisci la data del pagamento.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(TABLE)
    .insert(mapCreatePagamentoInputToInsert(input, organizationId));

  if (error) handleSupabaseError("createPagamento", error);

  await recordTourTimelineEvent({
    tourId: input.tourId,
    tipo: "pagamento",
    titolo: `${input.tipo} registrato`,
    descrizione: `Pagamento di € ${input.importo} tramite ${input.metodo}.`,
  });

  return buildTourPagamentiData(input.tourId);
}

export async function updatePagamento(
  id: string,
  input: UpdatePagamentoInput,
): Promise<TourPagamentiData> {
  if (input.importo !== undefined && input.importo <= 0) {
    throw new PagamentoServiceError("Inserisci un importo valido.");
  }

  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select("tour_id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("updatePagamentoFetch", fetchError);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  const { error } = await supabase
    .from(TABLE)
    .update(mapUpdatePagamentoInputToUpdate(input))
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("updatePagamento", error);

  return buildTourPagamentiData(current.tour_id as string);
}

export async function deletePagamento(id: string): Promise<TourPagamentiData> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data: current, error: fetchError } = await supabase
    .from(TABLE)
    .select("tour_id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) handleSupabaseError("deletePagamentoFetch", fetchError);
  if (!current) {
    throw new PagamentoServiceError("Pagamento non trovato.");
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) handleSupabaseError("deletePagamento", error);

  return buildTourPagamentiData(current.tour_id as string);
}

export async function getPagamentoById(
  id: string,
): Promise<Pagamento | null> {
  const organizationId = await getOrganizationId();
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) handleSupabaseError("getPagamentoById", error);
  if (!data) return null;

  return mapTourPaymentRowToPagamento(data as TourPaymentRow);
}

export type PagamentoOverviewItem = {
  tourId: string;
  nomeTour: string;
  stato: TourStato;
  riepilogo: TourPagamentiRiepilogo;
};

export async function getPagamentiOverview(): Promise<PagamentoOverviewItem[]> {
  const tours = await getActiveTours();
  const items: PagamentoOverviewItem[] = [];

  for (const tour of tours) {
    const data = await getPagamentiByTourId(tour.id);
    items.push({
      tourId: tour.id,
      nomeTour: tour.nomeTour,
      stato: tour.stato,
      riepilogo: data.riepilogo,
    });
  }

  return items.sort((a, b) => a.nomeTour.localeCompare(b.nomeTour, "it"));
}
